import express, { Request, Response, NextFunction } from 'express'
import UserController from './controller/user'
import AuthorizationController from './controller/authorization'
import Database from './config/db'
import UserCreateTable from './config/entities/user'

const app: express.Application = express()
const PORT: number = 3000

Database.getInstance()
UserCreateTable.createUsersTable()

app.use(express.json())

const authorizationController: AuthorizationController =
  new AuthorizationController()
const userController: UserController = new UserController()

app.post('/register', userController.register)
app.get('/verify/:hash', authorizationController.verifyEmail)
app.post('/login', authorizationController.login)

app.post(
  '/refresh-token',
  authorizationController.verifyToken,
  (req: Request & { user?: any }, res: Response) => {
    const user: any = req.user
    const newToken: string = authorizationController.generateToken({
      id: user.id,
      username: user.username,
    })
    res.json({ token: newToken })
  },
)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
