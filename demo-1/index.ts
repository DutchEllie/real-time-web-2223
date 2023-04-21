import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import { type Message, type User } from './src/messages';
import { randomUUID } from 'crypto';
import { IUser, UserRepository, IChannel, ChannelRepository, IMessage, MessageRepository } from './src/database';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {} );
const port = process.env.PORT;

const userRepository = new UserRepository();
const channelRepository = new ChannelRepository();
const messageRepository = new MessageRepository();

var channelList = ['general', 'test1'];

var history: Message[] = [];

async function getHistory(channel: string) {
	// var channelHistory = [];
	// for (var i = 0; i < history.length; i++) {
	// 	if (history[i].channel == channel) {
	// 		channelHistory.push(history[i]);
	// 	}
	// }
	// return channelHistory;
	const history =  await messageRepository.findAllInChannel(await channelRepository.findByName(channel));
	// console.log(history)
	return history;
}

function changeNickInHistory(uuid: string, newNick: string) {
	// for (var i = 0; i < history.length; i++) {
	// 	if (history[i].user.id == uuid) {
	// 		history[i].user.nick = newNick;
	// 	}
	// }

}

var historyLimit = 50;

var connectedUsers: User[] = [];

async function getUsersInChannel(channel: string) {
	// var usersInChannel = [];
	// for (var i = 0; i < connectedUsers.length; i++) {
	// 	if (connectedUsers[i].currentChannel == channel) {
	// 		usersInChannel.push(connectedUsers[i]);
	// 	}
	// }
	// return usersInChannel;
	const IChannel = await channelRepository.findByName(channel);
	// console.log(IChannel)

	return await userRepository.findAllInChannel(IChannel);
}

async function findUserByUUID(uuid: string) {
	// for (var i = 0; i < connectedUsers.length; i++) {
	// 	if (connectedUsers[i].id == uuid) {
	// 		return connectedUsers[i];
	// 	}
	// }
	// return {id: 'error', nick: 'Error', currentChannel: 'general'}
	return await userRepository.readById(uuid);
}

function getServerUser(): User {
	return {id: 'server', nick: 'Server', currentChannel: 'general'};
}

io.on('connection', async (socket) => {
	console.log('a user connected');

	// Wait for the user to send their userdata

	var user: IUser;

	socket.once('getUUID', async () => {
		user = await userRepository.createUser(randomUUID(), 'Anonymous');
		socket.emit('getUUID', user.id);
	})

	socket.once('setUUID', async (uuid) => {
		try {
			const user = await userRepository.readById(uuid);
			if (user == null) {
				console.log("user not found, creating");
				const user = await userRepository.createUser(uuid, 'Anonymous');
			}
		} catch (err) {
			console.log(err);
		}
	})

	printStatsToTerminal();

	// console.log(await channelRepository.findAll())

	const channels = await channelRepository.findAll();
	const messageHistory = await messageRepository.findAllInChannel(channels[0]);
	const connectedUsers = await userRepository.findAllInChannel(channels[0]);
	socket.emit('availableChannels', channels);
	socket.emit('channelHistory', messageHistory);
	socket.emit('connectedUsers', connectedUsers);

	// If a message gets received, then save it to the history and send it to all clients
	socket.on('message', async (channel, uuid, msg) => {
		const user = await findUserByUUID(uuid);
		// history.push({channel: channel, user: user, message: msg});
		console.log(user.nickname)
		messageRepository.createMessage(msg, user.nickname, uuid, channel);
		io.emit('message', channel, user.nickname, msg);
	});

	socket.on('channelSwitch', async (channel, uuid) => {
		console.log("channelSwitch called")
		const user = await findUserByUUID(uuid);
		const previousChannel = await channelRepository.readById(user.channelID);
		const IChannel = await channelRepository.findByName(channel);
		// user.channelID = channel;
		// console.log(channel.)
		userRepository.switchChannel(user, IChannel);
		const channelHistory = await getHistory(channel);
		socket.emit('channelHistory', channelHistory);
		socket.emit('connectedUsers', await getUsersInChannel(channel));
		socket.broadcast.emit('connectedUsers', previousChannel.name);
	});

	socket.on('changeNick', async (oldNick, newNick, uuid) => {
		console.log("changenick called")
		// user.nick = newNick;
		const user = await findUserByUUID(uuid);
		const channelID = user.channelID ?? "1";
		const channel = await channelRepository.readById(channelID);
		changeNickInHistory(oldNick, newNick);

		socket.emit('message', channelID, "Server", 'You changed your nickname to ' + newNick + '.');
		socket.broadcast.emit('message', channelID, "Server", oldNick + ' changed their nickname to ' + newNick + '.');
		userRepository.changeNick(user, newNick);
		io.emit('connectedUsers', await getUsersInChannel(channel.name));
	})

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

});

function printStatsToTerminal() {
	// console.clear();
	// console.log('============ Stats ============');
	// console.log('Amount of connected users: ' + connectedUsers.length);
	// console.log('List of connected users: ');
	// for (var i = 0; i < connectedUsers.length; i++) {
	// 	console.log(` - ${connectedUsers[i].nick} - ${connectedUsers[i].id} - ${connectedUsers[i].currentChannel}`);
	// }
}

app.get('/', (req: Request, res: Response) => {
	res.sendFile(path.resolve('dist/public/index.html'));
});

app.use(express.static(path.resolve('dist/public')))

httpServer.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
