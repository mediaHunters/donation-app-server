import express, { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mysql, { PoolConnection } from 'mysql'
import Database from '../config/db'

class AuthorizationController {
  private secretKey = 'yourSecretKey'
  pool: mysql.Pool

  constructor() {
    this.pool = Database.getInstance().getPool()
  }

  verifyToken: express.RequestHandler = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Access denied' })

    try {
      req.user = jwt.verify(token, this.secretKey)
      next()
    } catch (error) {
      res.status(400).json({ message: 'Invalid token' })
    }
  }

  generateToken = (user: { id: number; username: string }) =>
    jwt.sign(user, this.secretKey, { expiresIn: '1h' })

  login: express.RequestHandler = (req, res) => {
    const { username, password } = req.body
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?'

    this.pool.query(checkUserQuery, [username], (error, results) => {
      if (error) throw error

      if (results.length === 0)
        return res.status(404).json({ message: 'User not found' })

      const user = results[0]

      bcrypt.compare(password, user.password, (compareError, passwordMatch) => {
        if (compareError) throw compareError
        if (!passwordMatch)
          return res.status(401).json({ message: 'Invalid password' })

        const token = this.generateToken({
          id: user.id,
          username: user.username,
        })
        res.json({ token })
      })
    })
  }

  verifyEmail: express.RequestHandler = (req, res) => {
    const { hash } = req.params
    const findHashQuery = 'SELECT * FROM verification_hashes WHERE hash = ?'

    this.pool.getConnection((getConnectionError, connection) => {
      if (getConnectionError) throw getConnectionError
      connection.beginTransaction((beginError) => {
        if (beginError) throw beginError

        const rollbackAndRelease = () => {
          connection.rollback(() => connection.release())
        }

        connection.query(findHashQuery, [hash], (error, results) => {
          if (error) {
            rollbackAndRelease()
            throw error
          }

          if (results.length === 0) {
            rollbackAndRelease()
            return res
              .status(404)
              .json({ message: 'Invalid verification link' })
          }

          const userId = results[0].user_id
          const activateUserQuery =
            'UPDATE users SET active = true WHERE id = ?'

          connection.query(activateUserQuery, [userId], (activateError) => {
            if (activateError) {
              rollbackAndRelease()
              throw activateError
            }

            const deleteHashQuery =
              'DELETE FROM verification_hashes WHERE hash = ?'
            connection.query(deleteHashQuery, [hash], (deleteError) => {
              if (deleteError) {
                rollbackAndRelease()
                throw deleteError
              }

              connection.commit((commitError) => {
                if (commitError) {
                  rollbackAndRelease()
                  throw commitError
                }

                connection.release()
                res
                  .status(200)
                  .json({ message: 'Email verification successful' })
              })
            })
          })
        })
      })
    })
  }
}

export default AuthorizationController
