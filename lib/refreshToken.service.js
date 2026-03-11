import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Hash a token for database storage/comparison
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Save refresh token to database
 */
export async function saveRefreshToken(userId, token, expiresAt, userAgent = null, ipAddress = null) {
    const hashedToken = hashToken(token);
    return await prisma.refreshToken.create({
        data: {
            token: hashedToken,
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
    const hashedToken = hashToken(token);
    return await prisma.refreshToken.findUnique({
        where: { token: hashedToken },
        include: { user: true },
    });
}

/**
 * Delete refresh token (logout)
 */
export async function deleteRefreshToken(token) {
    const hashedToken = hashToken(token);
    return await prisma.refreshToken.delete({
        where: { token: hashedToken },
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
 * Modified to support multiple devices - creates new token without deleting old one
 */
export async function rotateRefreshToken(oldToken) {
    const oldRefreshToken = await findRefreshToken(oldToken);

    if (!oldRefreshToken) {
        return null;
    }

    // Generate new token (keep old one for multi-device support)
    const newToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Save new token (old token remains valid)
    await saveRefreshToken(
        oldRefreshToken.userId,
        newToken,
        expiresAt,
        oldRefreshToken.userAgent,
        oldRefreshToken.ipAddress
    );

    return newToken;
}

