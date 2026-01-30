import { config } from "../main";
import type { Directive } from "../types";
import { replaceBetween } from "../utils";
import { join } from "path";

export async function resolveIncludeDirective(html: string, directive: Directive) {
	if (directive.args.file) {
		const file = Bun.file(join(config.public_path, directive.args.file));
		const includeHtml = await file.text();

		const patchedHtml = replaceBetween(html, includeHtml, directive.startIndex, directive.endIndex);

		return patchedHtml;
	}

	return html;
}
