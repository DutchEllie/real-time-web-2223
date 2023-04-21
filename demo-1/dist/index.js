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
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const crypto_1 = require("crypto");
const database_1 = require("./src/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {});
const port = process.env.PORT;
const userRepository = new database_1.UserRepository();
const channelRepository = new database_1.ChannelRepository();
const messageRepository = new database_1.MessageRepository();
var channelList = ['general', 'test1'];
var history = [];
function getHistory(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        // var channelHistory = [];
        // for (var i = 0; i < history.length; i++) {
        // 	if (history[i].channel == channel) {
        // 		channelHistory.push(history[i]);
        // 	}
        // }
        // return channelHistory;
        const history = yield messageRepository.findAllInChannel(yield channelRepository.findByName(channel));
        // console.log(history)
        return history;
    });
}
function changeNickInHistory(uuid, newNick) {
    // for (var i = 0; i < history.length; i++) {
    // 	if (history[i].user.id == uuid) {
    // 		history[i].user.nick = newNick;
    // 	}
    // }
}
var historyLimit = 50;
var connectedUsers = [];
function getUsersInChannel(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        // var usersInChannel = [];
        // for (var i = 0; i < connectedUsers.length; i++) {
        // 	if (connectedUsers[i].currentChannel == channel) {
        // 		usersInChannel.push(connectedUsers[i]);
        // 	}
        // }
        // return usersInChannel;
        const IChannel = yield channelRepository.findByName(channel);
        // console.log(IChannel)
        return yield userRepository.findAllInChannel(IChannel);
    });
}
function findUserByUUID(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        // for (var i = 0; i < connectedUsers.length; i++) {
        // 	if (connectedUsers[i].id == uuid) {
        // 		return connectedUsers[i];
        // 	}
        // }
        // return {id: 'error', nick: 'Error', currentChannel: 'general'}
        return yield userRepository.readById(uuid);
    });
}
function getServerUser() {
    return { id: 'server', nick: 'Server', currentChannel: 'general' };
}
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('a user connected');
    // Wait for the user to send their userdata
    var user;
    socket.once('getUUID', () => __awaiter(void 0, void 0, void 0, function* () {
        user = yield userRepository.createUser((0, crypto_1.randomUUID)(), 'Anonymous');
        socket.emit('getUUID', user.id);
    }));
    socket.once('setUUID', (uuid) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield userRepository.readById(uuid);
            if (user == null) {
                console.log("user not found, creating");
                const user = yield userRepository.createUser(uuid, 'Anonymous');
            }
        }
        catch (err) {
            console.log(err);
        }
    }));
    printStatsToTerminal();
    // console.log(await channelRepository.findAll())
    const channels = yield channelRepository.findAll();
    const messageHistory = yield messageRepository.findAllInChannel(channels[0]);
    const connectedUsers = yield userRepository.findAllInChannel(channels[0]);
    socket.emit('availableChannels', channels);
    socket.emit('channelHistory', messageHistory);
    socket.emit('connectedUsers', connectedUsers);
    // If a message gets received, then save it to the history and send it to all clients
    socket.on('message', (channel, uuid, msg) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield findUserByUUID(uuid);
        // history.push({channel: channel, user: user, message: msg});
        console.log(user.nickname);
        messageRepository.createMessage(msg, user.nickname, uuid, channel);
        io.emit('message', channel, user.nickname, msg);
    }));
    socket.on('channelSwitch', (channel, uuid) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("channelSwitch called");
        const user = yield findUserByUUID(uuid);
        const previousChannel = yield channelRepository.readById(user.channelID);
        const IChannel = yield channelRepository.findByName(channel);
        // user.channelID = channel;
        // console.log(channel.)
        userRepository.switchChannel(user, IChannel);
        const channelHistory = yield getHistory(channel);
        socket.emit('channelHistory', channelHistory);
        socket.emit('connectedUsers', yield getUsersInChannel(channel));
        socket.broadcast.emit('connectedUsers', previousChannel.name);
    }));
    socket.on('changeNick', (oldNick, newNick, uuid) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        console.log("changenick called");
        // user.nick = newNick;
        const user = yield findUserByUUID(uuid);
        const channelID = (_a = user.channelID) !== null && _a !== void 0 ? _a : "1";
        const channel = yield channelRepository.readById(channelID);
        changeNickInHistory(oldNick, newNick);
        socket.emit('message', channelID, "Server", 'You changed your nickname to ' + newNick + '.');
        socket.broadcast.emit('message', channelID, "Server", oldNick + ' changed their nickname to ' + newNick + '.');
        userRepository.changeNick(user, newNick);
        io.emit('connectedUsers', yield getUsersInChannel(channel.name));
    }));
    socket.on('disconnect', () => {
        printStatsToTerminal();
        console.log('user disconnected');
        // console.log(connectedUsers);
        // for (var i = 0; i < connectedUsers.length; i++) {
        // 	if (connectedUsers[i].nickname == user.nickname) {
        // 		connectedUsers.splice(i, 1);
        // 		break;
        // 	}
        // }
        // console.log(connectedUsers);
        printStatsToTerminal();
    });
}));
function printStatsToTerminal() {
    // console.clear();
    // console.log('============ Stats ============');
    // console.log('Amount of connected users: ' + connectedUsers.length);
    // console.log('List of connected users: ');
    // for (var i = 0; i < connectedUsers.length; i++) {
    // 	console.log(` - ${connectedUsers[i].nick} - ${connectedUsers[i].id} - ${connectedUsers[i].currentChannel}`);
    // }
}
app.get('/', (req, res) => {
    res.sendFile(path_1.default.resolve('dist/public/index.html'));
});
app.use(express_1.default.static(path_1.default.resolve('dist/public')));
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
