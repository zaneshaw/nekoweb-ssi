export type Config = {
	port: number;
	public_path: string;
};

export type Directive = {
	type: "include" | "layout" | "block" | "endblock";
	args: { [key: string]: string };
	startIndex: number;
	endIndex: number;
};