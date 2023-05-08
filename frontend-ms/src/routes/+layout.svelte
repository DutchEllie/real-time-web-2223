<script>
  import "../app.css";

  // import { onMount } from "svelte";
  // import { initFirebase } from "$lib/client/firebase";

  // onMount(initFirebase);


  // import { auth as authStore } from "../stores/auth";
  // import { onAuthStateChanged } from "firebase/auth";

  // ...
  // onMount(() => {
  //   const { auth } = initFirebase();
  //   onAuthStateChanged(auth, authStore.set);
  // });
</script>

<main class="bg-slate-800 text-slate-100">

  <div class="max-w-3xl mx-auto">
  <slot />

  </div>
</main>
