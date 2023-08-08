import { TFile, Vault } from 'obsidian'
import { Pool } from 'pg'
import { MyData, FrontMatter } from './model'
import { frontMatterHandle } from './util'

// 插入或者更新文章内容（根据文章ob_path判断）
const upsertCntSql = `
  INSERT INTO tt_content (ob_path, front_matter, cnt, created_at) VALUES ($1, $2, $3, $4)
  ON CONFLICT(ob_path) 
  DO UPDATE SET 
    cnt = EXCLUDED.cnt, 
    front_matter = EXCLUDED.front_matter, 
    last_modified_at = now()
  RETURNING *
`
// 插入或者更新文章信息（根据文章id判断）
const upsertPostSql = `
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
// tag不存在则插入
const upsertTagSql = `
  INSERT INTO tt_tag (slug) VALUES ($1) ON CONFLICT(slug) DO NOTHING RETURNING *
`
// post和tag的关系
const upsertTrTagSql = `
  INSERT INTO tr_post_tag (post_id, tag_id)
  SELECT $1 as post_id, id as tag_id FROM tt_tag where slug = $2
  ON CONFLICT(post_id, tag_id) DO NOTHING RETURNING *
`
// category不存在则插入
const upsertCategorySql = `
  INSERT INTO tt_category (slug) VALUES ($1) ON CONFLICT(slug) DO NOTHING RETURNING *
`
// post和category的关系
const upsertTrCategorySql = `
  INSERT INTO tr_post_category (post_id, category_id)
  SELECT $1 as post_id, id as category_id FROM tt_category where slug = $2
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
    // 解析front-matter
    const frontMatter = getFrontMatter(fileCnt, file)

    // 文章内容保存到数据库
    const cntValues = [path, JSON.stringify(frontMatter), fileCnt, new Date(file.stat.ctime)]
    const cntSqlRes = await pool.query(upsertCntSql, cntValues)
    const postId = parseInt(cntSqlRes.rows[0].id)
    console.log('SaveToDB --- upsertCntSql: postId(%d), path(%s)', postId, path)

    // 文章信息插入或者更新到数据库
    const postValues = postInfoHandler(frontMatter, postId, file)
    const postInfoSqlRes = await pool.query(upsertPostSql, postValues)
    console.log('SaveToDB --- upsertPostSql: title(%s)', postInfoSqlRes.rows[0].title)

    // 处理tag
    for (const tag of frontMatter.tags) {
      await pool.query(upsertTagSql, [tag.trim()])
      await pool.query(upsertTrTagSql, [postId, tag.trim()])
    }
    // 处理category
    for (const category of frontMatter.categories) {
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
 * 获取front-matter，没有的赋默认值
 */
const getFrontMatter = (cnt: string, file: TFile) => {
  const defaultInfo: FrontMatter = {
    title: file.path,
    slug: file.path,
    description: file.path,
    author: 'six',
    data: new Date(file.stat.ctime),
    cover: '',
    draft: false,
    order: 0,
    wordCount: cnt.length,
    allowComment: true,
    tags: [],
    categories: ['default'],
  }
  const info = frontMatterHandle(cnt)
  // 浅拷贝，info覆盖defaultInfo
  return Object.assign({}, defaultInfo, info)
}

/**
 * 构建tt_post表的的填充数据
 */
const postInfoHandler = (info: FrontMatter, id: number, file: TFile) => {
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
