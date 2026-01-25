import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * API Route for OTP Cleanup Cron Job
 * This should be called by an external cron service (Vercel Cron, GitHub Actions, etc.)
 * or manually triggered for testing
 * 
 * For production: Use Vercel Cron Jobs or similar service
 * https://vercel.com/docs/cron-jobs
 */
export async function GET(request) {
    try {
        // Optional: Add authentication to prevent unauthorized access
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        // Verify cron secret if set in environment
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        console.log("🧹 Starting OTP cleanup job at", new Date().toISOString());

        // Delete expired OTPs
        const result = await prisma.oTP.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });

        console.log(`✅ Deleted ${result.count} expired OTP(s)`);

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.count} expired OTP(s)`,
            deletedCount: result.count,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("❌ OTP cleanup job failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to cleanup expired OTPs",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
