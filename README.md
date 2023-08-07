# 说明

- 目前仅支持PostgreSQL数据库

# 使用

## 创建表
```sql

--文章内容表
CREATE TABLE tt_content
(
    id               BIGSERIAL PRIMARY KEY,
    ob_path          VARCHAR(1024) NOT NULL UNIQUE,
    cnt              VARCHAR,
    deleted          SMALLINT    DEFAULT 0,
    created_by       VARCHAR(50) DEFAULT 'sys',
    created_at       TIMESTAMP   DEFAULT NOW(),
    last_modified_by VARCHAR(50) DEFAULT 'sys',
    last_modified_at TIMESTAMP   DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE tt_content IS '文章信息表';
COMMENT ON COLUMN tt_content.id IS '文章信息id：自增、主键';
COMMENT ON COLUMN tt_content.ob_path IS 'obsidian中的路径';
COMMENT ON COLUMN tt_content.cnt IS '文章内容';
COMMENT ON COLUMN tt_content.deleted IS '逻辑删除（0 未删除、1 删除）；CODE_GROUP: DELETED';
COMMENT ON COLUMN tt_content.created_by IS '创建人：默认sys';
COMMENT ON COLUMN tt_content.created_at IS '创建时间：默认当前时间';
COMMENT ON COLUMN tt_content.last_modified_by IS '更新人：默认sys';
COMMENT ON COLUMN tt_content.last_modified_at IS '更新时间：默认当前时间';

-- 初始数据
INSERT INTO tt_content (ob_path, cnt)
VALUES ('obsidian-save-note-to-db.md', '# Hello World');

-- 文章基本信息表
CREATE TABLE tt_post
(
    id               BIGINT PRIMARY KEY,
    slug             VARCHAR(250) NOT NULL UNIQUE,
    title            VARCHAR(1024),
    thumbnail        VARCHAR(1024),
    summary          VARCHAR(2048),
    status           SMALLINT    DEFAULT 0,
    top_priority     INT         DEFAULT 0,
    word_count       INT         DEFAULT 0,
    view_count       INT         DEFAULT 0,
    like_count       INT         DEFAULT 0,
    comment_count    INT         DEFAULT 0,
    allow_comment    BOOLEAN     DEFAULT TRUE,
    published_time   TIMESTAMP   DEFAULT NOW(),
    last_edit_time   TIMESTAMP   DEFAULT NOW(),
    deleted          SMALLINT    DEFAULT 0,
    created_by       VARCHAR(50) DEFAULT 'sys',
    created_at       TIMESTAMP   DEFAULT NOW(),
    last_modified_by VARCHAR(50) DEFAULT 'sys',
    last_modified_at TIMESTAMP   DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE tt_post IS '文章信息表';
COMMENT ON COLUMN tt_post.id IS '文章id：取自tt_content表的id';
COMMENT ON COLUMN tt_post.slug IS '文章简短url，唯一标识符';
COMMENT ON COLUMN tt_post.title IS '文章标题';
COMMENT ON COLUMN tt_post.thumbnail IS '文章缩略图/封面';
COMMENT ON COLUMN tt_post.summary IS '文章摘要';
COMMENT ON COLUMN tt_post.status IS '文章状态（0：草稿；1：发布）；CODE_GROUP: POST_STATUS';
COMMENT ON COLUMN tt_post.top_priority IS '文章优先级（数字越大，优先级越高）';
COMMENT ON COLUMN tt_post.word_count IS '文章字数';
COMMENT ON COLUMN tt_post.view_count IS '文章浏览量';
COMMENT ON COLUMN tt_post.like_count IS '文章点赞数';
COMMENT ON COLUMN tt_post.comment_count IS '文章评论数量';
COMMENT ON COLUMN tt_post.allow_comment IS '文章允许评论（true：允许评论；false：不允许评论）';
COMMENT ON COLUMN tt_post.published_time IS '文章创建时间';
COMMENT ON COLUMN tt_post.last_edit_time IS '文章最后编辑时间';
COMMENT ON COLUMN tt_post.deleted IS '逻辑删除（0 未删除、1 删除）；CODE_GROUP: DELETED';
COMMENT ON COLUMN tt_post.created_by IS '创建人：默认sys';
COMMENT ON COLUMN tt_post.created_at IS '创建时间：默认当前时间';
COMMENT ON COLUMN tt_post.last_modified_by IS '更新人：默认sys';
COMMENT ON COLUMN tt_post.last_modified_at IS '更新时间：默认当前时间';

-- 初始数据
INSERT INTO tt_post (id, slug, summary, thumbnail, title, word_count)
VALUES (1, 'obsidian-save-note-to-db', '保存obsidian笔记到数据库', 'https://s.sixmillions.cn/img/cover/markdown.png',
        'obsidian插件', 66);
```

## 配置

在插件配置页，配置数据库连接信息

## 其他

### pg模块参考

> https://developers.cloudflare.com/workers/tutorials/postgres


### Plugin Api

> https://docs.obsidian.md/Reference/TypeScript+API/Plugin/loadData

### icon

> https://docs.obsidian.md/Plugins/User+interface/Icons

> https://lucide.dev/

注意：有个别图标没有

### front-matter读取

用正则读取后，解析yaml

> https://github.com/nodeca/js-yaml

常见front-matter

> https://frontmatter.codes/docs/markdown
