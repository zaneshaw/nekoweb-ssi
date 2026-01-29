import config from "./config.json";
import { join } from "path";

// https://stackoverflow.com/a/40782646
function matchBetweenAll(str: string, from: string, to: string) {
	const regex = new RegExp(`(?<=${from}\s*).*?(?=\s*${to})`, "gs");

	return str.match(regex)?.map((x) => x.trim()) || [];
}

function matchBetween(str: string, from: string, to: string) {
	const regex = new RegExp(`(?<=${from}\s*).*?(?=\s*${to})`, "s");

	return str.match(regex)?.[0].trim();
}

// https://stackoverflow.com/a/14880260
function replaceBetween(targetStr: string, srcStr: string, from: number, to: number) {
	return targetStr.substring(0, from) + srcStr + targetStr.substring(to);
}

async function resolveIncludeDirective(html: string, directive: string) {
	const path = matchBetween(directive, 'file="', '"');

	if (path) {
		const file = Bun.file(join(config.public_path, path));
		const includeHtml = await file.text();

		const from = html.indexOf("<!--# include");
		const to = html.indexOf("-->", from) + 3;
		const patchedHtml = replaceBetween(html, includeHtml, from, to);

		return patchedHtml;
	}

	return html;
}

async function resolveDirectives(html: string) {
	const directives = new Set(matchBetweenAll(html, "<!--#", "-->"));

	for (const directive of directives) {
		const directiveType = directive.split(" ")[0];

		if (directiveType == "include") {
			const resolved = await resolveIncludeDirective(html, directive);
			return resolveDirectives(resolved);
		}
	}

	return html;
}

Bun.serve({
	port: config.port,
	async fetch(req) {
		const dest = req.headers.get("sec-fetch-dest");
		const url = new URL(req.url);

		// delete me. just for development. the errors got annoying
		if (url.pathname == "/favicon.ico") {
			return new Response(null);
		}

		if (dest == "document") {
			const path = url.pathname == "/" ? "index.html" : url.pathname;
			const file = Bun.file(join(config.public_path, path));
			const html = await resolveDirectives(await file.text());

			return new Response(html, { headers: { "Content-Type": "text/html" } });
		} else if (dest == "image" || dest == "script" || dest == "font" || dest == "iframe") {
			return new Response(Bun.file(join(config.public_path, url.pathname)));
		} else if (dest == "empty") {
			return new Response(null);
		}

		return new Response(null, { status: 404 });
	},
});
