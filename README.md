# 说明

- 目前仅支持PostgreSQL数据库

# 使用

## 创建表

[sql语句](./src/constant.ts)

将DB_INIT_SQL中的语句执行一下，即可创建插件所需的表

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
