import { Bites } from "@/models/index.js";
import define from "../../define.js";
import { createBite } from "@/services/create-bite.js";
import { MINUTE } from "@/const.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["bites"],

	requireCredential: true,

	limit: {
		duration: MINUTE,
		max: 30,
	},

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Bite",
	},

	errors: {
		noSuchNote: {
			message: "No such note.",
			code: "NO_SUCH_NOTE",
			id: "7a80aef8-e4ca-43c2-a997-a6e9b0198374",
		},
		bitesDisabled: {
			message: "User doesn't allow bites.",
			code: "BITES_DISABLED",
			id: "a8cfcada-42e1-4ef4-b15e-6fcd903458b7",
		},
		bitesFollowersOnly: {
			message: "User only lets followers bite them.",
			code: "BITES_FOLLOWERS_ONLY",
			id: "26a2ed34-a1df-408c-9f75-d7459380fb60",
		},
		youHaveBeenBlocked: {
			message: "You cannot bite because you have been blocked by this user.",
			code: "YOU_HAVE_BEEN_BLOCKED",
			id: "c15a5199-7422-4968-941a-2a462c478f7d",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		targetType: { type: "string", enum: ["user", "bite", "note"] },
		targetId: { type: "string", format: "misskey:id" },
	},
	required: ["targetType", "targetId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	let biteId;
	try {
		biteId = await createBite(me, ps.targetType, ps.targetId);
	} catch (err: any) {
		if (err.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24")
			throw new ApiError(meta.errors.noSuchNote);
		if (err.id === "f82d8d34-beaf-42f3-9135-477d32288213")
			throw new ApiError(meta.errors.youHaveBeenBlocked);
		if (err.id === "35363f14-f489-45e2-81a9-558450710dfe")
			throw new ApiError(meta.errors.bitesFollowersOnly);
		if (err.id === "92ce0141-760d-4163-a7a2-73b349e3d133")
			throw new ApiError(meta.errors.bitesDisabled);
		throw err;
	}

	return await Bites.pack(biteId, me);
});
