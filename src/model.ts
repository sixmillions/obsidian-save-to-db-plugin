export interface PostInfo {
	title: string;
	slug: string;
	description: string;
	author: string;
	data: Date;
	cover: string;
	draft: boolean;
	order: number;
	wordCount: number;
	allowComment: boolean;
	tags: string[];
	categories: string[];
}

export interface Post {
	sync: boolean;
	id: number;
}

export interface DB_URI {
	host: string;
	port: number;
	database: string;
	user: string;
	password: string;
}

export interface MyData {
	mySetting: { db: DB_URI };
	posts: Record<string, Post>;
}
