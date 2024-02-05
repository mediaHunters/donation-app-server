import * as mysql from 'mysql';
declare class Database {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): Database;
    getPool(): mysql.Pool;
}
export default Database;
