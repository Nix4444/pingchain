import type { Request,Response,NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.CLERK_PUBLIC_KEY_JWT!);
        if (!decoded || !decoded.sub) {
            res.status(401).json({ error: 'Unauthorized' });
        }
        req.userId = decoded.sub as string;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
}
