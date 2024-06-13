<script>
	import { onMount } from "svelte";
	import { fetchRandomCard } from "$lib/api/scryfall";

	let cardName = "";
	let cardUrl = "";

	async function getRandomCard() {
		const card = await fetchRandomCard();
		cardName = card.name;
		cardUrl = card.image_uris?.border_crop || "";
	}

	onMount(() => {
		getRandomCard();
	});
</script>



<div class="relative inline-block rounded-xl overflow-hidden mt-4">
	<img src={cardUrl} alt={cardName} class="block rounded-xl" />
	<div
	class="absolute top-[1%] left-[1%] w-[98%] h-[9%] backdrop-blur-lg backdrop-saturate-50 pointer-events-none rounded-xl"
	></div>
</div>
<p>{cardName}</p>
	
<button
	on:click={getRandomCard}
	class="bg-green-500 text-white py-2 px-4 rounded"
>
	New Card
</button>
