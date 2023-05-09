<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { io } from "socket.io-client";
  const socket = io("ws://localhost:3000/");
  import type { Poll, PollResponse, Option } from "$lib/entities/poll";

  var poll: Poll | null = null;
  var totalVotes = 0;

  socket.on("connect", () => {
    console.log("Websocket connected");
    socket.emit(
      "poll:get",
      {
        id: data.id,
      },
      (response: PollResponse) => {
        if (response.status == "ok") {
          console.log("Poll received");
          if (response.poll) {
            poll = response.poll;
            totalVotes = poll.options.reduce(
              (acc, option) => acc + option.votes,
              0
            );
          } else {
            console.log("Poll not found");
            console.log(response);
          }
        } else {
          console.log("Poll not received");
          console.log(response.error);
        }
      }
    );

    socket.on("poll:vote", (response: PollResponse) => {
      if (response.status == "ok") {
        console.log("Poll received");
        if (response.poll) {
					if(response.poll.id != data.id) {
						console.log("Vote received for another poll");
						return;
					};
          poll = response.poll;
          totalVotes = poll.options.reduce(
            (acc, option) => acc + option.votes,
            0
          );
        } else {
          console.log("Poll not found");
          console.log(response);
        }
      } else {
        console.log("Poll not received");
        console.log(response.error);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Websocket disconnected");
  });

  async function handleVote(e: Event, vote: string) {
    e.preventDefault();

    if (!socket.connected) {
      console.log("Socket not connected");
      return;
    }

    if (!poll) {
      console.log("Poll not loaded");
      return;
    }

    socket.emit(
      "poll:vote",
      {
        id: poll.id,
        vote,
      },
      (ack: any) => {
        if (ack.status == "ok") {
          console.log("Vote sent");
        } else {
          console.log("Vote not sent");
          console.log(ack.error);
        }
      }
    );
  }
</script>

<div class="p-8 h-screen pt-20">
  {#if poll}
    <h1 class="text-center text-xl font-bold mb-2">{poll.title}</h1>
    {#each poll.options as option}
      <form
        on:submit|preventDefault={(e) => {
          handleVote(e, option.title);
        }}
      >
        <div class="mt-5">
          <p>{option.title}</p>
          <div class="flex items-center">
            <div class="bg-green-200 rounded-md flex-grow">
              <div
                class="text-center bg-green-500 rounded-md"
                style="width: {(option.votes / totalVotes) * 100}%"
              >
                {option.votes}
              </div>
            </div>
            <div class="ml-2">
              <button class="w-min p-1 bg-amber-500 rounded-md" type="submit"
                >Vote</button
              >
            </div>
          </div>
        </div>
      </form>
    {/each}
  {/if}
</div>
