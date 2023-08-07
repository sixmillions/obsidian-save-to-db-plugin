import { TFile, Vault } from 'obsidian'
import { Pool } from 'pg'
import { MyData, PostInfo } from './model'
import { getNoteInfo } from './util'

// 插入或者更新语句（根据文章path判断）
const upsertCntSql = `
  INSERT INTO tt_content (ob_path, cnt, created_at) VALUES ($1, $2, $3)
  ON CONFLICT(ob_path) DO UPDATE SET cnt = EXCLUDED.cnt, last_modified_at = now()
  RETURNING *
`

// 插入或者更新文章信息（根据文章id判断）
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
`

const upsertTagSql = `
  INSERT INTO tt_tag (slug) VALUES ($1) ON CONFLICT(slug) DO NOTHING RETURNING *
`
const upsertTrTagSql = `
  INSERT INTO tr_post_tag (post_id, tag_id)
  SELECT $1 as post_id, id as tag_id FROM tt_tag where slug = $2
  ON CONFLICT(post_id, tag_id) DO NOTHING RETURNING *
`
const upsertCategorySql = `
  INSERT INTO tt_category (slug) VALUES ($1) ON CONFLICT(slug) DO NOTHING RETURNING *
`
const upsertTrCategorySql = `
  INSERT INTO tr_post_category (post_id, category_id)
  SELECT $1 as post_id, id as category_id FROM tt_tag where slug = $2
  ON CONFLICT(post_id, category_id) DO NOTHING RETURNING *
`

export const savePost = async (vault: Vault, mydata: MyData) => {
  // 数据库连接
  const pool = new Pool(mydata.mySetting.db)
  // 获取全部MD文档
  const files = vault.getMarkdownFiles()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const path = file.path
    // console.log(path, this.mydata.posts[path]?.sync);
    if (mydata.posts[path]?.sync) {
      // 已同步状态不需要同步
      continue
    }
    // 读取文章内容
    const fileCnt = await vault.read(file)
    const cntValues = [path, fileCnt, new Date(file.stat.ctime)]
    // 文章保存到数据库
    const cntSqlRes = await pool.query(upsertCntSql, cntValues)
    const postId = parseInt(cntSqlRes.rows[0].id)
    console.log(path, ' save-to-db, id: ', postId)

    // 解析front-matter
    const postInfo = await getNoteInfo(fileCnt, file)
    const postInfoValues = postInfoHandler(postInfo, postId, file)
    // 文章基本信息处理
    const postInfoSqlRes = await pool.query(upsertPostInfoSql, postInfoValues)
    console.log('post info save success:', postInfoSqlRes.rows[0].title)

    // 处理tag和category
    for (const tag of postInfo.tags) {
      await pool.query(upsertTagSql, [tag.trim()])
      await pool.query(upsertTrTagSql, [postId, tag.trim()])
    }
    for (const category of postInfo.categories) {
      await pool.query(upsertCategorySql, [category.trim()])
      await pool.query(upsertTrCategorySql, [postId, category.trim()])
    }
    // 同步后文章状态设置为“已同步” (地址引用，这里变了，原始值也会变)
    mydata.posts[path] = {
      sync: true,
      id: postId,
    }
  }
  // 关闭数据库连接
  await pool.end()
}

/**
 * 构建tt_post表的的填充数据
 */
const postInfoHandler = (info: PostInfo, id: number, file: TFile) => {
  // 0：草稿；1：发布
  const status = info.draft ? 0 : 1
  const publishedTime = info.draft ? null : new Date()
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
  ]
}
