import {
  Client,
  Events,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  hyperlink,
  EmbedBuilder,
} from "discord.js";
import { Server } from "socket.io";
import { PollService } from "./pollService.js";

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

    this.client.on(Events.InteractionCreate, (interaction) => {
      this.interactionCreate(interaction);
    });

    // Log in to Discord with your client's token
    this.client.login(token).then(async () => {
      // const myChannel = await this.client.channels.fetch("952476585687150612")
      // myChannel.send("Hello World!")
    });

    this.polls = new PollService();
  }

  setSocket(socket) {
    this.socket = socket;
  }

  buildEmbed(pollId) {
    const poll = this.polls.getPoll(pollId);
    const embedButtonFields = poll.options.map((option) => ({
      name: option.title,
      value: `${option.votes} votes`,
    }));

    const pollEmbed = new EmbedBuilder()
      .setTitle("Poll")
      .setDescription(poll.title)
      .setFields({ name: "Votes", value: "\u200B" }, ...embedButtonFields);

    return pollEmbed;
  }

  interactionCreate(interaction) {
    if (interaction.isButton()) {
      const [_, pollId, option] = interaction.customId.split(":");
      try {
        this.polls.vote(pollId, option);
        interaction.update({
          embeds: [this.buildEmbed(parseInt(pollId))],
        });
      } catch (e) {
        console.log("Error voting");
        console.log(e);
        return;
      }
    }
  }

  messageCreate(message) {
    const msg = {
      id: message.id,
      content: message.content,
      author_id: message.author.id,
      author: message.author.username,
    };

    this.socket.emit("discord:message:received", msg);

    if (message.author.bot) {
      return;
    }

    console.log("Author: " + message.author.bot);

    const extractOptionsWithQuotes = (str) => {
      const options = [];
      let currentOption = "";
      let inQuotes = false;
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char == '"') {
          inQuotes = !inQuotes;
          continue;
        }
        if (char == " " && !inQuotes) {
          if (currentOption.length > 0) {
            options.push(currentOption);
            currentOption = "";
          }
          continue;
        }
        currentOption += char;
      }
      if (currentOption.length > 0) {
        options.push(currentOption);
      }
      return options;
    };

    if (message.content.startsWith("!")) {
      const parsed = message.content.substring(1);
      const command = parsed.split(" ")[0];
      switch (command) {
        case "polls":
          const argument1 = parsed.split(" ")[1];
          switch (argument1) {
            case "help":
              const msg =
                "Available commands\n" +
                '!polls create "title" "option1" "option2" ...\n' +
                "!polls list";
              message.channel.send(msg);
              break;
            case "list":
              const polls = this.polls.getPolls();
              const response = polls.reduce((acc, poll) => {
                acc += `${hyperlink(
                  poll.title,
                  "http://localhost:5173/poll/" + poll.id
                )}\n`;
                return acc;
              }, "");
              message.channel.send(response);
              break;
            case "create":
              const options = extractOptionsWithQuotes(parsed.substring(13));
              const title = options[0];
              const pollOptions = options.slice(1).map((option) => ({
                title: option,
              }));

              const newPoll = this.polls.createPoll(title, pollOptions);
              const buttons = pollOptions.map((option) => {
                return new ButtonBuilder()
                  .setCustomId(`poll:${newPoll.id}:${option.title}`)
                  .setLabel(option.title)
                  .setStyle(ButtonStyle.Primary);
              });

              const actionRow = new ActionRowBuilder().addComponents(buttons);
              const pollEmbed = this.buildEmbed(newPoll.id);
              if (!pollEmbed) {
                console.log("Poll embed not found");
                return;
              }

              message.channel.send({
                embeds: [pollEmbed],
                components: [actionRow],
              });
              break;
          }
          break;
      }
    }
  }

  // Called to send a message to a Discord channel
  async sendMessage(channel, message) {
    const realChannel = await this.client.channels.fetch(channel);
    if (!realChannel) {
      throw new Error("channel not found!");
    }

    await realChannel.send(message);
    // this.socket.emit("discord:message:received", )
    return {
      status: "ok",
    };
  }

  async allChannels() {
    const guilds = await this.client.guilds.fetch();
    const guilds_channels = guilds.map(async (guild) => {
      const realGuild = await guild.fetch();
      const realChannels = await realGuild.channels.fetch();
      return realChannels.map((channel) => {
        return {
          id: channel.id,
          name: channel.name,
          guild_id: channel.guildId,
          guild_name: channel.guild.name,
        };
      });
    });
    const channels = await Promise.all(guilds_channels);
    return {
      status: "ok",
      channels: channels.flat(),
    };
  }

  async messageHistory(channel_id) {
    const channel = await this.client.channels.fetch(channel_id);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const messages = await channel.messages.fetch({
      limit: 10,
    });
    const res = messages
      .map((message) => {
        return {
          id: message.id,
          content: message.content,
          author_id: message.author.id,
          author: message.author.username,
        };
      })
      .reverse();

    return {
      status: "ok",
      messages: res,
    };
  }
}
