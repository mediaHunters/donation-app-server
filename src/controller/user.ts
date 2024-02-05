import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import mysql, { Pool } from 'mysql' // Import Pool from mysql
import crypto from 'crypto'
import Database from '../config/db'

interface User {
  name: string
  password: string
  surname: string
  phone: string
  vovoidship: string
  email: string
}

class UserController {
  pool: Pool

  constructor() {
    this.pool = Database.getInstance().getPool()
  }

  public register = async (req: Request, res: Response) => {
    const { password, name, surname, phone, vovoidship, email }: User = req.body

    bcrypt.hash(
      password,
      10,
      (hashError: Error | undefined, hashedPassword: string) => {
        if (hashError) throw hashError

        const insertUserQuery =
          'INSERT INTO users (password, name, surname, phone, vovoidship, active, email) VALUES (?, ?, ?, ?, ?, false, ?)'
        this.pool.query(
          insertUserQuery,
          [hashedPassword, name, surname, phone, vovoidship, email],
          (insertError: mysql.MysqlError | null, result: mysql.OkPacket) => {
            if (insertError) throw insertError

            const userId: number = result.insertId
            const verificationHash: string = crypto
              .randomBytes(64)
              .toString('hex')

            const insertHashQuery =
              'INSERT INTO verification_hashes (user_id, hash) VALUES (?, ?)'
            this.pool.query(
              insertHashQuery,
              [userId, verificationHash],
              (hashError: mysql.MysqlError | null) => {
                if (hashError) throw hashError
                const verificationLink: string = `http://localhost:3000/verify/${verificationHash}`
                res.status(201).json({
                  message: 'Registration successful. Verification email sent.',
                  verificationLink,
                })
              },
            )
          },
        )
      },
    )
  }
}

export default UserController

// const emailOptions = {
//   from: "adrian.turbinski@gmail.com",
//   to: email, // Use the provided email
//   subject: "Account Verification",
//   text: `Click the following link to verify your account: http://localhost:3000/verify/=${verificationHash}`,
// };
// sgMail.setApiKey(
//   "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"
// );
//   sgMail
//     .send(emailOptions)
//     .then((status) => {
//       console.log(status);
//       res.status(201).json({
//         message:
//           "Registration successful. Verification email sent.",
//       });
//     })
//     .catch((emailError) => {
//       throw emailError;
//     });
