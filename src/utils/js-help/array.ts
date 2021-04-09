/**
 * 数组去重
 */
export const heavyArray = (targetArray): any[] => {
  return Array.from(new Set(targetArray));
};
