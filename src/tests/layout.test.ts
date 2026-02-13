import { config, resolveDirectives } from "../main";
import { expect, test } from "bun:test";
import { resolve } from "path";

test("simple layout 1", async () => {
	config.public_path = resolve(import.meta.dir, "public");

	// prettier-ignore
	const html = /* HTML */
`<!--# layout file="layouts/main.html" -->
<!--# block name="content" -->
<h2>test page</h2>
<p>this is a test page</p>
<!--# endblock -->`;

	// prettier-ignore
	const expected = /* HTML */
`<!doctype html>
<html>
	<head>
		<title>title</title>
	</head>
	<body>
		<header>
			<h1>my website</h1>
		</header>
\t\t
<h2>test page</h2>
<p>this is a test page</p>

		<footer>
			<p>footer</p>
		</footer>
	</body>
</html>
`;

	const resolved = await resolveDirectives(html);

	expect(resolved).toBe(expected);
});

test("simple layout 2", async () => {
	config.public_path = resolve(import.meta.dir, "public");

	// prettier-ignore
	const html = /* HTML */
`<!--# layout file="layouts/main.html" -->
<!--# block name="content" -->
	<h2>test page</h2>
	<p>this is a test page</p>
<!--# endblock -->
`;

	// prettier-ignore
	const expected = /* HTML */
`<!doctype html>
<html>
	<head>
		<title>title</title>
	</head>
	<body>
		<header>
			<h1>my website</h1>
		</header>
\t\t
	<h2>test page</h2>
	<p>this is a test page</p>

		<footer>
			<p>footer</p>
		</footer>
	</body>
</html>
`;

	const resolved = await resolveDirectives(html);

	expect(resolved).toBe(expected);
});

test("empty layout 1", async () => {
	config.public_path = resolve(import.meta.dir, "public");

	// prettier-ignore
	const html = /* HTML */
`<!--# layout file="layouts/main.html" -->
`;

	// prettier-ignore
	const expected = /* HTML */
`<!doctype html>
<html>
	<head>
		<title>title</title>
	</head>
	<body>
		<header>
			<h1>my website</h1>
		</header>
\t\t
		<p>default</p>
\t\t
		<footer>
			<p>footer</p>
		</footer>
	</body>
</html>
`;

	const resolved = await resolveDirectives(html);

	expect(resolved).toBe(expected);
});
