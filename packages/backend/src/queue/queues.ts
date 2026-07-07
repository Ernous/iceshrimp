import { dbQueue } from "./queues/db/index.js";
import { deliverQueue } from "./queues/deliver.js";
import { endedPollNotificationQueue } from "./queues/ended-poll-notification.js";
import { inboxQueue } from "./queues/inbox.js";
import { objectStorageQueue } from "./queues/object-storage/index.js";
import { systemQueue } from "./queues/system/index.js";
import { webhookDeliverQueue } from "./queues/webhook-deliver.js";

export { dbQueue } from "./queues/db/index.js";
export { deliverQueue } from "./queues/deliver.js";
export { endedPollNotificationQueue } from "./queues/ended-poll-notification.js";
export { inboxQueue } from "./queues/inbox.js";
export { objectStorageQueue } from "./queues/object-storage/index.js";
export { systemQueue } from "./queues/system/index.js";
export { webhookDeliverQueue } from "./queues/webhook-deliver.js";

export const queues = [
	dbQueue,
	deliverQueue,
	endedPollNotificationQueue,
	inboxQueue,
	objectStorageQueue,
	systemQueue,
	webhookDeliverQueue,
];
