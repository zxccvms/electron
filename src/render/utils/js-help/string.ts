/**
 * 首字母大写
 * @param target 目标字符串
 */
export function capitalizeTheFirstLetter(target: string): string {
  return target[0].toLocaleUpperCase() + target.slice(1);
}
