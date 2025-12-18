import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function PUT(req) {
    try {
        // Get token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized - Please login first"
            }, { status: 401 });
        }

        // Verify token and get user ID
        try {
            const secret = new TextEncoder().encode(process.env.SECRET_KEY);
            const { payload } = await jwtVerify(token, secret);

            if (!payload || !payload.id) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid token"
                }, { status: 401 });
            }

            // Get request body
            const body = await req.json();
            const { name, phone, address } = body;

            // Validation
            if (!name || !phone || !address) {
                return NextResponse.json({
                    success: false,
                    message: "Name, phone, and address are required"
                }, { status: 400 });
            }

            // Validate phone number (10 digits)
            if (!/^[0-9]{10}$/.test(phone)) {
                return NextResponse.json({
                    success: false,
                    message: "Please enter a valid 10-digit phone number"
                }, { status: 400 });
            }

            // Update user in database
            const updatedUser = await prisma.user.update({
                where: {
                    id: payload.id
                },
                data: {
                    name,
                    phone,
                    address
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    role: true,
                    avatarUrl: true,
                    createdAt: true
                }
            });

            return NextResponse.json({
                success: true,
                message: "Profile updated successfully",
                data: updatedUser
            }, { status: 200 });

        } catch (jwtError) {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired token"
            }, { status: 401 });
        }

    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to update profile"
        }, { status: 500 });
    }
}
