export interface PostInfo {
  title: string
  slug: string
  description: string
  author: string
  data: Date
  cover: string // 封面图片链接
  draft: boolean // true：草稿；false：发布
  order: number
  wordCount: number
  allowComment: boolean //true：允许评论 false：不允许平路
  tags: string[]
  categories: string[]
}

export interface Post {
  sync: boolean
  id: number
}

export interface DB_URI {
  host: string
  port: number
  database: string
  user: string
  password: string
}

export interface MyData {
  mySetting: { db: DB_URI }
  posts: Record<string, Post>
}
