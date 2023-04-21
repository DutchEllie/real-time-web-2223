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
exports.MessageRepository = exports.ChannelRepository = exports.UserRepository = exports.db = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
exports.db = mysql2_1.default.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'example',
    database: 'chat',
});
class UserRepository {
    findAllInChannel(channel) {
        return new Promise((resolve, reject) => {
            exports.db.query(`
				SELECT * FROM users
				WHERE channel_id = ?`, [channel.id], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
        });
    }
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
    createUser(id, nick) {
        return new Promise((resolve, reject) => {
            exports.db.query("INSERT INTO users (id, nickname) VALUES(?,?)", [id, nick], (err, res) => {
                if (err)
                    reject(err);
                else
                    this.readById(id).then((user) => {
                        resolve(user);
                    });
            });
        });
    }
    switchChannel(user, channel) {
        return new Promise((resolve, reject) => {
            exports.db.query("UPDATE users SET channel_id = ? WHERE id = ?", [channel.id, user.id], (err, res) => {
                if (err)
                    reject(err);
            });
        });
    }
    changeNick(user, newNick) {
        return new Promise((resolve, reject) => {
            exports.db.query("UPDATE users SET nickname = ? WHERE id = ?", [newNick, user.id], (err, res) => {
                if (err)
                    reject(err);
            });
        });
    }
}
exports.UserRepository = UserRepository;
class ChannelRepository {
    findAll() {
        return new Promise((resolve, reject) => {
            exports.db.query("SELECT * FROM channels", [], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
        });
    }
    findByName(name) {
        return new Promise((resolve, reject) => {
            exports.db.query("SELECT * FROM channels WHERE name = ?", [name], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res === null || res === void 0 ? void 0 : res[0]);
            });
        });
    }
    readById(id) {
        return new Promise((resolve, reject) => {
            exports.db.query("SELECT * FROM channels WHERE id = ?", [id], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res === null || res === void 0 ? void 0 : res[0]);
            });
        });
    }
    createChannel(channel) {
        return new Promise((resolve, reject) => {
            exports.db.query("INSERT INTO channels (id, name) VALUES(?,?)", [channel.id, channel.name], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(channel);
            });
        });
    }
}
exports.ChannelRepository = ChannelRepository;
class MessageRepository {
    findAllInChannel(channel) {
        return new Promise((resolve, reject) => {
            exports.db.query("SELECT * FROM messages WHERE channel_id = ?", [channel.id], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
        });
    }
    findAll() {
        return new Promise((resolve, reject) => {
            exports.db.query("SELECT * FROM messages", [], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
        });
    }
    readById(id) {
        return new Promise((resolve, reject) => {
            exports.db.query("SELECT * FROM messages WHERE id = ?", [id], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res === null || res === void 0 ? void 0 : res[0]);
            });
        });
    }
    createMessage(message, username, userid, channelid) {
        return __awaiter(this, void 0, void 0, function* () {
            // const user = await new UserRepository().readById(userid);
            return new Promise((resolve, reject) => {
                exports.db.query("INSERT INTO messages (message, username, user_id, channel_id) VALUES(?,?,?,?)", [message, username, userid, channelid], (err, res) => {
                    if (err)
                        reject(err);
                });
            });
        });
    }
}
exports.MessageRepository = MessageRepository;
