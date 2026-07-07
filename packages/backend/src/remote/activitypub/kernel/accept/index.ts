import Resolver from "../../resolver.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import acceptFollow from "./follow.js";
import type { IAccept } from "../../type.js";
import { isFollow, getApType, isQuoteRequest } from "../../type.js";
import { apLogger } from "../../logger.js";
import { acceptQuoteRequest } from "./quote-request.js";

const logger = apLogger;

export default async (
	actor: CacheableRemoteUser,
	activity: IAccept,
): Promise<string> => {
	const uri = activity.id || activity;

	logger.info(`Accept: ${uri}`);

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch((e) => {
		logger.error(`Resolution failed: ${e}`);
		throw e;
	});

	if (isFollow(object)) return await acceptFollow(actor, object);
	else if (isQuoteRequest(object)) return await acceptQuoteRequest(actor, object, activity.result);

	return `skip: Unknown Accept type: ${getApType(object)}`;
};
