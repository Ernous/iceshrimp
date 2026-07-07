import { queueLogger } from "../../logger.js";
import { deleteFileSync } from "@/services/drive/delete-file.js";
import { Users, DriveFiles } from "@/models/index.js";
import { MoreThan } from "typeorm";
import type { DbUserJobData } from "@/queue/types.js";
import { Job } from "bullmq";

const logger = queueLogger.createSubLogger("delete-drive-files");

export async function deleteDriveFiles(
	job: Job<DbUserJobData>,
): Promise<string> {
	logger.info(`Deleting drive files of ${job.data.user.id} ...`);

	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		return "skip: User not found";
	}

	let deletedCount = 0;
	let cursor: any = null;

	while (true) {
		const files = await DriveFiles.find({
			where: {
				userId: user.id,
				...(cursor ? { id: MoreThan(cursor) } : {}),
			},
			take: 100,
			order: {
				id: 1,
			},
		});

		if (files.length === 0) {
			job.updateProgress(100);
			break;
		}

		cursor = files[files.length - 1].id;

		for (const file of files) {
			await deleteFileSync(file);
			deletedCount++;
		}

		const total = await DriveFiles.countBy({
			userId: user.id,
		});

		job.updateProgress(deletedCount / total);
	}

	logger.succ(
		`All drive files (${deletedCount}) of ${user.id} has been deleted.`,
	);
	return "Success";
}
