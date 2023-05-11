<script lang="ts">
  import { io } from "socket.io-client";
	import { env } from "$env/dynamic/public";
  const socket = io(env.PUBLIC_BACKEND_URL);
	import type { Poll, PollResponse, Option } from "$lib/entities/poll";

	var polls: Poll[] | null = null;

	socket.on("connect", () => {
		console.log("Websocket connected");
		socket.emit("polls:get", (response: PollResponse) => {
			if(response.status == "ok") {
				console.log("Polls received");
				polls = response.polls;
			} else {
				console.log("Polls not received");
				console.log(response.error);
			}
		});
	});

</script>

<div class="p-2 text-center">
	<h2 class="text-xl">List of polls</h2>
	{#if polls}
		{#each polls as poll}
			<a class="m-2 block w-fit bg-slate-400 rounded-md p-2" href="/poll/{poll.id}">{poll.title}</a>
		{/each}
	{/if}
</div>