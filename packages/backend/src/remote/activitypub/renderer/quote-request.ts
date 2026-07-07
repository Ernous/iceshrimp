import config from "@/config/index.js";
import type { Note } from "@/models/entities/note.js";

export default function renderQuoteRequest(note: Note, targetNote: Note) {
	return {
		type: "QuoteRequest",
		actor: `${config.url}/users/${note.userId}`,
		object: targetNote.uri!,
		instrument: `${config.url}/notes/${note.id}`,
	};
}
