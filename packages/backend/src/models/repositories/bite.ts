import { db } from "@/db/postgre.js";
import { Bite } from "../entities/bite.js";
import { Packed } from "@/misc/schema.js";
import { Bites, Notes, Users } from "../index.js";
import { User } from "../entities/user.js";
import { awaitAll } from "@/prelude/await-all.js";
import config from "@/config/index.js";

export const BiteRespository = db.getRepository(Bite).extend({
	targetType(bite: Bite): "user" | "bite" | "note" {
		if (bite.targetUserId) return "user";
		if (bite.targetBiteId) return "bite";
		return "note";
	},

	async pack(
		src: Bite | Bite["id"],
		me?: { id: User["id"] } | null | undefined,
	): Promise<Packed<"Bite">> {
		const bite =
			typeof src === "object" ? src : await this.findOneByOrFail({ id: src });
		return await awaitAll({
			id: bite.id,
			user: Users.pack(bite.user ?? bite.userId, me, { detail: false }),
			targetType: BiteRespository.targetType(bite),
			target: this.packTarget(bite, me),
			replied: bite.replied,
		});
	},

	async packTarget(
		bite: Bite,
		me?: { id: User["id"] } | null | undefined,
	): Promise<Packed<"UserLite"> | Packed<"Bite">> {
		switch (BiteRespository.targetType(bite)) {
			case "user":
				return await Users.pack(bite.targetUser ?? bite.targetUserId!, me, {
					detail: false,
				});
			case "bite":
				return await this.pack(bite.targetBite ?? bite.targetBiteId!, me);
			case "note":
				return await Notes.pack(bite.targetNote ?? bite.targetNoteId!, me, {
					detail: false,
				})
		}
	},

	async targetUri(bite: Bite): Promise<string> {
		switch (BiteRespository.targetType(bite)) {
			case "user": {
				bite.targetUser =
					bite.targetUser ??
					(await Users.findOneOrFail({ where: { id: bite.targetUserId! } }));
				return (
					bite.targetUser.uri ?? `${config.url}/users/${bite.targetUserId}`
				);
			}
			case "bite": {
				bite.targetBite =
					bite.targetBite ??
					(await Bites.findOneOrFail({ where: { id: bite.targetBiteId! } }));
				return (
					bite.targetBite.uri ?? `${config.url}/bites/${bite.targetBiteId}`
				);
			}
			case "note": {
				bite.targetNote =
					bite.targetNote ??
					(await Notes.findOneOrFail({ where: { id: bite.targetNoteId! } }));
				return bite.targetNote.uri ?? `${config.url}/notes/${bite.targetBiteId}`;
			}
		}
	},

	async targetUserUri(bite: Bite): Promise<User["uri"]> {
		switch (BiteRespository.targetType(bite)) {
			case "user":
				if (!bite.targetUser)
					bite.targetUser = await Users.findOneByOrFail({
						id: bite.targetUserId!,
					});
				return bite.targetUser!.uri ?? `${config.url}/users/${bite.targetUserId!}`;
			case "bite":
				bite.targetBite =
					bite.targetBite ??
					(await Bites.findOneOrFail({
						where: { id: bite.targetBiteId! },
						relations: ["user"],
					}));
				bite.targetBite.user = bite.targetBite.user ??
					(await Users.findOneByOrFail({ id: bite.targetBite.userId }));
				return bite.targetBite.user.uri ?? `${config.url}/users/${bite.targetBite.userId}`;
			case "note":
				bite.targetNote =
					bite.targetNote ??
					(await Notes.findOneOrFail({
						where: { id: bite.targetNoteId! },
						relations: ["user"],
					}));
				bite.targetNote.user = bite.targetNote.user ??
					(await Users.findOneByOrFail({ id: bite.targetNote.userId }));
				return bite.targetNote.user.uri ?? `${config.url}/users/${bite.targetNote.userId}`;
		}
	},
});
