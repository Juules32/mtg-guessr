import axios from 'axios';

export async function fetchRandomCard() {
	try {
		const response = await axios.get('https://api.scryfall.com/cards/random');
		return response.data;
	} catch (error) {
		throw new Error('Failed to fetch random card');
	}
}