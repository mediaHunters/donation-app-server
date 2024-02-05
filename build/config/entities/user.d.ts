import { Pool } from 'mysql';
declare class UserCreateTable {
    static createUsersTable(): void;
    static createVerificationHashesTable(pool: Pool): void;
}
export default UserCreateTable;
