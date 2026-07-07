import type { CacheableRemoteUser } from "@/models/entities/user.js";
import type { IRemove } from "../../type.js";
import { fetchNote } from "../../models/note.js";
import { removePinned } from "@/services/i/pin.js";

export default async (
	actor: CacheableRemoteUser,
	activity: IRemove,
): Promise<string> => {
	if ("actor" in activity && actor.uri !== activity.actor) {
		throw new Error("invalid actor");
	}

	if (activity.target == null) {
		throw new Error("target is null");
	}

	if (activity.target === actor.featured) {
		const note = await fetchNote(activity.object);
		if (note == null) return "skip: note not found"; // not pinned either way
		await removePinned(actor, note.id);
		return "ok";
	}

	throw new Error(`unknown target: ${activity.target}`);
};
