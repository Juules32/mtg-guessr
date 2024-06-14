<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { fetchRandomCard } from "$lib/api/scryfall";
	import Clock from "./Clock.svelte";
	import { tweened, type Tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { elasticOut } from "svelte/easing";

	// Constants
	const timerUpdateFrequency = 30; // How often the timer updates in ms
	const maxTime = 30;
	const symbolHeightStartPercentage = -40;
	const symbolHeightEndPercentage = 30;

	// Reactive variables
	let cardUrl = "card-back.jpg"; // Shows default card back while awaiting random card
	let cardName = "";
	let cardCMC = 0;
	let guessedCMC: number | undefined = 0;
	let remainingTime = maxTime;
	let lastDate = Date.now();
	const width = tweened(98, { duration: 400, easing: cubicOut });

	const checkmarkHeight = tweened(symbolHeightStartPercentage, {
		duration: 800,
		easing: elasticOut,
	});
	const incorrectHeight = tweened(symbolHeightStartPercentage, {
		duration: 800,
		easing: elasticOut,
	});

	async function getRandomCard() {
		const card = await fetchRandomCard();
		guessedCMC = undefined;
		cardUrl = card.image_uris?.border_crop || "";
		cardName = card.name;
		cardCMC = card.cmc;
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

	async function showSymbol(height: Tweened<number>) {
		height.set(symbolHeightEndPercentage);
		await new Promise((r) => setTimeout(r, 1000));
		height.set(symbolHeightStartPercentage);
	}

	async function guessAnimation() {
		width.set(0);
		await new Promise((r) => setTimeout(r, 300));
		await showSymbol(
			guessedCMC == cardCMC ? checkmarkHeight : incorrectHeight,
		);
		width.set(98);
	}

	async function handleGuess() {
		await guessAnimation()
		getRandomCard();
	}
</script>

<div class="relative inline-block overflow-hidden">
	<img
		draggable="false"
		width="480px"
		height="680px"
		src={cardUrl}
		alt={cardName}
		class="block rounded-xl"
	/>
	<div
		class="absolute top-[1%] h-[9%] backdrop-blur-lg backdrop-saturate-50 pointer-events-none rounded-xl"
		style="width: {$width}%; left: {99 - $width}%"
	></div>

	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="green"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="absolute left-[0%] w-[100%] h-[30%]"
		style="top: {$checkmarkHeight}%"
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="red"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="absolute left-[0%] w-[100%] h-[30%]"
		style="top: {$incorrectHeight}%"
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
</div>
<br />
<input class="border-2" type="number" bind:value={guessedCMC} />
<button on:click={handleGuess}>Guess</button>
<Clock {maxTime} {remainingTime} />
