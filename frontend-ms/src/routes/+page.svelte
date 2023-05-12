<script lang="ts">
  // export const ssr = false;
  import { io } from "socket.io-client";

  import { env } from "$env/dynamic/public";
  const socket = io(env.PUBLIC_BACKEND_URL);

  socket.on("connect", () => {
    // console.log('connected');
  });

  socket.on("message", (data) => {
    console.log(data);
  });
</script>

<div class="min-h-screen">
	<div class="pt-5">
		<p>Navigation</p>
		<nav class="pt-5 pl-2">
			<a class="block text-blue-400 underline" href="/message">Message page</a>
			<a class="block text-blue-400 underline" href="/poll">All polls</a>
		</nav>
	</div>
</div>
