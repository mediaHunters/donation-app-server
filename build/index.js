"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./controller/user"));
const authorization_1 = __importDefault(require("./controller/authorization"));
const db_1 = __importDefault(require("./config/db"));
const user_2 = __importDefault(require("./config/entities/user"));
const app = (0, express_1.default)();
const PORT = 3000;
db_1.default.getInstance();
user_2.default.createUsersTable();
app.use(express_1.default.json());
const authorizationController = new authorization_1.default();
const userController = new user_1.default();
app.post('/register', userController.register);
app.get('/verify/:hash', authorizationController.verifyEmail);
app.post('/login', authorizationController.login);
app.post('/refresh-token', authorizationController.verifyToken, (req, res) => {
    const user = req.user;
    const newToken = authorizationController.generateToken({
        id: user.id,
        username: user.username,
    });
    res.json({ token: newToken });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
