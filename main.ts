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

function getEndBlock(startBlock: Directive, directives: Directive[]) {
	let level = 0;

	for (const directive of directives) {
		if (directive.startIndex > startBlock.endIndex) {
			if (directive.type == "block") {
				level++;
			} else if (directive.type == "endblock") {
				level--;

				if (level == -1) {
					return directive;
				}
			}
		}
	}

	return null;
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

async function resolveBlockDirective(html: string, directive: Directive, endDirective: Directive) {
	const blockContent = html.substring(directive.endIndex, endDirective.startIndex);

	if (layout) {
		const lDirectives = parseDirectives(layout!);
		for (const lDirective of lDirectives) {
			if (lDirective.type == "block" && lDirective.args.name == directive.args.name) {
				const lEndBlock = getEndBlock(lDirective, lDirectives);
				if (lEndBlock) {
					layout = replaceBetween(layout!, blockContent, lDirective.startIndex, lEndBlock.endIndex);
				}
			}
		}
	}

	const left = html.slice(0, directive.startIndex);
	const middle = html.slice(directive.endIndex, endDirective.startIndex);
	const right = html.slice(endDirective.endIndex);

	return left + middle + right;
}

async function resolveDirectives(html: string) {
	const directives = parseDirectives(html);

	// loop just looks for the first handled directive
	for (let i = 0; i < directives.length; i++) {
		const directive = directives[i]!;

		if (directive.type == "include") {
			const resolved = await resolveIncludeDirective(html, directive);
			return resolveDirectives(resolved);
		} else if (directive.type == "layout" && layout == undefined) {
			if (directive.args.file) {
				const file = Bun.file(join(config.public_path, directive.args.file));
				layout = await file.text();
			}
		} else if (directive.type == "block") {
			const endBlock = getEndBlock(directive, directives);

			if (endBlock) {
				const resolved = await resolveBlockDirective(html, directive, endBlock);

				return resolveDirectives(resolved);
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

Bun.serve({
	port: config.port,
	async fetch(req) {
		const dest = req.headers.get("sec-fetch-dest");
		const url = new URL(req.url);

		// delete me. just for development. the errors got annoying
		if (url.pathname == "/favicon.ico") {
			return new Response(null);
		}

		if (dest == "document" && url.pathname.split(".").at(-1) == "html") {
			const path = url.pathname == "/" ? "index.html" : url.pathname;
			const file = Bun.file(join(config.public_path, path));
			let html = await file.text();

			layout = undefined;
			html = await resolveDirectives(html);

			return new Response(html, { headers: { "Content-Type": "text/html" } });
		} else if (dest == "empty") {
			return new Response(null);
		} else {
			return new Response(Bun.file(join(config.public_path, url.pathname)));
		}
	},
});

console.log(`server started on port ${config.port}`);
