export interface Message {
	channel: string,
	user: User,
	message: string
}

interface Channel {
	name: string,
}

export interface User {
	id: string,
	nick: string
	currentChannel: string
}