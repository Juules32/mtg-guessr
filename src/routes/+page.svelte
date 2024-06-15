<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { fetchRandomCard } from "$lib/api/scryfall";
	import Clock from "./Clock.svelte";
	import { tweened, type Tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { elasticOut } from "svelte/easing";

	// Constants
	const timerUpdateFrequency = 30; // How often the timer updates in ms
	const maxTime = 30; // In seconds
	const correctBonus = 10; // In seconds
	const incorrectPenalty = 10; // In seconds
	const symbolHeightStartPercentage = -40; // For ✔️ or ❌
	const symbolHeightEndPercentage = 30; // For ✔️ or ❌
	const symbolMoveSpeed = 800 // In ms
	const blurBarMoveSpeed = 400 // In ms

	// Reactive variables
	let cardUrl = "card-back.jpg"; // Shows default card back while awaiting random card
	let cardName = "";
	let cardCMC = 0;
	let lastCMC = 0;
	let canGuess = true;
	let guessedCMC: number | undefined = 0;
	let remainingTime = maxTime;
	let lastDate = Date.now();
	const width = tweened(98, { duration: blurBarMoveSpeed, easing: cubicOut });

	const checkmarkHeight = tweened(symbolHeightStartPercentage, {
		duration: symbolMoveSpeed,
		easing: elasticOut,
	});

	const incorrectHeight = tweened(symbolHeightStartPercentage, {
		duration: symbolMoveSpeed,
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
		await new Promise((r) => setTimeout(r, symbolMoveSpeed));
		height.set(symbolHeightStartPercentage);
	}

	async function guessAnimation(isCorrect: boolean) {
		width.set(0);
		await new Promise((r) => setTimeout(r, blurBarMoveSpeed));
		await showSymbol(isCorrect ? checkmarkHeight : incorrectHeight);
		width.set(98);
	}

	async function guess(guess: string) {
		canGuess = false;
		let isCorrect =
			(guess == "equal" && cardCMC == lastCMC) ||
			(guess == "higher" && cardCMC > lastCMC) ||
			(guess == "lower" && cardCMC < lastCMC);
		await guessAnimation(isCorrect);
		remainingTime += isCorrect ? correctBonus : -incorrectPenalty;
		remainingTime = Math.min(remainingTime, maxTime);
		lastCMC = cardCMC;
		canGuess = true;
		getRandomCard();
	}

	function onKeyDown(e: KeyboardEvent) {
		switch (e.code) {
			case "ArrowUp":
				guess("higher");
				break;
			case "ArrowDown":
				guess("lower");
				break;
			case "Enter":
				guess("equal");
				break;
		}
	}
</script>

<div class=""></div>
<div
	class="bg-center bg-cover flex h-screen flex-col items-center justify-center"
	style="background-image: url('background.jpg')"
>
	<div class="w-fit space-y-4">
		<div class="p-2 bg-black rounded-xl">
			<div class="px-10 bg-white rounded-sm">
				<div class="h-40 flex items-center space-x-10">
					<Clock {maxTime} {remainingTime} />
					<p class="text-xl">Last CMC was: {lastCMC}</p>
				</div>
			</div>
		</div>
		<div class="relative overflow-hidden">
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
				<line x1="20" y1="6" x2="9" y2="17" />
				<line x1="4" y1="12" x2="9" y2="17" />
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
		<div class="bg-black p-2">
			<div class="bg-white">
				<fieldset
					disabled={!canGuess}
					class="flex flex-col text-xl disabled:bg-gray-300"
				>
					<button
						class="py-4 border border-black transition-all duration-300 ease-in-out hover:bg-sky-300 hover:scale-[103%]"
						on:click={() => guess("higher")}>Higher</button
					>
					<button
						class="py-4 border border-black transition-all duration-300 ease-in-out hover:bg-sky-300 hover:scale-[103%]"
						on:click={() => guess("equal")}>Equal</button
					>
					<button
						class="py-4 border border-black transition-all duration-300 ease-in-out hover:bg-sky-300 hover:scale-[103%]"
						on:click={() => guess("lower")}>Lower</button
					>
				</fieldset>
			</div>
		</div>
	</div>
</div>
<svelte:window on:keydown={onKeyDown} />
