import { deliverQueue, inboxQueue } from "./queues.js";
import { dbInit } from "./queues/db/index.js";
import { deliverInit, deliverLogger } from "./queues/deliver.js";
import { endedPollNotificationInit } from "./queues/ended-poll-notification.js";
import { inboxInit, inboxLogger } from "./queues/inbox.js";
import { objectStorageInit } from "./queues/object-storage/index.js";
import { systemInit } from "./queues/system/index.js";
import { webhookDeliverInit } from "./queues/webhook-deliver.js";

export {
	createDeleteDriveFilesJob,
	createExportCustomEmojisJob,
	createExportNotesJob,
	createExportFollowingJob,
	createExportMuteJob,
	createExportBlockingJob,
	createExportUserListsJob,
	createImportFollowingJob,
	createImportMutingJob,
	createImportBlockingJob,
	createImportUserListsJob,
	createImportCustomEmojisJob,
	createDeleteAccountJob,
} from "./queues/db/index.js";
export {
	createDeleteObjectStorageFileJob,
	createCleanRemoteFilesJob,
} from "./queues/object-storage/index.js";
export { systemQueue } from "./queues/system/index.js";
export { deliverJob as deliver, deliverQueue } from "./queues/deliver.js";
export { endedPollNotificationQueue } from "./queues/ended-poll-notification.js";
export { inboxJob as inbox, inboxQueue } from "./queues/inbox.js";
export { webhookDeliverJob as webhookDeliver, webhookDeliverQueue } from "./queues/webhook-deliver.js";

export default async function () {
	// initialize queue workers
	await dbInit();
	await objectStorageInit();
	await systemInit();
	await deliverInit();
	await endedPollNotificationInit();
	await inboxInit();
	await webhookDeliverInit();
};

export function destroy() {
	deliverQueue.once("cleaned", (jobs, status) => {
		deliverLogger.succ(`Cleaned ${jobs.length} ${status} jobs`);
	});
	deliverQueue.clean(0, Infinity, "delayed");

	inboxQueue.once("cleaned", (jobs, status) => {
		inboxLogger.succ(`Cleaned ${jobs.length} ${status} jobs`);
	});
	inboxQueue.clean(0, Infinity, "delayed");
}
