import { config, resolveDirectives } from "../main";
import { fetchNekowebStats } from "../utils";
import { expect, test } from "bun:test";
import { resolve } from "path";

test("views, followers, and updates", async () => {
	config.public_path = resolve(import.meta.dir, "public");
	config.site_domain = "squidee.nekoweb.org";

	// prettier-ignore
	const html = /* HTML */
`<p><!--# views --></p>
<p><!--# followers --></p>
<p><!--# updates --></p>
`;

	const stats = await fetchNekowebStats(config.site_domain);

	expect(stats).toBeObject();

	// prettier-ignore
	const expected = /* HTML */
`<p>${stats!.views.toLocaleString("en-US")}</p>
<p>${stats!.followers.toLocaleString("en-US")}</p>
<p>${stats!.updates.toLocaleString("en-US")}</p>
`;

	const resolved = await resolveDirectives(html);

	expect(resolved).toBe(expected);
});

test("views, followers, and updates (no format)", async () => {
	config.public_path = resolve(import.meta.dir, "public");
	config.site_domain = "squidee.nekoweb.org";

	// prettier-ignore
	const html = /* HTML */
`<p><!--# views format="false" --></p>
<p><!--# followers format="false" --></p>
<p><!--# updates format="false" --></p>
`;

	const stats = await fetchNekowebStats(config.site_domain);

	expect(stats).toBeObject();

	// prettier-ignore
	const expected = /* HTML */
`<p>${stats!.views}</p>
<p>${stats!.followers}</p>
<p>${stats!.updates}</p>
`;

	const resolved = await resolveDirectives(html);

	expect(resolved).toBe(expected);
});

test("views, followers, and updates (null site domain)", async () => {
	config.public_path = resolve(import.meta.dir, "public");
	config.site_domain = null;

	// prettier-ignore
	const html = /* HTML */
`<p><!--# views --></p>
<p><!--# followers --></p>
<p><!--# updates --></p>
`;

	// prettier-ignore
	const expected = /* HTML */
`<p>?</p>
<p>?</p>
<p>?</p>
`;

	const resolved = await resolveDirectives(html);

	expect(resolved).toBe(expected);
});
