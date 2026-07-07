import * as os from "node:os";
import * as fs from "node:fs";
import define from "../../define.js";
import { redisClient } from "../../../../db/redis.js";
import { db } from "@/db/postgre.js";

export const meta = {
	requireCredential: true,
	requireModerator: true,

	tags: ["admin", "meta"],

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			machine: {
				type: "string",
				optional: false,
				nullable: false,
			},
			os: {
				type: "string",
				optional: false,
				nullable: false,
				example: "linux",
			},
			node: {
				type: "string",
				optional: false,
				nullable: false,
			},
			psql: {
				type: "string",
				optional: false,
				nullable: false,
			},
			cpu: {
				type: "object",
				optional: false,
				nullable: false,
				properties: {
					model: {
						type: "string",
						optional: false,
						nullable: false,
					},
					cores: {
						type: "number",
						optional: false,
						nullable: false,
					},
				},
			},
			mem: {
				type: "object",
				optional: false,
				nullable: false,
				properties: {
					total: {
						type: "number",
						optional: false,
						nullable: false,
						format: "bytes",
					},
				},
			},
			fs: {
				type: "object",
				optional: false,
				nullable: false,
				properties: {
					total: {
						type: "number",
						optional: false,
						nullable: false,
						format: "bytes",
					},
					used: {
						type: "number",
						optional: false,
						nullable: false,
						format: "bytes",
					},
				},
			},
			net: {
				type: "object",
				optional: false,
				nullable: false,
				properties: {
					interface: {
						type: "string",
						optional: false,
						nullable: false,
						example: "eth0",
					},
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	const redisServerInfo = await redisClient.info("Server");
	const m = redisServerInfo.match(new RegExp("^redis_version:(.*)", "m"));
	const redis_version = m?.[1];

	const netInterface = Object.keys(os.networkInterfaces()).filter(
		(name) => name !== "lo",
	)[0] || "eth0";

	let fsTotal = 0;
	let fsUsed = 0;
	try {
		const stats = fs.statfsSync("/");
		fsTotal = stats.blocks * stats.bsize;
		fsUsed = (stats.blocks - stats.bfree) * stats.bsize;
	} catch {}

	return {
		machine: os.hostname(),
		os: os.platform(),
		node: process.version,
		psql: await db
			.query("SHOW server_version")
			.then((x) => x[0].server_version),
		redis: redis_version,
		cpu: {
			model: os.cpus()[0].model,
			cores: os.cpus().length,
		},
		mem: {
			total: os.totalmem(),
		},
		fs: {
			total: fsTotal,
			used: fsUsed,
		},
		net: {
			interface: netInterface,
		},
	};
});
