import { CacheableRemoteUser, ILocalUser } from "@/models/entities/user.js";
import { IQuoteRequest } from "../../type.js";
import { resolveNote } from "../../models/note.js";
import { Notes } from "@/models/index.js";
import { parseUri } from "../../db-resolver.js";
import edit from "@/services/note/edit.js";
import { toPuny } from "@/misc/convert-host.js";

export async function acceptQuoteRequest(
	actor: CacheableRemoteUser,
	activity: IQuoteRequest,
	result: string | undefined,
): Promise<string> {
	if (!result) return "skip: missing result";
	const localParsed = parseUri(activity.instrument);
	if (!localParsed.local) return "skip: note not local";
	const resultUrl = new URL(result);
	if (toPuny(resultUrl.host) !== actor.host) {
		return "skip: result not on same host as actor";
	}

	const [note, targetNote] = await Promise.all([
		Notes.findOne({ where: { id: localParsed.id }, relations: ["user"] }),
		resolveNote(activity.object),
	]);

	if (note === null) return "skip: note not found";
	if (targetNote === null) return "skip: target note not found";
	if (targetNote.userId !== actor.id)
		return "skip: tried to authorize note without ownership";
	if (note.renoteId === null) return "skip: note not renote";
	if (note.renoteId !== targetNote.id) return "skip: note not renoting target";
	if (note.quoteAuthorization !== null)
		return "skip: quote already authorizated";
	if (note.text == null && note.cw == null && !note.hasPoll && note.fileIds.length === 0)
		return "skip: note is plain renote";

	note.quoteAuthorization = result;
	await Notes.update(
		{ id: note.id },
		{ quoteAuthorization: note.quoteAuthorization },
	);

	await edit(note.user as unknown as ILocalUser, note, {
		text: note.text,
		cw: note.cw,
		quoteAuthorization: result,
	}, true);

	return "ok";
}
