<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { io } from "socket.io-client";
  const socket = io("ws://localhost:3000/");
  import type { Poll, PollResponse, Option } from "$lib/entities/poll";

  var poll: Poll | null = null;

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
		socket.on("disconnect", () => {
			console.log("Websocket disconnected");
		});
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
			(response: PollResponse) => {
				if (response.status == "ok") {
					console.log("Vote received");
					if (response.poll) {
						poll = response.poll;
					} else {
						console.log("Poll not found");
						console.log(response);
					}
				} else {
					console.log("Vote not received");
					console.log(response.error);
				}
			}
		);
	}
</script>

<div>
  {#if poll}
    <h1>{poll.title}</h1>
    {#each poll.options as option}
      <form on:submit|preventDefault={
				(e) => {
					handleVote(e, option.title);
				}
			}>
        <p>{option.title}</p>
        <p>{option.votes}</p>
        <button type="submit">Vote</button>
      </form>
    {/each}
  {/if}
</div>
