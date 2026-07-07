import config from "@/config/index.js";
import { Bites } from "@/models/index.js";
import { Bite } from "@/models/entities/bite.js";

export default async (bite: Bite) => ({
	id: `${config.url}/bites/${bite.id}`,
	type: "Bite",
	actor: `${config.url}/users/${bite.userId}`,
	target: await Bites.targetUri(bite),
	published: bite.createdAt.toISOString(),
	to: await Bites.targetUserUri(bite),
});
