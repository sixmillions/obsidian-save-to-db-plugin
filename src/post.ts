import { TFile, Vault } from "obsidian";
import { Pool } from "pg";
import { MyData, PostInfo } from "./model";
import { getNoteInfo } from "./util";

export const savePost = async (vault: Vault, mydata: MyData) => {
	// 数据库连接
	const pool = new Pool(mydata.mySetting.db);
	// 插入或者更新语句（根据文章path判断）
	const upsertCntSql = `
  INSERT INTO tt_content (ob_path, cnt, created_at) VALUES ($1, $2, $3)
  ON CONFLICT(ob_path) DO UPDATE SET cnt = EXCLUDED.cnt, last_modified_at = now()
  RETURNING *
  `;
	const upsertPostInfoSql = `
  INSERT INTO tt_post (
    id, slug, title, thumbnail, summary, 
    status, top_priority, word_count, allow_comment, published_time, 
    last_edit_time, created_by, created_at, last_modified_by, last_modified_at
  ) VALUES (
    $1, $2, $3, $4, $5, 
    $6, $7, $8, $9, $10, 
    $11, $12, $13, $14, $15
  ) ON CONFLICT(id) 
  DO UPDATE SET 
    slug=EXCLUDED.slug,
    title=EXCLUDED.title,
    thumbnail=EXCLUDED.thumbnail,
    summary=EXCLUDED.summary,
    status=EXCLUDED.status,
    top_priority=EXCLUDED.top_priority,
    word_count=EXCLUDED.word_count,
    allow_comment=EXCLUDED.allow_comment,
    published_time=EXCLUDED.published_time,
    last_edit_time=EXCLUDED.last_edit_time,
    last_modified_by=EXCLUDED.last_modified_by,
    last_modified_at = now()
  RETURNING *
  `;
	// 获取全部MD文档
	const files = vault.getMarkdownFiles();
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const path = file.path;
		// console.log(path, this.mydata.posts[path]?.sync);
		if (mydata.posts[path]?.sync) {
			// 已同步状态不需要同步
			continue;
		}
		// 读取文章内容
		const fileCnt = await vault.read(file);
		const cntValues = [path, fileCnt, new Date(file.stat.ctime)];
		// 文章保存到数据库
		const cntSqlRes = await pool.query(upsertCntSql, cntValues);
		console.log(path, " save-to-db, id: ", cntSqlRes.rows[0].id);
		// 解析front-matter
		const postInfo = await getNoteInfo(fileCnt, file);
		const postInfoValues = postInfoHandler(
			postInfo,
			parseInt(cntSqlRes.rows[0].id),
			file
		);
		console.log("postInfoValues", postInfoValues);
		const postInfoSqlRes = await pool.query(
			upsertPostInfoSql,
			postInfoValues
		);
		console.log("post info :", postInfoSqlRes.rows[0]);
		// 同步后文章状态设置为“已同步”
		mydata.posts[path] = {
			sync: true,
			id: parseInt(cntSqlRes.rows[0].id),
		};
	}
	// 关闭数据库连接
	await pool.end();
};

const postInfoHandler = (info: PostInfo, id: number, file: TFile) => {
	// 0：草稿；1：发布
	const status = info.draft ? 0 : 1;
	const publishedTime = info.draft ? null : new Date();
	return [
		id,
		info.slug,
		info.title,
		info.cover,
		info.description,

		status,
		info.order,
		info.wordCount,
		info.allowComment,
		publishedTime,

		new Date(file.stat.mtime),
		info.author,
		new Date(file.stat.ctime),
		info.author,
		new Date(),
	];
};
