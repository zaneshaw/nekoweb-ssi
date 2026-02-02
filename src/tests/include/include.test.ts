import { config, resolveDirectives } from "../../main";
import { expect, test } from "bun:test";
import { resolve } from "path";

test("simple include 1", async () => {
	config.public_path = resolve(import.meta.dir, "../public");

	// prettier-ignore
	const html = /* HTML */
`<!--# include file="includes/header.html" -->
<main>
	<h1>my website</h1>
</main>
`;

	// prettier-ignore
	const expected = /* HTML */
`<head>
	<title>title</title>
</head>

<main>
	<h1>my website</h1>
</main>
`;

	const resolved = await resolveDirectives(html);

	expect(resolved).toBe(expected);
});
