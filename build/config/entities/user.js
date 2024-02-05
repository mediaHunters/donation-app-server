"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
class UserCreateTable {
    static createUsersTable() {
        const pool = db_1.default.getInstance().getPool();
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        active BOOLEAN DEFAULT false,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        vovoidship VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
      )
    `;
        pool.query(createTableQuery, (error) => {
            if (error)
                throw error;
            console.log('Users table created or already exists');
            this.createVerificationHashesTable(pool);
        });
    }
    static createVerificationHashesTable(pool) {
        const createVerificationHashesTableQuery = `
      CREATE TABLE IF NOT EXISTS verification_hashes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        hash VARCHAR(255) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
        pool.query(createVerificationHashesTableQuery, (error) => {
            if (error)
                throw error;
            console.log('Verification hashes table created or already exists');
        });
    }
}
exports.default = UserCreateTable;
