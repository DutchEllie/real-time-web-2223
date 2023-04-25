# Realtime web project

## Spec of messages

### Discord message

```
{
	message: string = "message here"
	channel_id: string
}
```

### Ack

```
{
	status: string = "ok" | "err"
	error: string = "" | "error message"
}
```

### Connection type

```
{
	pagetype: string = "discord" | whatever
}
--
Types include:
	- discord
	- 
```

## Types of messages from client (browser) to server

```
- discord:channels:get
	Wants the channels
	The ack callback contains the channels in a "channels" array in the same form as discord:channels:available
- discord:message:send
	Send a message from the client to the server.
	Contains the "discordmessage" spec as message and expects a callback acknowledgement with "ack" spec.

```

## Messages from server to client (browser)

```
- discord:channels:available
	Contains the available discord channels in following format
	{
		channels: [
			{
				id: "id",
				name: "name",
				guild_id: "guild id",
				guild_name: "guild name"
			}
		]
	}
```