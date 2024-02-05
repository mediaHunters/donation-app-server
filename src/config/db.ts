import * as mysql from 'mysql'

class Database {
  private static instance: Database
  private pool: mysql.Pool

  private constructor() {
    this.pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      database: 'donation_app',
    })
  }

  static getInstance(): Database {
    if (!this.instance) {
      this.instance = new Database()
    }
    return this.instance
  }

  getPool(): mysql.Pool {
    return this.pool
  }
}

export default Database
