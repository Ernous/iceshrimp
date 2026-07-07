import config from "@/config/index.js";
import { IQuoteRequest } from "../type";
import { InteractionStamp } from "@/models/entities/interaction-stamp";

// assumes stamp.targetNote is populated
export default async (request: IQuoteRequest, stamp: InteractionStamp) => ({
	type: "Accept",
	to: request.actor,
	actor: `${config.url}/users/${stamp.targetNote!.userId}`,
	object: {
		type: "QuoteRequest",
		id: request.id,
		actor: request.actor,
		object: request.object,
		instrument: request.instrument,
	},
	result: `${config.url}/stamp/${stamp.id}`,
});
