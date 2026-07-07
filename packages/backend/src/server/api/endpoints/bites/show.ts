import { Bites } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
	tags: ["bites"],

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Bite",
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		biteId: { type: "string", format: "misskey:id" },
	},
	required: ["biteId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	return await Bites.pack(ps.biteId, me);
});
