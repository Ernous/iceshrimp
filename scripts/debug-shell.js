import net from "node:net";
import readline from "node:readline";

const sock = net.connect({ path: process.argv[2] });
sock.on("data", (data) => process.stdout.write(data));
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
rl.on("line", (input) => sock.write(`${input}\n`));

await new Promise((resolve, reject) => {
	sock.on("close", resolve);
	sock.on("error", reject);
	rl.on("close", resolve);
});

sock.destroy();
rl.close();
