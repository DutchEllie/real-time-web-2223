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

		this.client.on(Events.MessageCreate, (message) => {
			this.messageCreate(message);
		});

    // Log in to Discord with your client's token
    this.client.login(token).then(async () => {
      // const myChannel = await this.client.channels.fetch("952476585687150612")
      // myChannel.send("Hello World!")

    });
  }

  setSocket(socket) {
    this.socket = socket;
  }

  messageCreate(message) {
    const msg = {
      id: message.id,
      content: message.content,
      author_id: message.author.id,
      author: message.author.username,
    };

    this.socket.emit("discord:message:received", msg);
  }

	// Called to send a message to a Discord channel
	async sendMessage(channel, message) {
    const realChannel = await this.client.channels.fetch(channel);
    if(!realChannel){
      throw new Error("channel not found!");
    }

    await realChannel.send(message);
    // this.socket.emit("discord:message:received", )
    return {
      status: "ok",
    }
	}

	async allChannels() {
		const guilds = await this.client.guilds.fetch();
		const guilds_channels = guilds.map(async guild => {
			const realGuild = await guild.fetch();
			const realChannels = await realGuild.channels.fetch();
			return realChannels.map(channel => {
				return {
					id: channel.id,
					name: channel.name,
					guild_id: channel.guildId,
					guild_name: channel.guild.name,
				}
			})
		})
		const channels = await Promise.all(guilds_channels);
		return {
			status: "ok",
			channels: channels.flat(),
		}
	}

  async messageHistory(channel_id) {
    const channel = await this.client.channels.fetch(channel_id);
    if(!channel){
      throw new Error("Channel not found");
    }

    const messages = await channel.messages.fetch({
      limit: 10
    });
    const res = messages.map(message => {
      return {
        id: message.id,
        content: message.content,
        author_id: message.author.id,
        author: message.author.username,
      }
    }).reverse();

    return {
      status: "ok",
      messages: res,
    }


  }
}
