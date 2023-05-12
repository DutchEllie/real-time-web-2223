<script lang="ts">
  import { io } from "socket.io-client";
	import { env } from "$env/dynamic/public";
  const socket = io(env.PUBLIC_BACKEND_URL);
	import type { Poll, PollResponse, Option } from "$lib/entities/poll";
  import { redirect } from "@sveltejs/kit";
  import { goto } from "$app/navigation";

	var options: Option[] | null = [
		{
			title: "Option 1",
			votes: 0
		}
	]

	var title: string = "";
	var success = false;

	socket.on("connect", () => {
		console.log("Websocket connected");
	});

	function addOption(e: Event) {
		e.preventDefault();

		if(!options) {
			console.log("Options not loaded");
			return;
		}
		const option = {
			title: `Option ${options.length + 1}`,
			votes: 0
		}

		options.push(option);
		options = options;
	}

	function removeOption(e: Event, title: string) {
		e.preventDefault();

		if(!options) {
			console.log("Options not loaded");
			return;
		}

		options = options.filter(option => option.title != title);
		options = options;
	}

	function createPoll(e: Event) {
		e.preventDefault();

		if(!socket.connected) {
			console.log("Socket not connected");
			return;
		}

		if(title == "") {
			console.log("Title not set");
			return;
		}

		const pollTitle = title;

		if(!options) {
			console.log("Options not loaded");
			return;
		}

		const pollOptions = options;

		socket.emit("poll:create", {title: pollTitle, options: pollOptions}, (response: PollResponse) => {
			if(response.status == "ok") {
				console.log("Poll created");
				title = "";
				options = [
					{
						title: "Option 1",
						votes: 0
					}
				]
				success = true;
				goto(`/poll/${response.poll?.id}`)
			} else {
				console.log("Poll not created");
				console.log(response.error);
			}
		});

	}
</script>

<style>
	label, input, button {
		display: block;
	}

	input {
		margin-bottom: 1rem;
	}

	label {
		margin-left: 1rem;
	}
</style>

<div class="min-h-screen">
	<form on:submit={createPoll}>
		<label for="title">Title</label>
		<input class="text-slate-800" type="text" name="title" id="title" bind:value={title}>
		<label for="option1">Options</label>
		{#if options}
			{#each options as option}
				<!-- <label for="{option.title}">{option.title}</label> -->
				<div class="flex items-baseline gap-2">
					<input class="text-slate-800" type="text" name="{option.title}" id="{option.title}" value={option.title}>
					<button class="bg-red-400 hover:bg-red-500 rounded p-1" on:click|preventDefault={(e) => removeOption(e, option.title)}>Remove</button>
				</div>
			{/each}
		{/if}
		<button on:click|preventDefault={(e) => addOption(e)} class="bg-slate-900 hover:bg-slate-700 p-2 rounded" >Add option</button>
		<button class="bg-green-800 text-slate-100 hover:bg-green-900 p-3 rounded mt-2" type="submit">Create poll</button>
	</form>

	{#if success}
		<p class="text-xl text-green-400">Success</p>
	{/if}
</div>