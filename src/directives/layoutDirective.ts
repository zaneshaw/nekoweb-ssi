import { join } from "path";
import { config } from "../main";
import type { Directive } from "../types";

export async function resolveLayoutDirective(directive: Directive) {
	if (directive.args.file) {
		const file = Bun.file(join(config.public_path, directive.args.file));
		return await file.text();
	}

	return undefined;
}
