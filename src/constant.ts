export const DB_INIT_SQL = `
-- 文章内容表
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
COMMENT ON TABLE tt_content IS '文章内容表';
COMMENT ON COLUMN tt_content.id IS '文章id：自增、主键';
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

---

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

---

--标签表
CREATE TABLE tt_tag
(
    id               BIGSERIAL PRIMARY KEY,
    slug             VARCHAR(50) NOT NULL UNIQUE,
    tag_name         VARCHAR(50) NOT NULL,
    thumbnail        VARCHAR(1024),
    icon             VARCHAR(1024),
    deleted          SMALLINT    DEFAULT 0,
    created_by       VARCHAR(50) DEFAULT 'sys',
    created_at       TIMESTAMP   DEFAULT NOW(),
    last_modified_by VARCHAR(50) DEFAULT 'sys',
    last_modified_at TIMESTAMP   DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE tt_tag IS '标签表';
COMMENT ON COLUMN tt_tag.id IS '标签id：自增、主键';
COMMENT ON COLUMN tt_tag.slug IS '标签展示页的地址slug';
COMMENT ON COLUMN tt_tag.tag_name IS '标签名称';
COMMENT ON COLUMN tt_tag.thumbnail IS '封面图片地址';
COMMENT ON COLUMN tt_tag.icon IS '图标';
COMMENT ON COLUMN tt_tag.deleted IS '逻辑删除（0 未删除、1 删除）；CODE_GROUP: DELETED';
COMMENT ON COLUMN tt_tag.created_by IS '创建人：默认sys';
COMMENT ON COLUMN tt_tag.created_at IS '创建时间：默认当前时间';
COMMENT ON COLUMN tt_tag.last_modified_by IS '更新人：默认sys';
COMMENT ON COLUMN tt_tag.last_modified_at IS '更新时间：默认当前时间';

---

--文章标签表
CREATE TABLE tr_post_tag
(
    id               BIGSERIAL PRIMARY KEY,
    post_id          BIGINT NOT NULL,
    tag_id           BIGINT NOT NULL,
    deleted          SMALLINT    DEFAULT 0,
    created_by       VARCHAR(50) DEFAULT 'sys',
    created_at       TIMESTAMP   DEFAULT NOW(),
    last_modified_by VARCHAR(50) DEFAULT 'sys',
    last_modified_at TIMESTAMP   DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE tr_post_tag IS '文章和标签的关系表';
COMMENT ON COLUMN tr_post_tag.id IS '关系id：自增、主键';
COMMENT ON COLUMN tr_post_tag.post_id IS '所属文章id：取自tt_post表的id';
COMMENT ON COLUMN tr_post_tag.tag_id IS '标签id：取自tt_tag表的id';
COMMENT ON COLUMN tr_post_tag.deleted IS '逻辑删除（0 未删除、1 删除）；CODE_GROUP: DELETED';
COMMENT ON COLUMN tr_post_tag.created_by IS '创建人：默认sys';
COMMENT ON COLUMN tr_post_tag.created_at IS '创建时间：默认当前时间';
COMMENT ON COLUMN tr_post_tag.last_modified_by IS '更新人：默认sys';
COMMENT ON COLUMN tr_post_tag.last_modified_at IS '更新时间：默认当前时间';

---

--分类表
CREATE TABLE tt_category
(
    id               BIGSERIAL PRIMARY KEY,
    slug             VARCHAR(50) NOT NULL UNIQUE,
    pid              bigint      DEFAULT 0,
    category_name    VARCHAR(50) NOT NULL,
    thumbnail        VARCHAR(1024),
    icon             VARCHAR(1024),
    description      VARCHAR(8192),
    top_priority     SMALLINT    DEFAULT 0,
    deleted          SMALLINT    DEFAULT 0,
    created_by       VARCHAR(50) DEFAULT 'sys',
    created_at       TIMESTAMP   DEFAULT NOW(),
    last_modified_by VARCHAR(50) DEFAULT 'sys',
    last_modified_at TIMESTAMP   DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE tt_category IS '分类表';
COMMENT ON COLUMN tt_category.id IS '分类id：自增、主键';
COMMENT ON COLUMN tt_category.slug IS '分类展示页的地址slug';
COMMENT ON COLUMN tt_category.pid IS '分类父级id';
COMMENT ON COLUMN tt_category.category_name IS '分类名称';
COMMENT ON COLUMN tt_category.thumbnail IS '封面图片地址';
COMMENT ON COLUMN tt_category.icon IS '图标';
COMMENT ON COLUMN tt_category.description IS '分类描述';
COMMENT ON COLUMN tt_post.top_priority IS '文章优先级（数字越大，优先级越高）';
COMMENT ON COLUMN tt_category.deleted IS '逻辑删除（0 未删除、1 删除）；CODE_GROUP: DELETED';
COMMENT ON COLUMN tt_category.created_by IS '创建人：默认sys';
COMMENT ON COLUMN tt_category.created_at IS '创建时间：默认当前时间';
COMMENT ON COLUMN tt_category.last_modified_by IS '更新人：默认sys';
COMMENT ON COLUMN tt_category.last_modified_at IS '更新时间：默认当前时间';

---

--文章分类表
CREATE TABLE tr_post_category
(
    id               BIGSERIAL PRIMARY KEY,
    post_id          BIGINT NOT NULL,
    category_id      BIGINT NOT NULL,
    deleted          SMALLINT    DEFAULT 0,
    created_by       VARCHAR(50) DEFAULT 'sys',
    created_at       TIMESTAMP   DEFAULT NOW(),
    last_modified_by VARCHAR(50) DEFAULT 'sys',
    last_modified_at TIMESTAMP   DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE tr_post_category IS '文章和分类的关系表';
COMMENT ON COLUMN tr_post_category.id IS '关系id：自增、主键';
COMMENT ON COLUMN tr_post_category.post_id IS '所属文章id：取自tt_post表的id';
COMMENT ON COLUMN tr_post_category.category_id IS '分类id：取自tt_tag表的id';
COMMENT ON COLUMN tr_post_category.deleted IS '逻辑删除（0 未删除、1 删除）；CODE_GROUP: DELETED';
COMMENT ON COLUMN tr_post_category.created_by IS '创建人：默认sys';
COMMENT ON COLUMN tr_post_category.created_at IS '创建时间：默认当前时间';
COMMENT ON COLUMN tr_post_category.last_modified_by IS '更新人：默认sys';
COMMENT ON COLUMN tr_post_category.last_modified_at IS '更新时间：默认当前时间';
		`
