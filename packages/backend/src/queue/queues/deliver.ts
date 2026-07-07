import { URL } from "node:url";
import request from "@/remote/activitypub/request.js";
import { registerOrFetchInstanceDoc } from "@/services/register-or-fetch-instance-doc.js";
import Logger from "@/services/logger.js";
import { Instances } from "@/models/index.js";
import {
	apRequestChart,
	federationChart,
	instanceChart,
} from "@/services/chart/index.js";
import { fetchInstanceMetadata } from "@/services/fetch-instance-metadata.js";
import { toPuny } from "@/misc/convert-host.js";
import { StatusError } from "@/misc/fetch.js";
import { shouldSkipInstance } from "@/misc/skipped-instances.js";
import type { DeliverJobData } from "../types.js";
import config from "@/config/index.js";
import { createQueue, defaultJobOpts, processorTimeout } from "./index.js";
import { ThinUser } from "../types.js";
import { Job } from "bullmq";
import { tickOutbox } from "@/metrics.js";

export const deliverLogger = new Logger("deliver");

let latest: string | null = null;

async function process(job: Job<DeliverJobData>) {
	if (job.data == null || Object.keys(job.data).length === 0) {
		job.opts.removeOnComplete = true;
		return "Skip (data was null or empty)";
	}
	const { host } = new URL(job.data.to);
	const puny = toPuny(host);

	if (await shouldSkipInstance(puny)) return "skip";

	try {
		if (latest !== (latest = JSON.stringify(job.data.content, null, 2))) {
			deliverLogger.debug(`delivering ${latest}`);
		}

		await request(job.data.user, job.data.to, job.data.content);

		// Update stats
		registerOrFetchInstanceDoc(host).then((i) => {
			Instances.update(i.id, {
				latestRequestSentAt: new Date(),
				latestStatus: 200,
				lastCommunicatedAt: new Date(),
				isNotResponding: false,
			});

			fetchInstanceMetadata(i);

			instanceChart.requestSent(i.host, true);
			apRequestChart.deliverSucc();
			federationChart.deliverd(i.host, true);
		});

		tickOutbox();

		return "Success";
	} catch (res) {
		// Update stats
		registerOrFetchInstanceDoc(host).then((i) => {
			Instances.update(i.id, {
				latestRequestSentAt: new Date(),
				latestStatus: res instanceof StatusError ? res.statusCode : null,
				isNotResponding: true,
			});

			instanceChart.requestSent(i.host, false);
			apRequestChart.deliverFail();
			federationChart.deliverd(i.host, false);
		});

		if (res instanceof StatusError) {
			// 4xx
			if (!res.isRetryable) {
				// HTTPステータスコード4xxはクライアントエラーであり、それはつまり
				// 何回再送しても成功することはないということなのでエラーにはしないでおく
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

export const [deliverQueue, deliverInit] = createQueue(
	"deliver",
	processorTimeout(process, 60),
	{
		limitPerSec: config.deliverJobPerSec || 32,
		concurrency: config.deliverJobConcurrency || 16,
	},
);

export function deliverJob(user: ThinUser, content: unknown, to: string | null) {
	if (content == null) return null;
	if (to == null) return null;

	const data = {
		user: {
			id: user.id,
		},
		content,
		to,
	};

	return deliverQueue.add("default", data, {
		attempts: config.deliverJobMaxAttempts || 12,
		backoff: {
			type: "custom",
		},
		...defaultJobOpts,
	});
}
