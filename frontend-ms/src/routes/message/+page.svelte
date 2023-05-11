<script lang="ts">
  import { io } from "socket.io-client";
	import { env } from "$env/dynamic/public";
  const socket = io(env.PUBLIC_BACKEND_URL);
  import type { ChannelResponse, Channel } from "$lib/entities/channel";
  import type { Message, MessageResponse } from "$lib/entities/message";

  var channels: Channel[] | null = null;
  var messages: Message[] | null = null;

  socket.on("connect", () => {
    console.log("Websocket connected");
    socket.emit("discord:channels:get", (response: ChannelResponse) => {
      if (response.status == "ok") {
        console.log("Channels received");
        channels = response.channels;
				selectedChannel = response.channels[0].id;
				selectChannel();
      } else {
        console.log("Channels not received");
        console.log(response.error);
      }
    });

		socket.on("discord:message:received", (message: Message) => {
			if(!messages) {
				console.log("Messages not loaded");
				return;
			}
			messages.push(message);
			messages = messages;
		});

    // socket.emit('discord:messages:get', (response: MessageResponse) => {
    // 	if(response.status == "ok") {
    // 		console.log("Messages received");
    // 		messages = response.messages;
    // 	} else {
    // 		console.log("Messages not received");
    // 		console.log(response.error);
    // 	}
    // });
  });

  var messageContent = "";
  var selectedChannel = "";
  async function sendMessage(e: Event) {
    e.preventDefault();

    if (!socket.connected) {
      console.log("Socket not connected");
      return;
    }

    const message = messageContent;
    if (!channels) {
      console.log("Channels not loaded");
      return;
    }
    const channel = channels.find((channel) => channel.id == selectedChannel);
    if (!message) {
      console.log("Message is empty");
      return;
    }
    if (!channel) {
      console.log("Channel not found");
      return;
    }

    socket.emit(
      "discord:message:send",
      {
        message,
        channel_id: channel.id,
      },
      (ack: any) => {
        if (ack.status == "ok") {
          console.log("Message sent");
          messageContent = "";
        } else {
          console.log("Message not sent");
          console.log(ack.error);
        }
      }
    );
  }

  async function selectChannel(e?: Event) {
		if(e) e.preventDefault();

    if (!channels) {
      console.log("Channels not loaded");
      return;
    }

    const channel = channels.find((channel) => channel.id == selectedChannel);
    if (!channel) {
      console.log("Channel not found");
      return;
    }

    socket.emit(
      "discord:messages:get",
      {
        channel_id: channel.id,
      },
      (response: MessageResponse) => {
        if (response.status == "ok") {
          console.log("Messages received");
          messages = response.messages;
        } else {
          console.log("Messages not received");
          console.log(response.error);
        }
      }
    );
  }
</script>

<div>
  <!-- <div>
		<h3 class="text-xl">Channels</h3>
  <ul class="list-disc">
		{#if channels}
			{#each channels as channel}
				<li>{channel.name}</li>
			{/each}
		{:else}
			<p>No channels available</p>
		{/if}
  </ul>
	</div> -->
  <div>
    <h3>Messages</h3>
    <ul class="list-disc">
      {#if messages}
        {#each messages as message, index}
          <li>
            <div class="flex flex-col">
              {#if index == 0}
								<span class="font-bold">{message.author}</span>
							{:else if message.author_id != messages[index - 1].author_id}
                <span class="font-bold">{message.author}</span>
              {/if}
              <span class="text-gray-500 ml-2">{message.content}</span>
            </div>
          </li>
        {/each}
      {:else}
        <p>No messages available</p>
      {/if}
    </ul>
  </div>
  <select
    name="channels"
    id="channels"
    bind:value={selectedChannel}
    on:change={selectChannel}
  >
    {#if channels}
      {#each channels as channel}
        <option value={channel.id}>{channel.name}</option>
      {/each}
    {/if}
  </select>
  <form on:submit|preventDefault={sendMessage}>
    <input
      type="text"
      name="message"
      placeholder="Message"
      bind:value={messageContent}
    />
    <button type="submit">Submit</button>
  </form>
</div>
