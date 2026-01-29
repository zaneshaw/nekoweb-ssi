import config from "./config.json";
import { join } from "path";

type Directive = {
	type: "include" | "layout" | "block" | "endblock";
	args: { [key: string]: string };
	startIndex: number;
	endIndex: number;
};

let layout: string | undefined;

// https://stackoverflow.com/a/40782646
function matchBetweenAll(str: string, from: string, to: string, inner: boolean = true) {
	const regex = new RegExp(`(${inner ? "?<=" : ""}${from}\s*).*?(${inner ? "?=" : ""}\s*${to})`, "gs");

	return str.match(regex)?.map((x) => x.trim()) || [];
}

function matchBetween(str: string, from: string, to: string, inner: boolean = true) {
	const regex = new RegExp(`(${inner ? "?<=" : ""}${from}\s*).*?(${inner ? "?=" : ""}\s*${to})`, "s");

	return str.match(regex)?.[0].trim();
}

// https://stackoverflow.com/a/14880260
function replaceBetween(targetStr: string, srcStr: string, from: number, to: number) {
	return targetStr.substring(0, from) + srcStr + targetStr.substring(to);
}

function parseDirectives(html: string) {
	let cursor = 0;
	const directives: Directive[] = matchBetweenAll(html, "<!--#", "-->", false).map((directive) => {
		const startIndex = html.indexOf(directive, cursor);
		const content = matchBetween(directive, "<!--#", "-->")!;
		const args: { [key: string]: string } = {};

		for (const arg of content.split(" ").slice(1)) {
			const key = arg.split("=")[0]!;
			const value = arg.split("=")[1]?.slice(1, -1)!;
			args[key] = value;
		}

		cursor = startIndex + directive.length;

		return {
			type: content.split(" ")[0],
			args: args,
			startIndex: startIndex,
			endIndex: startIndex + directive.length,
		} as Directive;
	});

	return directives;
}

async function resolveIncludeDirective(html: string, directive: Directive) {
	if (directive.args.file) {
		const file = Bun.file(join(config.public_path, directive.args.file));
		const includeHtml = await file.text();

		const patchedHtml = replaceBetween(html, includeHtml, directive.startIndex, directive.endIndex);

		return patchedHtml;
	}

	return html;
}

async function resolveBlockDirective(html: string, directive: string, endDirective: string) {
	console.log(html.indexOf(directive), html.indexOf(endDirective));

	return html;
}

async function resolveDirectives(html: string, directives: Directive[]) {
	// loop just looks for the first handled directive
	for (let i = 0; i < directives.length; i++) {
		const directive = directives[i]!;

		if (directive.type == "include") {
			const resolved = await resolveIncludeDirective(html, directive);
			return resolveDirectives(resolved, directives.toSpliced(i, 1));
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
			let html = await file.text();

			const directives = parseDirectives(html);
			html = await resolveDirectives(html, directives);

			return new Response(html, { headers: { "Content-Type": "text/html" } });
		} else if (dest == "image" || dest == "script" || dest == "font" || dest == "iframe") {
			return new Response(Bun.file(join(config.public_path, url.pathname)));
		} else if (dest == "empty") {
			return new Response(null);
		}

		return new Response(null, { status: 404 });
	},
});

console.log(`server started on port ${config.port}`);
