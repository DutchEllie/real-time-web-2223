"use strict";
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
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {});
const port = process.env.PORT;
var channelList = ['general', 'test1'];
var history = [];
function getHistory(channel) {
    var channelHistory = [];
    for (var i = 0; i < history.length; i++) {
        if (history[i].channel == channel) {
            channelHistory.push(history[i]);
        }
    }
    return channelHistory;
}
function changeNickInHistory(uuid, newNick) {
    for (var i = 0; i < history.length; i++) {
        if (history[i].user.id == uuid) {
            history[i].user.nick = newNick;
        }
    }
}
var historyLimit = 50;
var connectedUsers = [];
function getUsersInChannel(channel) {
    var usersInChannel = [];
    for (var i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].currentChannel == channel) {
            usersInChannel.push(connectedUsers[i]);
        }
    }
    return usersInChannel;
}
function findUserByUUID(uuid) {
    for (var i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].id == uuid) {
            return connectedUsers[i];
        }
    }
    return { id: 'error', nick: 'Error', currentChannel: 'general' };
}
function getServerUser() {
    return { id: 'server', nick: 'Server', currentChannel: 'general' };
}
io.on('connection', (socket) => {
    console.log('a user connected');
    // Wait for the user to send their userdata
    var user = {
        id: "null",
        nick: 'Anonymous',
        currentChannel: 'general'
    };
    socket.once('getUUID', () => {
        user.id = (0, crypto_1.randomUUID)();
        socket.emit('getUUID', user.id);
    });
    socket.once('setUUID', (uuid) => {
        user.id = uuid;
    });
    printStatsToTerminal();
    connectedUsers.push(user);
    socket.emit('availableChannels', channelList);
    socket.emit('channelHistory', getHistory(user.currentChannel));
    socket.emit('connectedUsers', getUsersInChannel(user.currentChannel));
    // If a message gets received, then save it to the history and send it to all clients
    socket.on('message', (channel, uuid, msg) => {
        const user = findUserByUUID(uuid);
        history.push({ channel: channel, user: user, message: msg });
        io.emit('message', channel, user, msg);
    });
    socket.on('channelSwitch', (channel) => {
        user.currentChannel = channel;
        const channelHistory = getHistory(channel);
        socket.emit('channelHistory', channelHistory);
        socket.emit('connectedUsers', getUsersInChannel(channel));
    });
    socket.on('changeNick', (oldNick, newNick) => {
        user.nick = newNick;
        changeNickInHistory(oldNick, newNick);
        socket.emit('message', 'general', getServerUser(), 'You changed your nickname to ' + newNick + '.');
        socket.broadcast.emit('message', 'general', getServerUser(), oldNick + ' changed their nickname to ' + newNick + '.');
        io.emit('connectedUsers', getUsersInChannel(user.currentChannel));
        // io.emit('changeNick', oldNick, newNick);
    });
    socket.on('disconnect', () => {
        printStatsToTerminal();
        console.log('user disconnected');
        console.log(connectedUsers);
        for (var i = 0; i < connectedUsers.length; i++) {
            if (connectedUsers[i].nick == user.nick) {
                connectedUsers.splice(i, 1);
                break;
            }
        }
        console.log(connectedUsers);
        printStatsToTerminal();
    });
});
function printStatsToTerminal() {
    console.clear();
    console.log('============ Stats ============');
    console.log('Amount of connected users: ' + connectedUsers.length);
    console.log('List of connected users: ');
    for (var i = 0; i < connectedUsers.length; i++) {
        console.log(` - ${connectedUsers[i].nick} - ${connectedUsers[i].id} - ${connectedUsers[i].currentChannel}`);
    }
}
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.use(express_1.default.static(path_1.default.resolve('dist/public')));
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
