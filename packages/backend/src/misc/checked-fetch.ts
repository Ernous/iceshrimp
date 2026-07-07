import * as http from "node:http";
import * as https from "node:https";
import net from "node:net";
import { HttpProxyAgent, HttpsProxyAgent } from "hpagent";
import config from "@/config/index.js";
import IPCIDR from "ip-cidr";
import PrivateIp from "private-ip";
import { Duplex } from "node:stream";
import { ClientRequestArgs } from "node:http";

declare module 'node:http' {
	interface Agent {
		createConnection(options: ClientRequestArgs, callback?: (err: Error | null, stream: Duplex) => void): Duplex | undefined | null;
	}
}

function isPrivateIp(ip: string): boolean {
	for (const net of config.allowedPrivateNetworks || []) {
		const cidr = new IPCIDR(net);
		if (cidr.contains(ip)) {
			return false;
		}
	}

	return PrivateIp(ip);
}

function checkConnection(socket: Duplex) {
	if (socket instanceof net.Socket) {
		const address = socket.remoteAddress;
		if (process.env.NODE_ENV === 'production') {
			if (address && IPCIDR.isValidAddress(address) && isPrivateIp(address)) {
				socket.destroy(new Error(`Blocked address: ${address}`));
			}
		}
	} else {
		throw "Tried to check connection for type that isn't net.Socket";
	}
}

export class CheckedHttpAgent extends http.Agent {
	createConnection(options: ClientRequestArgs, callback?: (err: Error | null, stream: Duplex) => void): Duplex | undefined | null {
		const socket = super.createConnection(options, callback ? (err, stream) => {
			if (stream) checkConnection(stream);
			callback(err, stream);
		} : undefined)?.on('connect', () => { socket && checkConnection(socket) });
		return socket;
	}
}

export class CheckedHttpsAgent extends https.Agent {
	createConnection(options: ClientRequestArgs, callback?: (err: Error | null, stream: Duplex) => void): Duplex | undefined | null {
		const socket = super.createConnection(options, callback ? (err, stream) => {
			if (stream) checkConnection(stream);
			callback(err, stream);
		} : undefined)?.on('connect', () => { socket && checkConnection(socket) });
		return socket;
	}
}
export class CheckedHttpProxyAgent extends HttpProxyAgent {
	createConnection(options: ClientRequestArgs, callback?: (err: Error | null, stream: Duplex) => void): Duplex | undefined | null {
		const socket = super.createConnection(options, callback ? (err, stream) => {
			if (stream) checkConnection(stream);
			callback(err, stream);
		} : undefined)?.on('connect', () => { socket && checkConnection(socket) });
		return socket;
	}
}

export class CheckedHttpsProxyAgent extends HttpsProxyAgent {
	createConnection(options: ClientRequestArgs, callback?: (err: Error | null, stream: Duplex) => void): Duplex | undefined | null {
		const socket = super.createConnection(options, callback ? (err, stream) => {
			if (stream) checkConnection(stream);
			callback(err, stream);
		} : undefined)?.on('connect', () => { socket && checkConnection(socket) });
		return socket;
	}
}
