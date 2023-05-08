export interface Option {
	title: string,
	votes: number,
}

export interface Poll {
	id: string,
	title: string,
	description: string,
	options: Option[],
}

export interface PollResponse {
	status: string,
	polls: Poll[],
	poll?: Poll,
	error: string,
}