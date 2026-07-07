import { URL } from "node:url";
import type { Meta } from "@/models/entities/meta.js";
import { getAgentByUrl } from "@/misc/fetch.js";
import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

export function getS3(meta: Meta) {
	const endpointPrefixed =
		meta.objectStorageEndpoint &&
		(meta.objectStorageEndpoint.startsWith("http://") ||
			meta.objectStorageEndpoint.startsWith("https://"));
	const endpoint = meta.objectStorageEndpoint
		? endpointPrefixed
			? meta.objectStorageEndpoint
			: `${meta.objectStorageUseSSL ? "https://" : "http://"}${meta.objectStorageEndpoint}`
		: undefined;

	const agentUrl = new URL(endpoint);
	const agent = getAgentByUrl(agentUrl, !meta.objectStorageUseProxy);

	return new S3Client({
		endpoint,
		region: meta.objectStorageRegion || "us-east-1",
		credentials: {
			accessKeyId: meta.objectStorageAccessKey!,
			secretAccessKey: meta.objectStorageSecretKey!,
		},
		forcePathStyle: meta.objectStorageEndpoint
			? meta.objectStorageS3ForcePathStyle
			: false,
		requestChecksumCalculation: "WHEN_REQUIRED",
		responseChecksumValidation: "WHEN_REQUIRED",
		requestHandler: new NodeHttpHandler({
			httpAgent: agent,
			httpsAgent: agent,
		}),
	});
}
