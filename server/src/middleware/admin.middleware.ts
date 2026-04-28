import { Request, Response, NextFunction } from "express";

export function adminOnly(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({ message: "Forbidden: Admins only" });
        return;
    }
    next();
}