import config from "./config.json";
import { join } from "path";

Bun.serve({
	port: config.port,
	fetch(req) {
		const dest = req.headers.get("sec-fetch-dest");
		const url = new URL(req.url);

		if (dest == "document" || dest == "iframe") {
			const path = url.pathname == "/" ? "index.html" : url.pathname;
			const file = Bun.file(join(config.public_path, path));

			return new Response(file);
		} else if (dest == "image" || dest == "script" || dest == "font") {
			return new Response(Bun.file(join(config.public_path, url.pathname)));
		} else if (dest == "empty") {
			return new Response(null);
		}

		return new Response(null, { status: 404 });
	},
});
