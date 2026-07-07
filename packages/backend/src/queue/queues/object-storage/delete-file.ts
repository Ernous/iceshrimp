import type { ObjectStorageFileJobData } from "@/queue/types.js";
import { deleteObjectStorageFile } from "@/services/drive/delete-file.js";
import { Job } from "bullmq";

export async function deleteFile(job: Job<ObjectStorageFileJobData>): Promise<string> {
	const key: string = job.data.key;

	await deleteObjectStorageFile(key);

	return "Success";
};
