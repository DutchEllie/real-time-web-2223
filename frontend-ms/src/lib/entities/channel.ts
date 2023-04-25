export interface ChannelResponse {
	status: string,
	channels: Channel[],
	error?: string
}
export interface Channel {
	id: string;
	name: string;
	guild_id: string;
	guild_name: string;
}