import { Client, Events, GatewayIntentBits } from "discord.js";
import { Server } from "socket.io";

export class DiscordApp {
  client;
  token;
  socket;

  constructor(token) {
    this.token = token;

    this.client = new Client({
      intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
      ],
    });
    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it separate from the already defined 'client'
    this.client.once(Events.ClientReady, (c) => {
      console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    // Log in to Discord with your client's token
    this.client.login(token).then(async () => {
      // const myChannel = await this.client.channels.fetch("952476585687150612")
      // myChannel.send("Hello World!")
			this.client.on(Events.MessageCreate, (message) => {
				this.messageCreate(message);
			});

    });
  }

  setSocket(socket) {
    this.socket = socket;
  }

  // registerEvents() {
  //   this.client.on("messageCreate", function (message) {
  //     console.log("A MESSAGE WAS SENT");
  //     console.log({ message });
  //   });
  // }

  messageCreate(message) {
    console.log("messageCreate", message.content);
    this.socket.emit("message", message.content);
  }

  sendMessage() {
    this.socket.emit("message", "Hello World! 222");
  }
}
