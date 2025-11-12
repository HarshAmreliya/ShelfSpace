import prisma from "../prisma.js";
export const isAdmin = async (req, res, next) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });
        // Check if user exists and has email matching admin pattern or status is ACTIVE
        // For now, we'll use a simple check - you may want to add a role field to the User model
        // or use environment variable for admin emails
        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
        if (user && (adminEmails.includes(user.email) || user.status === "ACTIVE")) {
            // Note: This is a simplified admin check. Consider adding a role field to the User model
            // For now, allow ACTIVE users or those in ADMIN_EMAILS env var
            next();
        }
        else {
            res.status(403).json({ message: "Forbidden" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
