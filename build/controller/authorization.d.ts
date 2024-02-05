import express, { Request, Response, NextFunction } from 'express';
import mysql from 'mysql';
declare class AuthorizationController {
    private secretKey;
    pool: mysql.Pool;
    constructor();
    verifyToken(req: Request & {
        user?: any;
    }, res: Response, next: NextFunction): express.Response<any, Record<string, any>> | undefined;
    generateToken(user: {
        id: number;
        username: string;
    }): string;
    login(req: Request, res: Response): void;
    verifyEmail: (req: Request, res: Response) => void;
}
export default AuthorizationController;
