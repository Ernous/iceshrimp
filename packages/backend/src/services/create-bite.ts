import { genId } from "@/misc/gen-id.js";
import { Bites, Users } from "@/models/index.js";
import { Bite } from "@/models/entities/bite.js";
import { User } from "@/models/entities/user.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import renderBite from "@/remote/activitypub/renderer/bite.js";
import { deliverToUser } from "@/remote/activitypub/deliver-manager.js";
import { createNotification } from "./create-notification.js";
import { tickBiteLocal, tickBiteOutgoing } from "@/metrics.js";
import { getNote } from "@/server/api/common/getters.js";
import { IdentifiableError } from "@/misc/identifiable-error.js";

export async function createBite(
	sender: User,
	targetType: "user" | "bite" | "note",
	targetId: string,
	remoteUri: Bite["uri"] = null,
	createdAt: Date | null = null,
): Promise<Bite["id"]> {
	const id = genId();

	const insert = {
		id,
		createdAt: createdAt ?? new Date(),
		userId: sender.id,
		userHost: sender.host,
		targetType,
		replied: false,
		uri: remoteUri,
	} as any;

	let targetUser: User;
	switch (targetType) {
		case "user":
			insert.targetUserId = targetId;
			targetUser = await Users.findOneByOrFail({ id: targetId });
			break;
		case "bite":
			insert.targetBiteId = targetId;
			const bite = await Bites.findOneOrFail({
				where: { id: targetId },
				relations: ["user"],
			});
			targetUser = bite.user!;
			break;
		case "note":
			insert.targetNoteId = targetId;
			const note = await getNote(targetId, sender);
			targetUser = await Users.findOneByOrFail({ id: note.userId });
			break;
	}
	if (targetUser.canBite === "nobody")
		throw new IdentifiableError("92ce0141-760d-4163-a7a2-73b349e3d133", "Bites disabled");
	const relations = await Users.getRelation(sender.id, targetUser.id);
	if (targetUser.canBite === "followers" && !relations.isFollowing)
		throw new IdentifiableError("35363f14-f489-45e2-81a9-558450710dfe", "Not following");
	if (relations.isBlocked)
		throw new IdentifiableError("f82d8d34-beaf-42f3-9135-477d32288213", "Blocked");

	await Bites.insert(insert);

	const bite = await Bites.findOneOrFail({
		where: { id },
		relations: ["targetUser", "targetBite", "targetNote"],
	});

	let deliverTarget: User;

	switch (targetType) {
		case "user":
			deliverTarget = bite.targetUser!;
			break;
		case "bite":
			await Bites.update({ id: bite.targetBiteId! }, { replied: true });
			deliverTarget =
				bite.targetBite!.user ??
				(await Users.findOneByOrFail({ id: bite.targetBite!.userId }));
			break;
		case "note":
			deliverTarget =
				bite.targetNote!.user ??
				(await Users.findOneByOrFail({ id: bite.targetNote!.userId }));
			break;
	}

	if (Users.isLocalUser(sender) && Users.isRemoteUser(deliverTarget)) {
		await deliverToUser(
			sender,
			renderActivity(await renderBite(bite)),
			deliverTarget,
		);

		tickBiteOutgoing();
	}

	if (Users.isLocalUser(deliverTarget)) {
		await createNotification(deliverTarget.id, "bite", {
			notifierId: sender.id,
			biteId: bite.id,
		});

		if (Users.isLocalUser(sender)) tickBiteLocal();
	}

	return id;
}
