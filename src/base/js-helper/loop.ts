/** 根据回调执行结果决定重新执行或结束执行
 * return true 结束执行
 * return false 重新执行
 */
export function redoOrNext(cb: () => boolean) {
  const isNext = cb();
  if (!isNext) redoOrNext(cb);
}
