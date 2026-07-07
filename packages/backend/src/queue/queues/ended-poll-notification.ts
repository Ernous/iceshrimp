import { Notes, PollVotes } from "@/models/index.js";
import type { EndedPollNotificationJobData } from "@/queue/types.js";
import { createNotification } from "@/services/create-notification.js";
import { deliverQuestionUpdate } from "@/services/note/polls/update.js";
import { Job } from "bullmq";
import { createQueue } from "./index.js";

async function process(job: Job<EndedPollNotificationJobData>): Promise<string> {
	if (job.data == null || Object.keys(job.data).length === 0) {
		job.opts.removeOnComplete = true;
		return "skip: corrupt job";
	}
	const note = await Notes.findOneBy({ id: job.data.noteId });
	if (note == null || !note.hasPoll) {
		return "skip: note not found";
	}

	const votes = await PollVotes.createQueryBuilder("vote")
		.select("vote.userId")
		.where("vote.noteId = :noteId", { noteId: note.id })
		.innerJoinAndSelect("vote.user", "user")
		.andWhere("user.host IS NULL")
		.getMany();

	const userIds = [...new Set([note.userId, ...votes.map((v) => v.userId)])];

	for (const userId of userIds) {
		createNotification(userId, "pollEnded", {
			note: note,
			noteId: note.id,
		});
	}

	// Broadcast the poll result once it ends
	if (!note.localOnly) await deliverQuestionUpdate(note.id);

	return "complete"
}

export const [endedPollNotificationQueue, endedPollNotificationInit] =
	createQueue("endedPollNotification", process);
