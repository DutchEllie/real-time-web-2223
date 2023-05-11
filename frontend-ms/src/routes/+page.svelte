<script lang="ts">
	// export const ssr = false;
	import { io } from 'socket.io-client';

	import { env } from "$env/dynamic/public";
  const socket = io(env.PUBLIC_BACKEND_URL);

	socket.on('connect', () => {
		// console.log('connected');
	});

	socket.on('message', (data) => {
		console.log(data);
	});
</script>


