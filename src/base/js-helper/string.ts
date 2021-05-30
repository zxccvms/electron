/**
 * 首字母大写
 * @param target 目标字符串
 */
export function capitalizeTheFirstLetter(target: string): string {
  return target[0].toLocaleUpperCase() + target.slice(1);
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charactersLength = characters.length;

/** 生成固定长度的随机数 */
export function randomString(len: number) {
  let result = "";
  for (var i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/** 创建唯一id */
export function createSoleId(
  idLength: number,
  checkFn: (id: string) => boolean
): string {
  const id = randomString(idLength);
  return checkFn(id) ? id : createSoleId(idLength, checkFn);
}
