<script lang="ts">
	// export const ssr = false;
	import { io } from 'socket.io-client';

	const socket = io('ws://localhost:3000/');

	socket.on('connect', () => {
		// console.log('connected');
	});

	socket.on('message', (data) => {
		console.log(data);
	});
</script>


