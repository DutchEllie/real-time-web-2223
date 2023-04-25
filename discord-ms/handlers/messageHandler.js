import { DiscordApp } from "../src/discord.js";

export default function messageHandler(io, socket, discord) {
  // Function called when the user sends a message to the server
  const discord_message_send = async (data, callback) => {
    if(!data.message || !data.channel_id) {
      console.log("missing data in discord_message_send");
      console.log(data);
      callback({
        status: "err",
        error: "missing data"
      });
    }

    try {
      const res = await discord.sendMessage(data.channel_id, data.message);
      callback(res);
    } catch(e) {
      console.log(e);
      callback({
        status: "err",
        error: e.message
      })
      return;
    }
  }

  const discord_channels_get = async (callback) => {
    const channels = await discord.allChannels();
		callback(channels)
  };

  const discord_messages_get = async (data, callback) => {
    if(!data.channel_id) {
      console.log("missing data in discord_messages_get");
      console.log(data);
      callback({
        status: "err",
        error: "missing data"
      });
    }

    try {
      const res = await discord.messageHistory(data.channel_id);
      callback(res);
    } catch(e) {
      console.log(e);
      callback({
        status: "err",
        error: e.message
      })
      return;
    }
  }

  // message:send is called from the client, since the client sends the message and the server is supposed to send it along to discord
  socket.on("discord:message:send", discord_message_send);
  socket.on("discord:channels:get", discord_channels_get);
  socket.on("discord:messages:get", discord_messages_get);

  // socket.on("sendMessage", sendMessage);
}
