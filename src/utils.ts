import type { NekowebStats } from "./types";

let statsCache: {
	domain: string;
	stats: NekowebStats;
} | null = null;

export function matchBetweenAll(str: string, from: string, to: string, inner: boolean = true) {
	return matchBetween(str, from, to, inner, true);
}

// https://stackoverflow.com/a/40782646
export function matchBetween(str: string, from: string, to: string, inner: boolean = true, global: boolean = false) {
	const regex = new RegExp(`(${inner ? "?<=" : ""}${from}\s*).*?(${inner ? "?=" : ""}\s*${to})`, global ? "gs" : "s");

	return str.match(regex)?.map((x) => x.trim()) || [];
}

// https://stackoverflow.com/a/14880260
export function replaceBetween(targetStr: string, srcStr: string, from: number, to: number) {
	return targetStr.substring(0, from) + srcStr + targetStr.substring(to);
}

export async function fetchNekowebStats(domain: string) {
	if (statsCache == null || statsCache.domain != domain) {
		const res = await fetch(`https://nekoweb.org/api/site/info/${domain}`);

		if (res.ok) {
			const json = await res.json();
			statsCache = { domain, stats: json as NekowebStats };
		} else {
			console.error(res.status, res.statusText);
			return null;
		}
	}

	return statsCache.stats;
}
