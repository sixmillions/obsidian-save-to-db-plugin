import { load } from 'js-yaml'

const YML_RE = /^---\n([\s\S]+?)\n---/

/**
 * 从包含 YAML 前置数据的文本中提取出 YAML 数据并解析为 JavaScript 对象
 *
 * 如果解析失败则返回一个空对象
 *
 * @param cnt 文章内容
 * @returns front-matter
 */
export const frontMatterHandle = (cnt: string) => {
  const matchs = cnt.match(YML_RE)
  const meta = matchs?.[1] ? load(matchs[1]) : null
  return meta ?? {}
}
