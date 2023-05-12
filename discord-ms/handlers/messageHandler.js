import { DiscordApp } from "../src/discord.js";
import fs from 'fs';
import { PollService } from "../src/pollService.js";

export default function messageHandler(io, socket, discord) {
  // Function called when the user sends a message to the server
  const discord_message_send = async (data, callback) => {
    if (!data.message || !data.channel_id) {
      console.log("missing data in discord_message_send");
      console.log(data);
      callback({
        status: "err",
        error: "missing data",
      });
    }

    try {
      const res = await discord.sendMessage(data.channel_id, data.message);
      callback(res);
    } catch (e) {
      console.log(e.message);
      callback({
        status: "err",
        error: e.message,
      });
      return;
    }
  };

  const discord_channels_get = async (callback) => {
    const channels = await discord.allChannels();
    callback(channels);
  };

  const discord_messages_get = async (data, callback) => {
    if (!data.channel_id) {
      console.log("missing data in discord_messages_get");
      console.log(data);
      callback({
        status: "err",
        error: "missing data",
      });
    }

    try {
      const res = await discord.messageHistory(data.channel_id);
      callback(res);
    } catch (e) {
      console.log(e.message);
      callback({
        status: "err",
        error: e.message,
      });
      return;
    }
  };

  const polls = new PollService();

  const poll_remove = async (data, callback) => {
    if (!data.id) {
      console.log("missing data in poll_remove");
      console.log(data);
      callback({
        status: "err",
        error: "missing data",
      });
    }

    try {
      polls.removePoll(data.id);
      callback({
        status: "ok",
      });
    } catch(e) {
      console.log(e.message);
      callback({
        status: "err",
        error: e.message,
      });
      return;
    }
  }

  const poll_create = async (data, callback) => {
    if (!data.title || !data.options) {
      console.log("missing data in poll_create");
      console.log(data);
      callback({
        status: "err",
        error: "missing data",
      });
    }

    try {
      const newPoll = polls.createPoll(data.title, data.options);
      socket.broadcast.emit("polls:update", {
        status: "ok",
        polls: polls.getPolls(),
      });
      callback({
        status: "ok",
        poll: newPoll
      });
    } catch(e) {
      console.log(e.message);
      callback({
        status: "err",
        error: e.message,
      });
      return;
    }
  }

  const polls_get = async (callback) => {
    const res = {
      status: "ok",
      polls: polls.getPolls()
    };
    callback(res);
  };

  const poll_get = async (data, callback) => {
    if (!data.id) {
      console.log("missing data in poll_get");
      console.log(data);
      callback({
        status: "err",
        error: "missing data",
      });
    }

    try {
      callback({
        status: "ok",
        poll: polls.getPoll(data.id),
      });
    } catch(e) {
      console.log(e.message);
      callback({
        status: "err",
        error: e.message,
      });
      return;
    }
  }

  const poll_vote = async (data, callback) => {
    if (!data.id || !data.vote) {
      console.log("missing data in poll_vote");
      console.log(data);
      callback({
        status: "err",
        error: "missing data",
      });
    }

    try {
      polls.vote(data.id, data.vote);
      callback({
        status: "ok",
      });

      io.emit("poll:vote", {
        status: "ok",
        poll: polls.getPoll(data.id),
      });

    } catch(e) {
      console.log(e.message);
      callback({
        status: "err",
        error: e.message,
      });
      return;
    }
  }

  // message:send is called from the client, since the client sends the message and the server is supposed to send it along to discord
  socket.on("discord:message:send", discord_message_send);
  socket.on("discord:channels:get", discord_channels_get);
  socket.on("discord:messages:get", discord_messages_get);
  socket.on("polls:get", polls_get);
  socket.on("poll:get", poll_get);
  socket.on("poll:vote", poll_vote);
  socket.on("poll:create", poll_create);
  socket.on("poll:remove", poll_remove);

  // socket.on("sendMessage", sendMessage);
}
