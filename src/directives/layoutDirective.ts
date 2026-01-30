import { config } from "../main";
import type { Directive } from "../types";
import { join } from "path";

export async function resolveLayoutDirective(directive: Directive) {
	if (directive.args.file) {
		const file = Bun.file(join(config.public_path, directive.args.file));
		return await file.text();
	}

	return undefined;
}
