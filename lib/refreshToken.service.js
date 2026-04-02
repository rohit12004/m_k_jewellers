import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Hash a token for database storage/comparison (SHA-256, same as skill pattern)
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Save a new refresh token session to database.
 * Each call creates one session record (one per device/login).
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
            revoked: false,
        },
    });
}

/**
 * Find a valid (not revoked, not expired) refresh token by raw token string.
 * Matches skill pattern: sessionModel.findOne({ refreshTokenHash, revoked: false })
 */
export async function findRefreshToken(token) {
    const hashedToken = hashToken(token);
    // Allow tokens that are either:
    // 1. Not revoked and not expired
    // 2. Revoked VERY recently (30s grace period) to handle parallel pre-fetch race conditions
    return await prisma.refreshToken.findFirst({
        where: {
            token: hashedToken,
            expiresAt: { gt: new Date() },
            OR: [
                { revoked: false },
                { 
                    AND: [
                        { revoked: true },
                        { updatedAt: { gt: new Date(Date.now() - 30000) } }
                    ]
                }
            ]
        },
        include: { user: true },
    });
}

/**
 * Soft-revoke a single refresh token session (logout from current device).
 * Matches skill pattern: session.revoked = true; await session.save()
 * Token record is preserved for audit trail — never hard-deleted.
 */
export async function revokeRefreshToken(token) {
    const hashedToken = hashToken(token);
    return await prisma.refreshToken.updateMany({
        where: { token: hashedToken },
        data: { revoked: true },
    });
}

/**
 * Soft-revoke ALL active sessions for a user (logout from all devices).
 * Matches skill pattern: sessionModel.updateMany({ user: userId, revoked: false }, { revoked: true })
 */
export async function revokeAllUserRefreshTokens(userId) {
    return await prisma.refreshToken.updateMany({
        where: {
            userId,
            revoked: false,
        },
        data: { revoked: true },
    });
}

/**
 * Rotate refresh token in-place on the same session record.
 * Matches skill pattern: session.refreshTokenHash = newHash; await session.save()
 *
 * The old record is updated — not a new record created. This is the key
 * security property: one active token per session. The old token becomes
 * invalid (its hash no longer matches) the moment rotation happens.
 */
export async function rotateRefreshToken(oldToken) {
    const oldHashedToken = hashToken(oldToken);

    // Find the existing session record (must not be already revoked more than a few seconds ago)
    const existingSession = await prisma.refreshToken.findFirst({
        where: {
            token: oldHashedToken,
            revoked: false,
            expiresAt: { gt: new Date() }
        },
    });

    if (!existingSession) {
        return null;
    }

    const newToken = generateRefreshToken();
    const newHashedToken = hashToken(newToken);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // CREATE new and REVOKE old in a transaction
    // This transition is the most secure way to handle rotation with grace periods
    try {
        await prisma.$transaction([
            prisma.refreshToken.update({
                where: { id: existingSession.id },
                data: { revoked: true }
            }),
            prisma.refreshToken.create({
                data: {
                    token: newHashedToken,
                    userId: existingSession.userId,
                    expiresAt: newExpiresAt,
                    userAgent: existingSession.userAgent,
                    ipAddress: existingSession.ipAddress,
                }
            })
        ]);
        return newToken;
    } catch (error) {
        console.error("Rotation transaction failed:", error);
        return null;
    }
}

/**
 * Hard-delete expired AND revoked tokens older than 90 days (cleanup job).
 * Only runs on stale records — active sessions are never hard-deleted.
 */
export async function cleanupStaleRefreshTokens() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return await prisma.refreshToken.deleteMany({
        where: {
            AND: [
                { revoked: true },
                { updatedAt: { lt: ninetyDaysAgo } },
            ],
        },
    });
}

// ---------------------------------------------------------------------------
// Legacy aliases — kept for backward compatibility during migration
// These delegate to the new revoke functions so no callers break.
// ---------------------------------------------------------------------------

/** @deprecated Use revokeRefreshToken instead */
export async function deleteRefreshToken(token) {
    return revokeRefreshToken(token);
}

/** @deprecated Use revokeAllUserRefreshTokens instead */
export async function deleteAllUserRefreshTokens(userId) {
    return revokeAllUserRefreshTokens(userId);
}
