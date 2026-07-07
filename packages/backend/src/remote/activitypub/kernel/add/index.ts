import type { CacheableRemoteUser } from "@/models/entities/user.js";
import type { IAdd } from "../../type.js";
import { resolveNote } from "../../models/note.js";
import { addPinned } from "@/services/i/pin.js";
import Resolver from "../../resolver.js";
import { Users } from "@/models/index.js";

export default async (
	actor: CacheableRemoteUser,
	activity: IAdd,
): Promise<string> => {
	if ("actor" in activity && actor.uri !== activity.actor) {
		throw new Error("invalid actor");
	}

	if (activity.target == null) {
		throw new Error("target is null");
	}

	if (activity.target === actor.featured) {
		const resolver = new Resolver();
		const follower = await Users.getRandomFollower(actor.id);
		if (follower) resolver.setUser(follower);

		const note = await resolveNote(activity.object, resolver);
		if (note == null) throw new Error("note not found");
		await addPinned(actor, note.id);
		return "ok";
	}

	throw new Error(`unknown target: ${activity.target}`);
};
