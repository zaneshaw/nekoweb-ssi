import { config } from "../main";
import type { Directive } from "../types";
import { fetchNekowebStats, replaceBetween } from "../utils";

export async function resolveStatDirective(html: string, directive: Directive) {
	let str = "";

	if (directive.type == "views" || directive.type == "followers" || directive.type == "updates") {
		if (config.site_domain) {
			const stats = await fetchNekowebStats(config.site_domain);
			if (stats) {
				str = directive.args?.format == "false" ? stats[directive.type].toString() : stats[directive.type].toLocaleString("en-US");
			} else {
				console.error(`can't resolve ${directive.type} directive! failed to fetch stats.`);
			}
		} else {
			str = "?";
			console.error(`can't resolve ${directive.type} directive! site_domain is null.`);
		}
	} else {
		console.error("directive is not a stat directive! must be either 'views', 'followers', or 'updates'.");
	}

	return replaceBetween(html, str, directive.startIndex, directive.endIndex);
}
