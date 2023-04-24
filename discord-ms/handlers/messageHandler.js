export default function messageHandler(io, socket) {
	// Function called when the user sends a message to the server
	const receivedMessage = (message) => {
		console.log("receivedMessage", message);
	}

	// message:send is called from the client, since the client sends the message and the server is supposed to send it along to discord
	socket.on("message:send", receivedMessage);
	// socket.on("sendMessage", sendMessage);
}