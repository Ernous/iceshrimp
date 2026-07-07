import config from "@/config/index.js";
import { InteractionStamp } from "@/models/entities/interaction-stamp";

// assumes stamp.note and stamp.targetNote are populated
export default (stamp: InteractionStamp) => ({
	id: `${config.url}/stamp/${stamp.id}`,
	type: "QuoteAuthorization",
	attributedTo: `${config.url}/users/${stamp.targetNote!.userId}`,
	interactingObject:
		stamp.note!.userHost === null
			? `${config.url}/notes/${stamp.note!.id}`
			: stamp.note!.uri,
	interactionTarget: `${config.url}/notes/${stamp.targetNoteId}`,
});
