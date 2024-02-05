"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../config/db"));
class UserController {
    constructor() {
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { password, name, surname, phone, vovoidship, email } = req.body;
            bcrypt_1.default.hash(password, 10, (hashError, hashedPassword) => {
                if (hashError)
                    throw hashError;
                const insertUserQuery = 'INSERT INTO users (password, name, surname, phone, vovoidship, active, email) VALUES (?, ?, ?, ?, ?, false, ?)';
                this.pool.query(insertUserQuery, [hashedPassword, name, surname, phone, vovoidship, email], (insertError, result) => {
                    if (insertError)
                        throw insertError;
                    const userId = result.insertId;
                    const verificationHash = crypto_1.default
                        .randomBytes(64)
                        .toString('hex');
                    const insertHashQuery = 'INSERT INTO verification_hashes (user_id, hash) VALUES (?, ?)';
                    this.pool.query(insertHashQuery, [userId, verificationHash], (hashError) => {
                        if (hashError)
                            throw hashError;
                        const verificationLink = `http://localhost:3000/verify/${verificationHash}`;
                        res.status(201).json({
                            message: 'Registration successful. Verification email sent.',
                            verificationLink,
                        });
                    });
                });
            });
        });
        this.pool = db_1.default.getInstance().getPool();
    }
}
exports.default = UserController;
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
