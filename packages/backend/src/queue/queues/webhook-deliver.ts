import Logger from "@/services/logger.js";
import type { WebhookDeliverJobData } from "../types.js";
import { getResponse, StatusError } from "@/misc/fetch.js";
import { Webhooks } from "@/models/index.js";
import config from "@/config/index.js";
import { Job } from "bullmq";
import { Webhook, webhookEventTypes } from "@/models/entities/webhook.js";
import { v4 as uuid } from "uuid";
import { createQueue, defaultJobOpts, processorTimeout } from "./index.js";

const logger = new Logger("webhook");

async function process(job: Job<WebhookDeliverJobData>) {
	if (job.data == null || Object.keys(job.data).length === 0) {
		job.opts.removeOnComplete = true;
		return "Skip (data was null or empty)";
	}
	try {
		logger.debug(`delivering ${job.data.webhookId}`);

		const res = await getResponse({
			url: job.data.to,
			method: "POST",
			headers: {
				"User-Agent": "Iceshrimp-Hooks",
				"X-Iceshrimp-Host": config.host,
				"X-Iceshrimp-Hook-Id": job.data.webhookId,
				"X-Iceshrimp-Hook-Secret": job.data.secret,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				hookId: job.data.webhookId,
				userId: job.data.userId,
				eventId: job.data.eventId,
				createdAt: job.data.createdAt,
				type: job.data.type,
				body: job.data.content,
			}),
		});

		Webhooks.update(
			{ id: job.data.webhookId },
			{
				latestSentAt: new Date(),
				latestStatus: res.status,
			},
		);

		return "Success";
	} catch (res) {
		Webhooks.update(
			{ id: job.data.webhookId },
			{
				latestSentAt: new Date(),
				latestStatus: res instanceof StatusError ? res.statusCode : 1,
			},
		);

		if (res instanceof StatusError) {
			// 4xx
			if (!res.isRetryable) {
				return `${res.statusCode} ${res.statusMessage}`;
			}

			// 5xx etc.
			throw new Error(`${res.statusCode} ${res.statusMessage}`);
		} else {
			// DNS error, socket error, timeout ...
			throw res;
		}
	}
};

export const [webhookDeliverQueue, webhookDeliverInit] =
	createQueue(
		"webhookDeliver",
		processorTimeout(process, 60),
		{ limitPerSec: 64, concurrency: 64 },
	);

export function webhookDeliverJob(
	webhook: Webhook,
	type: typeof webhookEventTypes[number],
	content: unknown,
) {
	const data = {
		type,
		content,
		webhookId: webhook.id,
		userId: webhook.userId,
		to: webhook.url,
		secret: webhook.secret,
		createdAt: Date.now(),
		eventId: uuid(),
	};

	return webhookDeliverQueue.add("default", data, {
		attempts: 4,
		backoff: {
			type: "custom",
		},
		...defaultJobOpts,
	});
}
