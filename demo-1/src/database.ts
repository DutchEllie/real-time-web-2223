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
	id:	string,
	nick: string,
	currentChannel: string
}

export class UserRepository {
	readById(id: string): Promise<IUser | undefined> {
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
	createUser(user: IUser): Promise<IUser> {
		return new Promise((resolve, reject) => {
      db.query<OkPacket>(
        "INSERT INTO users (id, nickname) VALUES(?,?)",
        [user.id, user.nick],
        (err, res) => {
          if (err) reject(err)
          else
            this.readById(res.)
              .then(user => resolve(user!))
              .catch(reject)
        }
      )
    })
	}
}