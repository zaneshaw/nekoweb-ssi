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
