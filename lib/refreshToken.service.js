import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Save refresh token to database
 */
export async function saveRefreshToken(userId, token, expiresAt, userAgent = null, ipAddress = null) {
    return await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt,
            userAgent,
            ipAddress,
        },
    });
}

/**
 * Find refresh token by token string
 */
export async function findRefreshToken(token) {
    return await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });
}

/**
 * Delete refresh token (logout)
 */
export async function deleteRefreshToken(token) {
    return await prisma.refreshToken.delete({
        where: { token },
    });
}

/**
 * Delete all refresh tokens for a user (logout all devices)
 */
export async function deleteAllUserRefreshTokens(userId) {
    return await prisma.refreshToken.deleteMany({
        where: { userId },
    });
}

/**
 * Delete expired refresh tokens (cleanup job)
 */
export async function deleteExpiredRefreshTokens() {
    return await prisma.refreshToken.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}

/**
 * Rotate refresh token (security best practice)
 */
export async function rotateRefreshToken(oldToken) {
    const oldRefreshToken = await findRefreshToken(oldToken);

    if (!oldRefreshToken) {
        return null;
    }

    // Delete old token
    await deleteRefreshToken(oldToken);

    // Generate new token
    const newToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Save new token
    await saveRefreshToken(
        oldRefreshToken.userId,
        newToken,
        expiresAt,
        oldRefreshToken.userAgent,
        oldRefreshToken.ipAddress
    );

    return newToken;
}
