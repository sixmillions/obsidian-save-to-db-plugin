import { load } from 'js-yaml'
import { PostInfo } from './model'
import { TFile } from 'obsidian'

const YML_RE = /^---\n([\s\S]+?)\n---/

/**
 * 从文章中提取front-matter，转化为对象
 *
 * @param cnt 文章内容
 * @returns front-matter
 */
export const getNoteInfo = async (cnt: string, file: TFile) => {
  const defaultInfo = {
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
  const matchs = cnt.match(YML_RE)
  if (matchs) {
    const info = load(matchs[1]) as PostInfo
    return { ...defaultInfo, ...info }
  }
  return defaultInfo
}
