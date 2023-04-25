export interface MessageResponse {
	status: string,
	messages: Message[],
	error: string
}
export interface Message {
	id: string,
	content: string,
	author_id: string,
	author: string,
}