import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import { type Message, type User } from './src/messages';
import { randomUUID } from 'crypto';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {} );
const port = process.env.PORT;

var channelList = ['general', 'test1'];

var history: Message[] = [];

function getHistory(channel: string) {
	var channelHistory = [];
	for (var i = 0; i < history.length; i++) {
		if (history[i].channel == channel) {
			channelHistory.push(history[i]);
		}
	}
	return channelHistory;
}

function changeNickInHistory(uuid: string, newNick: string) {
	for (var i = 0; i < history.length; i++) {
		if (history[i].user.id == uuid) {
			history[i].user.nick = newNick;
		}
	}
}

var historyLimit = 50;

var connectedUsers: User[] = [];

function getUsersInChannel(channel: string) {
	var usersInChannel = [];
	for (var i = 0; i < connectedUsers.length; i++) {
		if (connectedUsers[i].currentChannel == channel) {
			usersInChannel.push(connectedUsers[i]);
		}
	}
	return usersInChannel;
}

function findUserByUUID(uuid: string): User {
	for (var i = 0; i < connectedUsers.length; i++) {
		if (connectedUsers[i].id == uuid) {
			return connectedUsers[i];
		}
	}
	return {id: 'error', nick: 'Error', currentChannel: 'general'}
}

function getServerUser(): User {
	return {id: 'server', nick: 'Server', currentChannel: 'general'};
}

io.on('connection', (socket) => {
	console.log('a user connected');

	// Wait for the user to send their userdata
	var user: User = {
		id: "null",
		nick: 'Anonymous',
		currentChannel: 'general'
	}

	socket.once('getUUID', () => {
		user.id = randomUUID();
		socket.emit('getUUID', user.id);
	})

	socket.once('setUUID', (uuid) => {
		user.id = uuid;
	})


	printStatsToTerminal();

	connectedUsers.push(user);

	socket.emit('availableChannels', channelList);
	socket.emit('channelHistory', getHistory(user.currentChannel));
	socket.emit('connectedUsers', getUsersInChannel(user.currentChannel));

	// If a message gets received, then save it to the history and send it to all clients
	socket.on('message', (channel, uuid, msg) => {
		const user = findUserByUUID(uuid);
		history.push({channel: channel, user: user, message: msg});
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
	})

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

app.get('/', (req: Request, res: Response) => {
	res.send('Express + TypeScript Server');
});

app.use(express.static(path.resolve('dist/public')))

httpServer.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
