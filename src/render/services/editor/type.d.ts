export enum EComponentMode {
  /** 内容类型 */
  content = "content",
  /** 容器类型 */
  container = "container",
}

export type TAttrNode = {
  /** 标签名 */
  tag: string;
  /** 样式属性 */
  style?: React.CSSProperties;
};

/** 组件模型 */
export type TComponentModel<T extends EComponentMode> = {
  type: string;
  label: string;
  mode: T;
  /** 属性节点 */
  attrNode: TAttrNode;
  /** 子节点 容器类型存储的是组件id的列表 */
  childNode: T extends EComponentMode.container ? string[] : string;
};

export type TComponentEntity<T extends EComponentMode> = {
  id: string;
  type: string;
  label: string;
  mode: T;
  attrNode: TAttrNode;
  childNode: T extends EComponentMode.container ? string[] : string;
};

export type TEtityPosition = {
  entityId: string;
  index: number;
};
