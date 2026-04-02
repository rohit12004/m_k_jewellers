// ... existing imports ...
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/adminPanelRoutes"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/websiteRoutes"


// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
    '/api/subcategory/get-all',
    '/api/product/get-by-subcategory',
    '/api/product/get-featured-products', // ✅ Added for mobile app compatibility
    '/api/product/filter-options',
    '/api/product/details',
    '/api/category/get-featured-categories',
    '/api/cart/calculate-prices',
    '/api/chatbot', // Allow chatbot access for all users
];

export async function middleware(request) {
    const pathname = request.nextUrl.pathname

    if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
        const response = new NextResponse(null, { status: 200 })
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
    }

    try {
        let access_token;

        // 1. Try to get token from cookies (Web)
        if (request.cookies.has('access_token')) {
            access_token = request.cookies.get('access_token').value;
        }
        // 2. Try to get token from Authorization header (Mobile/API)
        else if (request.headers.get('Authorization')?.startsWith('Bearer ')) {
            access_token = request.headers.get('Authorization').split(' ')[1];
        }

        // Helper to return 401/403 for API or Redirect for Web
        const unauthorizedParams = (msg = "Unauthorized") => {
            if (pathname.startsWith('/api')) {
                return NextResponse.json({ success: false, message: msg }, { status: 401 });
            }
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl));
        }

        const forbiddenParams = (msg = "Forbidden", redirectUrl = WEBSITE_LOGIN) => {
            if (pathname.startsWith('/api')) {
                return NextResponse.json({ success: false, message: msg }, { status: 403 });
            }
            return NextResponse.redirect(new URL(redirectUrl, request.nextUrl));
        }

        // ✅ Check if it's a public API route FIRST (before token verification)
        const isPublicApi = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

        if (isPublicApi) {
            // Allow public API access without authentication (even with expired token)
            return addCorsHeaders(NextResponse.next(), request);
        }

        // Allow refresh endpoint without valid access token
        if (pathname === '/api/auth/refresh') {
            return addCorsHeaders(NextResponse.next(), request);
        }

        if (!access_token) {
            // Public website routes that don't require authentication
            const publicWebsiteRoutes = [
                '/',
                '/shop',
                '/product',
                '/cart',
                '/about-us',
                '/privacy-policy',
            ];

            const isPublicWebsitePage = publicWebsiteRoutes.some(route =>
                pathname === route || pathname.startsWith(route + '/')
            );

            if (isPublicWebsitePage) {
                return addCorsHeaders(NextResponse.next(), request);
            }

            // Unprotected routes check
            if (!pathname.startsWith('/auth') && !pathname.startsWith('/api/auth')) {
                // If it is NOT an auth route and NOT a public API, it needs a token
                return unauthorizedParams("Please login to access this resource");
            }
            // Allow access to auth routes (login/register)
            return addCorsHeaders(NextResponse.next(), request);
        }

        // ... verify token ...
        let payload;
        let role;

        if (access_token) {
            try {
                const verified = await jwtVerify(access_token, new TextEncoder().encode(process.env.SECRET_KEY))
                payload = verified.payload
                role = payload.role
            } catch (error) {
                if (error.code !== 'ERR_JWT_EXPIRED') {
                    throw error; // Re-throw to be caught by the main catch block
                }
                // Token expired - fall through to refresh logic below
            }
        }

        // If no valid access token (missing or expired), try to refresh
        if (!payload) {
            const refreshToken = request.cookies.get('refresh_token')?.value;

            if (refreshToken) {
                console.log('🔄 [MIDDLEWARE] Attempting session restoration via refresh token...');
                try {
                    const refreshResponse = await fetch(new URL('/api/auth/refresh', request.nextUrl).toString(), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie': `refresh_token=${refreshToken}`
                        },
                        credentials: 'include'
                    });

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        if (refreshData.success && refreshData.data?.accessToken) {
                            console.log('✅ [MIDDLEWARE] Session restored successfully');

                            // Re-verify the new token to get the user info for the rest of the middleware
                            const verified = await jwtVerify(refreshData.data.accessToken, new TextEncoder().encode(process.env.SECRET_KEY));
                            payload = verified.payload;
                            role = payload.role;

                            // Create response and set new cookies
                            let response = NextResponse.next();
                            
                            // Redirect if on auth pages
                            if (pathname.startsWith('/auth')) {
                                const targetUrl = role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD;
                                response = NextResponse.redirect(new URL(targetUrl, request.nextUrl));
                            }

                            response.cookies.set('access_token', refreshData.data.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                maxAge: 24 * 60 * 60
                            });

                            if (refreshData.data.refreshToken) {
                                response.cookies.set('refresh_token', refreshData.data.refreshToken, {
                                    httpOnly: true,
                                    secure: process.env.NODE_ENV === 'production',
                                    sameSite: 'lax',
                                    maxAge: 30 * 24 * 60 * 60
                                });
                            }

                            // CONTINUE with the rest of the middleware logic using the NEW role/payload
                            // We return early here with the modified response if we need to enforce role protection
                            // BUT we must check role protection BEFORE returning.
                            
                            // Protect Admin Routes
                            if (pathname.startsWith('/admin') && role !== 'admin') {
                                return forbiddenParams("Access denied: Admins only");
                            }
                            // Protect User Routes
                            if (pathname.startsWith('/my-account') && role !== 'user') {
                                return forbiddenParams("Access denied", WEBSITE_LOGIN);
                            }
                            if ((pathname.startsWith('/checkout') || pathname.startsWith('/order-details')) && role !== 'user') {
                                return forbiddenParams("Please login to continue", WEBSITE_LOGIN);
                            }

                            return addCorsHeaders(response, request);
                        }
                    }
                } catch (refreshError) {
                    console.error('❌ [MIDDLEWARE] Restoration error:', refreshError.message);
                }
            }

            // If we still have no payload after refresh attempt, handle as unauthorized
            const publicWebsiteRoutes = ['/', '/shop', '/product', '/cart', '/about-us', '/privacy-policy'];
            const isPublicWebsitePage = publicWebsiteRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

            if (!isPublicWebsitePage && !pathname.startsWith('/auth') && !pathname.startsWith('/api/auth')) {
                return unauthorizedParams("Please login to access this resource");
            }
            
            return addCorsHeaders(NextResponse.next(), request);
        }

        // --- NORMAL AUTHENTICATED FLOW (Payload exists) ---

        // Block logged-in users from accessing auth pages
        if (pathname.startsWith('/auth')) {
            if (pathname.startsWith('/auth/verify-email')) {
                return NextResponse.next();
            }
            return NextResponse.redirect(new URL(role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD, request.nextUrl));
        }

        // Handle API auth routes
        if (pathname.startsWith('/api/auth')) {
            if (pathname === '/api/auth/refresh' || pathname === '/api/auth/session' || pathname === '/api/auth/me') {
                return NextResponse.next();
            }
            if (request.method === 'POST' || (request.method === 'PUT' && pathname.startsWith('/api/auth/reset-password'))) {
                return NextResponse.next();
            }
            return NextResponse.json({ success: false, message: "You are already logged in" }, { status: 400 });
        }

        // Protect Admin Routes
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return forbiddenParams("Access denied: Admins only");
        }

        // Protect User Routes
        if (pathname.startsWith('/my-account') && role !== 'user') {
            return forbiddenParams("Access denied", WEBSITE_LOGIN);
        }

        // Protect Checkout and Order Details
        if ((pathname.startsWith('/checkout') || pathname.startsWith('/order-details')) && role !== 'user') {
            return forbiddenParams("Please login to continue", WEBSITE_LOGIN);
        }

        return addCorsHeaders(NextResponse.next(), request);

    } catch (error) {
        console.error('❌ [MIDDLEWARE] Critical error:', error.message);
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
        }
        return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
    }
}

// Helper to add CORS headers to any response
function addCorsHeaders(response, request) {
    if (request.nextUrl.pathname.startsWith('/api')) {
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
    return response;
}


export const config = {
    matcher: ['/admin/:path*', '/my-account/:path*', '/checkout/:path*', '/order-details/:path*', '/auth/:path*', '/api/:path*']
}