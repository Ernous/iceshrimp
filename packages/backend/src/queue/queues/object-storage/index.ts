import { Job, Processor } from "bullmq";
import { createQueue, defaultJobOpts } from "../index.js";
import { cleanRemoteFiles } from "./clean-remote-files.js";
import { deleteFile } from "./delete-file.js";
import config from "@/config/index.js";

const processors = {
	cleanRemoteFiles,
	deleteFile,
} as Record<string, Processor>;

async function process(job: Job<any>): Promise<string> {
	const processor = processors[job.name];
	if (processor === undefined) return "skip: unknown job name";
	return await processor(job);
}

const [objectStorageQueue_, objectStorageInitQueue] =
	createQueue("objectStorage", process, { concurrency: 16 });
export const objectStorageQueue = objectStorageQueue_;

export async function objectStorageInit() {
	await objectStorageInitQueue();
	if (config.mediaCleanup?.cron) {
		await objectStorageQueue.upsertJobScheduler(
			"cleanRemoteFiles",
			{ pattern: "0 0 * * *" },
			{
				name: "cleanRemoteFiles",
				opts: defaultJobOpts,
			}
		)
	}
}

export function createDeleteObjectStorageFileJob(key: string) {
	return objectStorageQueue.add(
		"deleteFile",
		{
			key: key,
		},
		defaultJobOpts,
	);
}

export function createCleanRemoteFilesJob() {
	return objectStorageQueue.add(
		"cleanRemoteFiles",
		{},
		defaultJobOpts,
	);
}
