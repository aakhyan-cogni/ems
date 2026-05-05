import { Request, Response, NextFunction } from 'express';
import { events } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

/**
 * Middleware to enforce event publishing limits based on user tiers.
 * Blocks request if a FREE user attempts to exceed the active event limit.
 */
export async function tierCheck(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = req.user;

        // Admins bypass tier restrictions
        if (user.role === 'ADMIN') {
            return next();
        }

        const eventCollection = await events();

        // Count how many events this user has that are currently APPROVED
        const approvedCount = await eventCollection.countDocuments({
            organizerId: new ObjectId(user.userId),
            status: "APPROVED"
        });

        // Define your business limits
        const LIMITS: Record<string, number> = {
            FREE: 2,
            PRO: 10,
            ENTERPRISE: 100
        };

        const userLimit = LIMITS[user.tier] || 0;

        if (approvedCount >= userLimit) {
            return res.status(403).json({
                code: "TIER_LIMIT_EXCEEDED",
                message: `You have reached the limit of ${userLimit} active events for the ${user.tier} tier.`,
                limit: userLimit,
                current: approvedCount
            });
        }

        next();
    } catch (error) {
        console.error("[tierCheck] Error verifying tier limits:", error);
        res.status(500).json({ message: "Error verifying tier limits" });
    }
}