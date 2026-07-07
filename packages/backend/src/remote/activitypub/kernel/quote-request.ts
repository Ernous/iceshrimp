import { CacheableRemoteUser } from "@/models/entities/user";
import type { IQuoteRequest } from "../type.js";
import { resolveNote } from "../models/note.js";
import renderAcceptQuoteRequest from "@/remote/activitypub/renderer/accept-quote-request.js";
import { deliverToUser } from "../deliver-manager.js";
import { renderActivity } from "../renderer/index.js";
import { parseUri } from "../db-resolver.js";
import { InteractionStamps, Notes } from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";

export default async (
	actor: CacheableRemoteUser,
	activity: IQuoteRequest,
): Promise<string> => {
	const localParsed = parseUri(activity.object);
	if (!localParsed.local) return "skip: local note not local";

	const [note, targetNote] = await Promise.all([
		resolveNote(activity.instrument),
		Notes.findOneBy({ id: localParsed.id }),
	]);

	if (note === null) return "skip: note not found";
	if (note.userId !== actor.id) return "skip: actor is requesting authorization for a quote they didn't make";
	if (targetNote === null) return "skip: target note not found";
	if (!await Notes.isVisibleForMe(targetNote, actor.id)) return "skip: target note is not visible for remote user"

	let stamp = await InteractionStamps.findOneBy({
		noteId: note.id,
		targetNoteId: targetNote.id,
	});

	if (stamp === null) {
		stamp = {
			id: genId(),
			type: "quote",
			noteId: note.id,
			targetNoteId: targetNote.id,
		};
		await InteractionStamps.insert(stamp);
	}

	stamp.note = note;
	stamp.targetNote = targetNote;

	await deliverToUser(
		{
			id: targetNote.userId,
			host: null,
		},
		renderActivity(await renderAcceptQuoteRequest(activity, stamp)),
		actor,
	);
	return "ok";
};
