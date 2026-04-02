import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/adminPanelRoutes"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/websiteRoutes"

// Routes configuration
const PUBLIC_API_ROUTES = [
    '/api/subcategory/get-all',
    '/api/product/get-by-subcategory',
    '/api/product/get-featured-products',
    '/api/product/filter-options',
    '/api/product/details',
    '/api/category/get-featured-categories',
    '/api/cart/calculate-prices',
    '/api/chatbot',
    '/api/auth/refresh'
];

const PUBLIC_WEB_ROUTES = ['/', '/shop', '/product', '/cart', '/about-us', '/privacy-policy'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
        return addCorsHeaders(new NextResponse(null, { status: 200 }));
    }

    // 2. Public route check
    const isPublicApi = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
    const isPublicWeb = PUBLIC_WEB_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
    if (isPublicApi || isPublicWeb) return addCorsHeaders(NextResponse.next(), request);

    // 3. Get and Verify Token
    let token = request.cookies.get('access_token')?.value || request.headers.get('Authorization')?.split(' ')[1];
    let payload = null;

    if (token) {
        try {
            const { payload: verifiedPayload } = await jwtVerify(token, secret);
            payload = verifiedPayload;
        } catch (e) {
            if (e.code !== 'ERR_JWT_EXPIRED') console.error('Token Error:', e.message);
        }
    }

    // 4. Session Restoration (only if not a prefetch)
    const isPrefetch = request.headers.get('next-router-prefetch') || request.headers.get('purpose') === 'prefetch';
    let newResponse = null;

    if (!payload && !isPrefetch) {
        const refreshToken = request.cookies.get('refresh_token')?.value;
        if (refreshToken) {
            try {
                // Call external-facing refresh API using full URL
                const refreshRes = await fetch(new URL('/api/auth/refresh', request.nextUrl), {
                    method: 'POST',
                    headers: { 'Cookie': `refresh_token=${refreshToken}` }
                });
                const refreshData = await refreshRes.json();
                
                if (refreshData.success && refreshData.data?.accessToken) {
                    const { payload: newPayload } = await jwtVerify(refreshData.data.accessToken, secret);
                    payload = newPayload;

                    // Update request cookies so Server Components (like Root Layout) 
                    // see the new session immediately in the same request.
                    request.cookies.set('access_token', refreshData.data.accessToken);
                    if (refreshData.data.refreshToken) {
                        request.cookies.set('refresh_token', refreshData.data.refreshToken);
                    }

                    newResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    setAuthCookies(newResponse, refreshData.data);
                }
            } catch (e) { 
                console.error('Middleware Refresh Error:', e.message); 
            }
        }
    }

    // 5. Authorization Logic
    const role = payload?.role;
    const isAuthPath = pathname.startsWith('/auth') || pathname.startsWith('/api/auth');
    const isAdminPath = pathname.startsWith('/admin');
    const isUserPath = ['/my-account', '/checkout', '/order-details'].some(p => pathname.startsWith(p));

    // Redirect logged-in users away from login/register
    if (payload && isAuthPath && !pathname.includes('verify-email')) {
        return NextResponse.redirect(new URL(role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD, request.nextUrl));
    }

    // Protect administrative and user-restricted areas
    if (!payload) {
        if (isAdminPath || isUserPath || (pathname.startsWith('/api') && !isAuthPath)) {
            return unauthorizedResponse(request, pathname);
        }
    } else {
        if (isAdminPath && role !== 'admin') return forbiddenResponse(request, "Admins only");
        if (isUserPath && role !== 'user') return forbiddenResponse(request, "Access denied");
    }

    // 6. Return response with security headers and updated cookies
    const finalResponse = newResponse || NextResponse.next();
    
    // Add Security Headers
    addSecurityHeaders(finalResponse);
    
    return addCorsHeaders(finalResponse, request);
}

// Helpers
function addSecurityHeaders(res) {
    const isProd = process.env.NODE_ENV === 'production';
    
    // Content Security Policy
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload-widget.cloudinary.com https://checkout.razorpay.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: res.cloudinary.com images.unsplash.com;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://api.cloudinary.com https://api.razorpay.com;
        frame-src 'self' https://upload-widget.cloudinary.com https://checkout.razorpay.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        ${isProd ? 'upgrade-insecure-requests;' : ''}
    `.replace(/\s{2,}/g, ' ').trim();

    res.headers.set('Content-Security-Policy', cspHeader);
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocations=()');
    
    if (isProd) {
        res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
}

function setAuthCookies(res, data) {
    const common = { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        path: '/'
    };
    // Access token matches the 15m lifetime
    res.cookies.set('access_token', data.accessToken, { ...common, maxAge: 15 * 60 });
    if (data.refreshToken) {
        res.cookies.set('refresh_token', data.refreshToken, { ...common, maxAge: 30 * 24 * 60 * 60 });
    }
}

function unauthorizedResponse(req, path) {
    if (path.startsWith('/api')) return NextResponse.json({ success: false, message: "Please login" }, { status: 401 });
    return NextResponse.redirect(new URL(WEBSITE_LOGIN, req.nextUrl));
}

function forbiddenResponse(req, error, errorObj = {}) {
    if (req.nextUrl.pathname.startsWith('/api')) {
        const statusCode = error.statusCode || (error.code === 'P2002' ? 409 : 500);
        return NextResponse.json({
            success: false,
            statusCode: statusCode,
            ...errorObj
        }, { status: statusCode })
    }
    return NextResponse.redirect(new URL(WEBSITE_LOGIN, req.nextUrl));
}

function addCorsHeaders(res, req) {
    if (req?.nextUrl.pathname.startsWith('/api') || !req) {
        res.headers.set('Access-Control-Allow-Origin', '*');
        res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/my-account/:path*', '/checkout/:path*', '/order-details/:path*', '/auth/:path*', '/api/:path*']
}