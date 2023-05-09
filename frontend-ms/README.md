# Realtime web project

## Project

This project is a realtime web application made for school.
It is a website written in SvelteKit and Tailwind CSS (I'm sorry) that connects to a backend written in NodeJS using Socket.io and Express.js.
The backend listens for incoming websocket connections and handles any incoming messages from clients.
In addition to that the backend also connects to a Discord server as a bot and offers the same functionality there as on the website.
Clients on the website can speak to people on the Discord server through the bot and the people on the Discord server can speak using their normal chat interface to the people connected to the webclient.

Lastly, there is also a realtime poll system.
Polls can be created through Discord and are visible on both the website and Discord.
They can also be interacted with through both the webclient and Discord in realtime.

### Communication

Communication between client and server is done via WebSockets.
When the client sends a message to the server, the server is meant to reply in a certain way, but always with at least an "Ack" response message.
An "Ack" or acknowledge is an object that looks like this:

```json
{
	"status": "ok / error",
	"error": "possible error message"
}
```

Various functions can include other fields.
One such is `discord:messages:get` which, along with the default `status` and optionally `error` fields, contains a `messages` field which is populated with messages.

### Messages from server to client (browser)

* `poll:vote`
	This is used to send updates of poll votes to connected clients.
	When a client votes on a poll, this is sent to all connected clients including the voting client, to tell the client to update the web interface.
* `discord:message:received`
	This is sent from the server when a Discord message is received and it tells the clients to update the interface with the newly sent message.
  
### Messages from client (browser) to server

The client makes use of both acknowledge callback functions to obtain data that it asked for, such as asking for the available channels.
However, when the client does something that all other connected clients need to also get (like sending a message or voting on a poll) the acknowledge callback does not contain the appropriate data, but instead only a status "ok" or "error" and a possible error message.
This is to simplify the communication, since broadcast messages do not have to be treated specially this way.

* `discord:channels:get`
	This asks the server to send all of the available Discord channels.
	The response is a callback function of the `ChannelResponse` object, which is a custom response similar to the "Ack" response detailed above.
* `discord:message:send`
  This tells the server to send a message from this client.
	The call includes a `message` field and a `channel_id` field.
	The `channel_id` is populated with the Discord channel ID to send the message to, which is a globally unique ID made by Discord for a channel.
	The `message` field is just a string.
	This message expects a callback with an acknowledge.
* `discord:messages:get`
  This tells the server to send the client the discord messages for the included `channel_id` which is sent along with this call.
	The callback function for this call contains a `MessageResponse` which is an acknowledge which includes an array of `Message` types.
* `poll:get`
  This tells the server to send the details of a poll.
	The poll it wants is specified with the `id` field included in this call, which corresponds to a poll ID.
	The response is a callback with `PollResponse` as the type.
	This is an acknowledge that includes a singular `Poll` object.
* `polls:get`
  Simply the plural version of the `poll:get` call.
	Doesn't include any fields with the call and the server will return every single poll it knows.
	The returned value in the callback is a `PollResponse`, same as above, but instead of a singular `Poll` it includes an array of `Poll` objects in the field `polls`.
* `poll:vote`
  This tells the server to vote on a poll.
	The included fields are `id` for the poll's ID and a string containing the option to vote on.
	Returned is a generic acknowledge object.
