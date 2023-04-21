"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = exports.db = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
exports.db = mysql2_1.default.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'example',
    database: 'chat',
});
class UserRepository {
    readById(id) {
        return new Promise((resolve, reject) => {
            exports.db.query("SELECT * FROM users WHERE id = ?", [id], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res === null || res === void 0 ? void 0 : res[0]);
            });
        });
    }
    createUser(user) {
        return new Promise((resolve, reject) => {
            exports.db.query("INSERT INTO users (id, nickname) VALUES(?,?)", [user.id, user.nick], (err, res) => {
                if (err)
                    reject(err);
                else
                    this.readById(res.)
                        .then(user => resolve(user))
                        .catch(reject);
            });
        });
    }
}
exports.UserRepository = UserRepository;
