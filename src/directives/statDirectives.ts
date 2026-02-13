import { config } from "../main";
import type { Directive } from "../types";
import { fetchNekowebStats, replaceBetween } from "../utils";
import { join } from "path";

export async function resolveViewsDirective(html: string, directive: Directive) {
	if (config.site_domain) {
		const stats = await fetchNekowebStats(config.site_domain);
		if (stats) {
			return replaceBetween(html, stats.views.toString(), directive.startIndex, directive.endIndex);
		} else {
			console.error("can't resolve views directive! failed to fetch stats.");
		}
	} else {
		console.error("can't resolve views directive! site_domain is null.");
	}

	return replaceBetween(html, "", directive.startIndex, directive.endIndex);
}

export async function resolveFollowersDirective(html: string, directive: Directive) {
	if (config.site_domain) {
		const stats = await fetchNekowebStats(config.site_domain);
		if (stats) {
			return replaceBetween(html, stats.followers.toString(), directive.startIndex, directive.endIndex);
		} else {
			console.error("can't resolve followers directive! failed to fetch stats.");
		}
	} else {
		console.error("can't resolve followers directive! site_domain is null.");
	}

	return replaceBetween(html, "", directive.startIndex, directive.endIndex);
}

export async function resolveUpdatesDirective(html: string, directive: Directive) {
	if (config.site_domain) {
		const stats = await fetchNekowebStats(config.site_domain);
		if (stats) {
			return replaceBetween(html, stats.updates.toString(), directive.startIndex, directive.endIndex);
		} else {
			console.error("can't resolve updates directive! failed to fetch stats.");
		}
	} else {
		console.error("can't resolve updates directive! site_domain is null.");
	}

	return replaceBetween(html, "", directive.startIndex, directive.endIndex);
}
