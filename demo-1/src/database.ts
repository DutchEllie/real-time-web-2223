import mysql from 'mysql2';
import { User } from './messages';
import { OkPacket, RowDataPacket } from "mysql2";

export const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'example',
	database: 'chat',
});


export interface IUser extends RowDataPacket {
	id: string,
	nickname: string,
	channel_id?: string
}

export class UserRepository {
	findAllInChannel(channel: IChannel): Promise<IUser[]> {
		return new Promise((resolve, reject) => {
			db.query<IUser[]>(`
				SELECT * FROM users
				WHERE channel_id = ?`,
				[channel.id], (err, res) => {
				if (err) reject(err)
				else resolve(res)
			})
		})
	}

	readById(id: string): Promise<IUser> {
		return new Promise((resolve, reject) => {
			db.query<IUser[]>(
				"SELECT * FROM users WHERE id = ?",
				[id],
				(err, res) => {
					if (err) reject(err)
					else resolve(res?.[0])
				}
			)
		})

	}
	createUser(id: string, nick: string): Promise<IUser> {
		return new Promise((resolve, reject) => {
			db.query<OkPacket>(
				"INSERT INTO users (id, nickname) VALUES(?,?)",
				[id,nick],
				(err, res) => {
					if (err) reject(err)
					else
						this.readById(id).then((user) => {
							resolve(user as IUser)
						})
				}
			)
		})
	}

	switchChannel(user: IUser, channel: IChannel) {
		return new Promise((resolve, reject) => {
			db.query<OkPacket>(
				"UPDATE users SET channel_id = ? WHERE id = ?",
				[channel.id, user.id],
				(err, res) => {
					if (err) reject(err)
				}
			)
		})
	}

	changeNick(user: IUser, newNick: string) {
		return new Promise((resolve, reject) => {
			db.query<OkPacket>(
				"UPDATE users SET nickname = ? WHERE id = ?",
				[newNick, user.id],
				(err, res) => {
					if (err) reject(err)
				}
			)
		})
	}

	
}

export interface IChannel extends RowDataPacket {
	id: string,
	name: string
}

export class ChannelRepository {

	findAll(): Promise<IChannel[]> {
		return new Promise((resolve, reject) => {
			db.query<IChannel[]>(
				"SELECT * FROM channels",
				[],
				(err, res) => {
					if (err) reject(err)
					else resolve(res)
				}
			)
		})
	}

	findByName(name: string): Promise<IChannel> {
		return new Promise((resolve, reject) => {
			db.query<IChannel[]>(
				"SELECT * FROM channels WHERE name = ?",
				[name],
				(err, res) => {
					if (err) reject(err)
					else resolve(res?.[0])
				}
			)
		})
	}


	readById(id: string): Promise<IChannel> {
		return new Promise((resolve, reject) => {
			db.query<IChannel[]>(
				"SELECT * FROM channels WHERE id = ?",
				[id],
				(err, res) => {
					if (err) reject(err)
					else resolve(res?.[0])
				}
			)
		})

	}
	createChannel(channel: IChannel): Promise<IChannel> {
		return new Promise((resolve, reject) => {
			db.query<OkPacket>(
				"INSERT INTO channels (id, name) VALUES(?,?)",
				[channel.id, channel.name],
				(err, res) => {
					if (err) reject(err)
					else resolve(channel)
				}
			)
		})
	}
}

export interface IMessage extends RowDataPacket {
	id: string,
	message: string,
	user: IUser,
	username?: string,
	channel: IChannel
}

export class MessageRepository {
	findAllInChannel(channel: IChannel): Promise<IMessage[]> {
		return new Promise((resolve, reject) => {
			db.query<IMessage[]>(
				"SELECT * FROM messages WHERE channel_id = ?",
				[channel.id],
				(err, res) => {
					if (err) reject(err)
					else resolve(res)
				}
			)
		})
	}

	findAll(): Promise<IMessage[]> {
		return new Promise((resolve, reject) => {
			db.query<IMessage[]>(
				"SELECT * FROM messages",
				[],
				(err, res) => {
					if (err) reject(err)
					else resolve(res)
				}
			)
		})
	}

	readById(id: string): Promise<IMessage | undefined> {
		return new Promise((resolve, reject) => {
			db.query<IMessage[]>(
				"SELECT * FROM messages WHERE id = ?",
				[id],
				(err, res) => {
					if (err) reject(err)
					else resolve(res?.[0])
				}
			)
		})

	}
	async createMessage(message: string, username: string, userid: string, channelid: string): Promise<IMessage> {
		// const user = await new UserRepository().readById(userid);
		return new Promise((resolve, reject) => {
			db.query<OkPacket>(
				"INSERT INTO messages (message, username, user_id, channel_id) VALUES(?,?,?,?)",
				[message, username, userid, channelid],
				(err, res) => {
					if (err) reject(err)
				}
			)
		})
	}
}