// ... existing imports ...
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/adminPanelRoutes"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/websiteRoutes"


// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
    '/api/subcategory/get-all',
    '/api/product/get-by-subcategory',
    '/api/product/filter-options',
    '/api/product/details',
    '/api/category/get-featured-categories',
    '/api/cart/calculate-prices',
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


        if (!access_token) {
            // Check if it's a public API route
            const isPublicApi = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

            if (isPublicApi) {
                // Allow public API access without authentication
                return addCorsHeaders(NextResponse.next(), request);
            }


            // Allow refresh endpoint without valid access token
            if (pathname === '/api/auth/refresh') {
                return addCorsHeaders(NextResponse.next(), request);
            }

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

        // verify token 
        const { payload } = await jwtVerify(access_token, new TextEncoder().encode(process.env.SECRET_KEY))
        const role = payload.role

        // Block logged-in users from accessing auth pages (Web only mainly, API doesn't care much but good to block)
        if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
            // Exception: Allow email verification page even if logged in
            if (pathname.startsWith('/auth/verify-email')) {
                return NextResponse.next();
            }

            // Exception: Allow refresh endpoint even if logged in
            if (pathname === '/api/auth/refresh') {
                return NextResponse.next();
            }

            if (pathname.startsWith('/api')) {
                // Allow POST requests to auth endpoints even if logged in (e.g. switching accounts, or stale token)
                // specifically for register/login/verify-otp/reset-password
                if (request.method === 'POST') {
                    return NextResponse.next();
                }

                // Allow PUT requests for reset-password routes (update password)
                if (request.method === 'PUT' && pathname.startsWith('/api/auth/reset-password')) {
                    return NextResponse.next();
                }

                // Allow GET request for session check
                if (request.method === 'GET' && pathname === '/api/auth/session') {
                    return NextResponse.next();
                }

                // For other methods (GET, DELETE, etc.), block them or return JSON
                return NextResponse.json({ success: false, message: "You are already logged in" }, { status: 400 });
            }
            return NextResponse.redirect(new URL(role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD, request.nextUrl))
        }

        // Protect Admin Routes
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return forbiddenParams("Access denied: Admins only");
        }

        // Protect Admin API Routes (if you have specific /api/admin paths)
        // Adjust this if your admin APIs follow a specific pattern like /api/admin
        // The current file doesn't explicitly show /api/admin checks but let's be safe if they exist.

        // Protect User Routes
        if (pathname.startsWith('/my-account') && role !== 'user') {
            return forbiddenParams("Access denied", WEBSITE_LOGIN);
        }

        // Protect Checkout and Order Details (require user to be logged in)
        if ((pathname.startsWith('/checkout') || pathname.startsWith('/order-details')) && role !== 'user') {
            return forbiddenParams("Please login to continue", WEBSITE_LOGIN);
        }

        return addCorsHeaders(NextResponse.next(), request);

    } catch (error) {
        // Check if it's a JWT expiration error
        const isJWTExpired = error.code === 'ERR_JWT_EXPIRED';

        if (isJWTExpired) {
            console.log('🔄 [MIDDLEWARE] Access token expired, attempting refresh...');

            // Try to refresh the token
            const refreshToken = request.cookies.get('refresh_token')?.value;

            if (refreshToken) {
                console.log('✅ [MIDDLEWARE] Refresh token found, calling refresh endpoint...');
                try {
                    // Call the refresh endpoint
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
                            console.log('✅ [MIDDLEWARE] Token refreshed successfully');

                            // Create response with new access token
                            const response = NextResponse.next();

                            // Set new access token cookie
                            response.cookies.set('access_token', refreshData.data.accessToken, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                maxAge: 15 * 60 // 15 minutes
                            });

                            // If new refresh token provided, update it
                            if (refreshData.data.refreshToken) {
                                response.cookies.set('refresh_token', refreshData.data.refreshToken, {
                                    httpOnly: true,
                                    secure: process.env.NODE_ENV === 'production',
                                    sameSite: 'lax',
                                    maxAge: 30 * 24 * 60 * 60 // 30 days
                                });
                            }

                            return addCorsHeaders(response, request);
                        }
                    } else {
                        console.log('❌ [MIDDLEWARE] Refresh failed:', refreshResponse.status);
                    }
                } catch (refreshError) {
                    console.error('❌ [MIDDLEWARE] Refresh error:', refreshError.message);
                }
            } else {
                console.log('❌ [MIDDLEWARE] No refresh token found');
            }
        }

        // If refresh failed or not a JWT expiration, redirect/return error
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
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