import { db } from "@/db/postgre.js";
import { Instance } from "@/models/entities/instance.js";
import type { Packed } from "@/misc/schema.js";
import {
	shouldBlockInstance,
	shouldSilenceInstance,
} from "@/misc/should-block-instance.js";

export const InstanceRepository = db.getRepository(Instance).extend({
	async pack(instance: Instance, privileged: boolean = true): Promise<Packed<"FederationInstance">> {
		return {
			id: instance.id,
			caughtAt: instance.caughtAt.toISOString(),
			host: instance.host,
			usersCount: instance.usersCount,
			notesCount: instance.notesCount,
			followingCount: instance.followingCount,
			followersCount: instance.followersCount,
			latestRequestSentAt: instance.latestRequestSentAt
				? instance.latestRequestSentAt.toISOString()
				: null,
			lastCommunicatedAt: instance.lastCommunicatedAt.toISOString(),
			isNotResponding: instance.isNotResponding,
			isSuspended: privileged ? instance.isSuspended : false,
			isBlocked: privileged ? await shouldBlockInstance(instance.host) : false,
			isSilenced: privileged ? await shouldSilenceInstance(instance.host) : false,
			softwareName: instance.softwareName,
			softwareVersion: instance.softwareVersion,
			openRegistrations: instance.openRegistrations,
			name: instance.name,
			description: instance.description,
			maintainerName: instance.maintainerName,
			maintainerEmail: instance.maintainerEmail,
			iconUrl: instance.iconUrl,
			faviconUrl: instance.faviconUrl,
			themeColor: instance.themeColor,
			infoUpdatedAt: instance.infoUpdatedAt
				? instance.infoUpdatedAt.toISOString()
				: null,
		};
	},

	packMany(instances: Instance[], privileged: boolean = true) {
		return Promise.all(instances.map((x) => this.pack(x, privileged)));
	},
});
