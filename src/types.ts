export type Config = {
	port: number;
	public_path: string;
	pretty_links: boolean;
	site_domain: string | null;
};

export type Directive = {
	type: "include" | "layout" | "block" | "endblock" | "views" | "followers" | "updates";
	args: { [key: string]: string };
	startIndex: number;
	endIndex: number;
};

export type NekowebStats = {
	domain: string;
	title: string;
	updates: number;
	followers: number;
	views: number;
	created_at: number;
	updated_at: number;
};
