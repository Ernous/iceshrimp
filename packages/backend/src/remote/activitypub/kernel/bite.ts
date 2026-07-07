import { CacheableRemoteUser } from "@/models/entities/user.js";
import { IBite } from "../type.js";
import Resolver from "../resolver.js";
import { fetchPerson } from "../models/person.js";
import config from "@/config/index.js";
import { createBite } from "@/services/create-bite.js";
import { tickBiteIncoming } from "@/metrics.js";
import { getNote } from "@/server/api/common/getters.js";
import { parseUri } from "../db-resolver.js";

export default async (
	actor: CacheableRemoteUser,
	bite: IBite,
): Promise<string> => {
	if (actor.uri !== bite.actor) {
		return "skip: actor uri mismatch";
	}

	if (bite.id === null) {
		return "skip: bite id not specified";
	}

	const resolver = new Resolver();
	const biteActor = await fetchPerson(bite.actor, resolver);
	if (biteActor === null) {
		return "skip: biteActor is null";
	}
	const targetParsed = parseUri(bite.target);
	if (!targetParsed.local) {
		return "skip: target is not local";
	}

	const targetDbId = targetParsed.id;
	const targetPathType = targetParsed.type;

	let targetType: "user" | "bite" | "note";
	let targetId;
	let fallback = false;

	if (targetPathType === "users") {
		targetType = "user";
		targetId = targetDbId;
	} else if (targetPathType === "bites") {
		targetType = "bite";
		targetId = targetDbId;
	} else if (targetPathType === "notes") {
		targetType = "note";
		targetId = targetDbId;
		try {
			await getNote(targetDbId!, actor);
		} catch (err: any) {
			if (err.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24") {
				// note either doesn't exist or the remote user shouldn't be able to access it
				fallback = true;
			}
		}
	} else {
		fallback = true;
	}
	if (fallback) {
		// fallback for unknown object types
		targetType = "user";
		if (bite.to !== undefined) {
			const to = Array.isArray(bite.to) ? bite.to[0] : bite.to;
			targetId = (to as string).split("/").pop();
		} else {
			return "skip: unknown type missing to field";
		}
	}

	await createBite(
		biteActor,
		targetType!,
		targetId!,
		bite.id!,
		bite.published ? new Date(bite.published) : null,
	);

	tickBiteIncoming();

	return "ok";
};
