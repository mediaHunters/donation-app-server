import { Pool, MysqlError } from 'mysql'
import Database from '../db'

class UserCreateTable {
  static createUsersTable() {
    const pool: Pool = Database.getInstance().getPool()

    const createTableQuery: string = `
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
    `

    pool.query(createTableQuery, (error: MysqlError | null) => {
      if (error) throw error
      console.log('Users table created or already exists')

      this.createVerificationHashesTable(pool)
    })
  }

  static createVerificationHashesTable(pool: Pool) {
    const createVerificationHashesTableQuery: string = `
      CREATE TABLE IF NOT EXISTS verification_hashes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        hash VARCHAR(255) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    pool.query(
      createVerificationHashesTableQuery,
      (error: MysqlError | null) => {
        if (error) throw error
        console.log('Verification hashes table created or already exists')
      },
    )
  }
}

export default UserCreateTable
