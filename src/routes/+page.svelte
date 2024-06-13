<script lang="ts">
	import { onMount } from "svelte";
	import { fetchRandomCard } from "$lib/api/scryfall";
	import Clock from "./Clock.svelte";

	// Constants
	const timerUpdateFrequency = 30; // How often the timer updates in ms
	const maxTime = 30;

	// Reactive variables
	let cardUrl = "card-back.jpg"; // Shows default card back while awaiting random card
	let cardName = "";
	let remainingTime = maxTime;
	let lastDate = Date.now();

	async function getRandomCard() {
		const card = await fetchRandomCard();
		cardUrl = card.image_uris?.border_crop || "";
		cardName = card.name;
	}

	onMount(() => {
		// Gets initial random card
		getRandomCard();

		// Updates remaining time
		window.setInterval(() => {
			let newDate = Date.now();
			remainingTime -= (newDate - lastDate) / 1000;
			lastDate = newDate;
		}, timerUpdateFrequency);
	});
</script>

<div class="relative inline-block">
	<img
		draggable="false"
		width="480px"
		height="680px"
		src={cardUrl}
		alt={cardName}
		class="block rounded-xl"
	/>
	<div
		class="absolute top-[1%] left-[1%] w-[98%] h-[9%] backdrop-blur-lg backdrop-saturate-50 pointer-events-none"
	></div>
</div>

<br>

<button
	on:click={getRandomCard}
	class="bg-green-500 text-white py-2 px-4 rounded"
>
	New Card
</button>

<Clock {maxTime} {remainingTime} />
