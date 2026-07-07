import config from "@/config/index.js";
import type { User } from "@/models/entities/user.js";
import renderFollow from "./follow.js";

export default (
	follower: { id: User["id"]; host: User["host"]; uri: User["host"] },
	followee: { id: User["id"]; host: User["host"]; uri: User["host"] },
	requestId?: string,
) => {
	return {
		type: "Accept",
		actor: `${config.url}/users/${followee.id}`,
		object: renderFollow(follower, followee, requestId),
	};
};
