"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
class AuthorizationController {
    constructor() {
        this.secretKey = 'yourSecretKey';
        this.verifyEmail = (req, res) => {
            const { hash } = req.params;
            const findHashQuery = 'SELECT * FROM verification_hashes WHERE hash = ?';
            this.pool.query(findHashQuery, [hash], (error, results) => {
                if (error)
                    throw error;
                if (results.length === 0) {
                    return res.status(404).json({ message: 'Invalid verification link' });
                }
                const userId = results[0].user_id;
                const activateUserQuery = 'UPDATE users SET active = true WHERE id = ?';
                this.pool.query(activateUserQuery, [userId], (activateError) => {
                    if (activateError)
                        throw activateError;
                    // Delete verification hash after activation
                    const deleteHashQuery = 'DELETE FROM verification_hashes WHERE hash = ?';
                    this.pool.query(deleteHashQuery, [hash], (deleteError) => {
                        if (deleteError)
                            throw deleteError;
                        res.status(200).json({ message: 'Email verification successful' });
                    });
                });
            });
        };
        this.pool = db_1.default.getInstance().getPool();
    }
    verifyToken(req, res, next) {
        var _a;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token)
            return res.status(401).json({ message: 'Access denied' });
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.secretKey);
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(400).json({ message: 'Invalid token' });
        }
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign(user, this.secretKey, { expiresIn: '1h' });
    }
    login(req, res) {
        const { username, password } = req.body;
        const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
        this.pool.query(checkUserQuery, [username], (error, results) => {
            if (error)
                throw error;
            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            const user = results[0];
            bcrypt_1.default.compare(password, user.password, (compareError, passwordMatch) => {
                if (compareError)
                    throw compareError;
                if (!passwordMatch) {
                    return res.status(401).json({ message: 'Invalid password' });
                }
                const token = this.generateToken({
                    id: user.id,
                    username: user.username,
                });
                res.json({ token });
            });
        });
    }
}
exports.default = AuthorizationController;
