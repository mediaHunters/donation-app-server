import { Request, Response } from 'express';
import { Pool } from 'mysql';
declare class UserController {
    pool: Pool;
    constructor();
    register: (req: Request, res: Response) => Promise<void>;
}
export default UserController;
