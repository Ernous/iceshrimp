import data from "unicode-emoji-json/data-by-group.json";
import emojiComponents from "unicode-emoji-json/data-emoji-components.json";
import individualData from "unicode-emoji-json/data-by-emoji.json";
import keywordSet from "emojilib";
import { defaultStore } from "@/store";

export type UnicodeEmojiDef = {
	emoji: string;
	category: typeof unicodeEmojiCategories[number];
	skin_tone_support: boolean;
	slug: string;
	keywords?: string[];
};

export const unicodeEmojiCategories = [
	"emotion",
	"people",
	"animals_and_nature",
	"food_and_drink",
	"activity",
	"travel_and_places",
	"objects",
	"symbols",
	"flags",
] as const;

export const categoryMapping = {
	"Smileys & Emotion": "emotion",
	"People & Body": "people",
	"Animals & Nature": "animals_and_nature",
	"Food & Drink": "food_and_drink",
	Activities: "activity",
	"Travel & Places": "travel_and_places",
	Objects: "objects",
	Symbols: "symbols",
	Flags: "flags",
} as const;

export function addSkinTone(emoji: string, skinTone?: number) {
	const chosenSkinTone = skinTone ||
		defaultStore.state.reactionPickerSkinTone;
	const skinToneModifiers = [
		"",
		emojiComponents.light_skin_tone,
		emojiComponents.medium_light_skin_tone,
		emojiComponents.medium_skin_tone,
		emojiComponents.medium_dark_skin_tone,
		emojiComponents.dark_skin_tone,
	];
	const strippedEmoji = emoji.replace(
		new RegExp(`(${skinToneModifiers.slice(1).join("|")})`, "gi"),
		"",
	);
	if (individualData[strippedEmoji].skin_tone_support) {
		return strippedEmoji + (skinToneModifiers[chosenSkinTone - 1] || "");
	} else {
		return emoji;
	}
}

export const emojilist: UnicodeEmojiDef[] = data.flatMap((category) =>
	category.emojis.map((emoji) => ({
		emoji: emoji.emoji,
		slug: emoji.slug,
		category: categoryMapping[category.name],
		skin_tone_support: emoji.skin_tone_support,
		keywords: keywordSet[emoji.emoji],
	}))
);

export function getNicelyLabeledCategory(internalName) {
	return (
		Object.keys(categoryMapping).find(
			(key) => categoryMapping[key] === internalName,
		) || internalName
	);
}
