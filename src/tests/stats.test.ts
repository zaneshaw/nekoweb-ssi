import { config, resolveDirectives } from "../main";
import { fetchNekowebStats } from "../utils";
import { expect, test } from "bun:test";
import { resolve } from "path";

test("stats", async () => {
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
`<p>${stats!.views}</p>
<p>${stats!.followers}</p>
<p>${stats!.updates}</p>
`;

	const resolved = await resolveDirectives(html);

	expect(resolved).toBe(expected);
});
