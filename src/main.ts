import { getEndBlock, resolveBlockDirective } from "./directives/blockDirective";
import { resolveIncludeDirective } from "./directives/includeDirective";
import { resolveLayoutDirective } from "./directives/layoutDirective";
import { parseDirectives } from "./parser";
import type { Config } from "./types";
import { join, dirname, resolve } from "path";

const rootDir = process.env.BUILD == "true" ? dirname(process.execPath) : resolve(import.meta.dir, "..");

export let config: Config;
let layout: string | undefined;

export async function resolveDirectives(html: string) {
	const directives = parseDirectives(html);

	// loop just looks for the first handled directive
	for (let i = 0; i < directives.length; i++) {
		const directive = directives[i]!;

		if (directive.type == "include") {
			const resolved = await resolveIncludeDirective(html, directive);
			return resolveDirectives(resolved);
		} else if (directive.type == "layout" && layout == undefined) {
			layout = await resolveLayoutDirective(directive);
			return resolveDirectives(html); // probably unneeded
		} else if (directive.type == "block") {
			const endBlock = getEndBlock(directive, directives);

			if (endBlock) {
				const resolved = resolveBlockDirective(html, layout, directive, endBlock);

				layout = resolved.layout;
				return resolveDirectives(resolved.html);
			}

			// todo: remove start block if no end block
		}
	}

	if (layout != undefined) {
		const newHtml = layout;
		layout = undefined;

		return resolveDirectives(newHtml);
	}

	return html;
}

const defaultConfig = {
	port: 3000,
	public_path: "C:\\PATH\\TO\\WEBSITE",
	pretty_links: false,
};
const configFile = Bun.file(join(rootDir, "config.json"));

if (await configFile.exists()) {
	config = Object.assign(defaultConfig, await configFile.json());
} else {
	console.log("\x1b[32m%s\x1b[0m", "IMPORTANT: config.json created. edit the config and restart the server!");

	config = defaultConfig;
}

await configFile.write(JSON.stringify(config, null, "\t"));

Bun.serve({
	port: config.port,
	async fetch(req) {
		const dest = req.headers.get("sec-fetch-dest");
		const url = new URL(req.url);

		if (dest == "document" && req.headers.get("accept")?.split(",").includes("text/html")) {
			if (config.pretty_links) {
				if (url.pathname.endsWith(".html")) {
					const prettyPath = url.pathname.slice(0, -5);
					return Response.redirect(new URL(prettyPath, url.origin).toString(), 301);
				} else if (url.pathname == "/index") {
					return Response.redirect(url.origin, 301);
				} else {
					url.pathname += url.pathname == "/" ? "index.html" : ".html";
				}
			}

			const file = Bun.file(join(config.public_path, url.pathname));
			let html = await file.text();

			layout = undefined;
			html = await resolveDirectives(html);

			return new Response(html, { headers: { "Content-Type": "text/html" } });
		} else if (req.headers.has("accept")) {
			return new Response(Bun.file(join(config.public_path, url.pathname)));
		}

		return new Response(null, { status: 404 });
	},
});

console.log(`server running at http://localhost:${config.port}`);
