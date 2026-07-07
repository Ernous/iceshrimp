import type { CacheableRemoteUser } from "@/models/entities/user.js";
import {
	isCreate,
	isDelete,
	isUpdate,
	isRead,
	isFollow,
	isAccept,
	isReject,
	isAdd,
	isRemove,
	isAnnounce,
	isLike,
	isUndo,
	isBlock,
	isCollectionOrOrderedCollection,
	isFlag,
	isMove,
	getApId,
	isBite,
	isQuoteRequest,
} from "../type.js";
import { apLogger } from "../logger.js";
import create from "./create/index.js";
import performDeleteActivity from "./delete/index.js";
import performUpdateActivity from "./update/index.js";
import { performReadActivity } from "./read.js";
import follow from "./follow.js";
import undo from "./undo/index.js";
import like from "./like.js";
import announce from "./announce/index.js";
import accept from "./accept/index.js";
import reject from "./reject/index.js";
import add from "./add/index.js";
import remove from "./remove/index.js";
import block from "./block/index.js";
import flag from "./flag/index.js";
import move from "./move/index.js";
import bite from "./bite.js";
import quoteRequest from "./quote-request.js";
import type { IObject } from "../type.js";
import { extractDbHost } from "@/misc/convert-host.js";
import { shouldBlockInstance } from "@/misc/should-block-instance.js";

export async function performActivity(
	actor: CacheableRemoteUser,
	activity: IObject,
): Promise<string> {
	if (isCollectionOrOrderedCollection(activity)) {
		apLogger.debug('Refusing to ingest collection as activity');
		return "skip: activity is collection";
	} else {
		return await performOneActivity(actor, activity);
	}
}

async function performOneActivity(
	actor: CacheableRemoteUser,
	activity: IObject,
): Promise<string> {
	if (actor.isSuspended) return "skip: actor suspended";

	if (typeof activity.id !== "undefined") {
		const host = extractDbHost(getApId(activity));
		if (await shouldBlockInstance(host)) return "skip: instance blocked";
	}

	if (isCreate(activity)) {
		return await create(actor, activity);
	} else if (isDelete(activity)) {
		return await performDeleteActivity(actor, activity);
	} else if (isUpdate(activity)) {
		return await performUpdateActivity(actor, activity);
	} else if (isRead(activity)) {
		return await performReadActivity(actor, activity);
	} else if (isFollow(activity)) {
		return await follow(actor, activity);
	} else if (isAccept(activity)) {
		return await accept(actor, activity);
	} else if (isReject(activity)) {
		return await reject(actor, activity);
	} else if (isAdd(activity)) {
		return await add(actor, activity).catch((err) => { apLogger.error(err); return `skip: ${err}` });
	} else if (isRemove(activity)) {
		return await remove(actor, activity).catch((err) => { apLogger.error(err);return `skip: ${err}` });
	} else if (isAnnounce(activity)) {
		return await announce(actor, activity);
	} else if (isLike(activity)) {
		return await like(actor, activity);
	} else if (isUndo(activity)) {
		return await undo(actor, activity);
	} else if (isBlock(activity)) {
		return await block(actor, activity);
	} else if (isFlag(activity)) {
		return await flag(actor, activity);
	} else if (isMove(activity)) {
		return await move(actor, activity);
	} else if (isBite(activity)) {
		return await bite(actor, activity);
	} else if (isQuoteRequest(activity)) {
		return await quoteRequest(actor, activity);
	} else {
		apLogger.warn(`unrecognized activity type: ${(activity as any).type}`);
		return `skip: unrecognized activity type: ${(activity as any).type}`;
	}
}
