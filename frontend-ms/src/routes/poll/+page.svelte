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

		socket.on("polls:update", (response: PollResponse) => {
			if(response.status == "ok") {
				console.log("Polls received");
				polls = response.polls;
			} else {
				console.log("Polls not received");
				console.log(response.error);
			}
		});
	});

	function removePoll(e: Event, id: string) {
		e.preventDefault();

		if(!socket.connected) {
			console.log("Socket not connected");
			return;
		}

		if (!polls) {
			console.log("Polls not loaded");
			return;
		}

		socket.emit("poll:remove", {id}, (response: any) => {
			if(response.status == "ok") {
				if (!polls) {
					console.log("Polls not loaded");
					return;
				}
				console.log("Poll removed");
				polls = polls?.filter(poll => poll.id != id);
			} else {
				console.log("Poll not removed");
				console.log(response.error);
			}
		});

	}

</script>

<div class="min-h-screen">
	<div class="p-2 text-center">
		<h2 class="text-xl">List of polls</h2>
		{#if polls}
			{#each polls as poll}
				<div class="block">
					<a class="m-2 w-fit bg-slate-400 hover:bg-slate-500 rounded-md p-2" href="/poll/{poll.id}">{poll.title}</a>
					<button class="m-2 w-fit bg-red-400 hover:bg-red-500 rounded-md p-1" on:click|preventDefault={(e) => removePoll(e, poll.id)}>Remove</button>
				</div>
			{/each}
		{/if}
	</div>
	<a class="p-2 bg-green-800 text-slate-100 p-3 rounded hover:bg-green-900" href="/poll/create">Create your own poll!</a>
</div>