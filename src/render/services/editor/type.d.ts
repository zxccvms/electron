export enum EComponentMode {
  /** 内容类型 */
  content = "content",
  /** 容器类型 */
  container = "container",
}

export enum EDisplayType {}

export enum EWrapperType {}

/** 属性项 */
export type TAttrItem<T> = {
  name: keyof T;
  value: T[keyof T];
  displayType?: EDisplayType;
  displayParam?: any;
  wrapperType?: EWrapperType;
  wrapperParam?: any;
};

/** 属性节点 */
export type TAttrNode = {
  /** 样式属性 */
  styles?: TAttrItem<React.CSSProperties>[];
  options?: TAttrItem<any>[];
};

/** 组件模型 */
export type TComponentModel<T extends EComponentMode> = {
  type: string;
  label: string;
  /** 元素标签名 */
  tag: string;
  mode: T;
  /** 属性节点 */
  attrNode: TAttrNode;
  /** 子节点 容器类型存储的是组件id的列表 */
  childNode: T extends EComponentMode.container ? string[] : string;
};

export type TComponentModelMap = {
  [id: string]: TComponentModel<EComponentMode>;
};

/** 组件实例 */
export type TComponentEntity<T extends EComponentMode> = {
  id: string;
  type: string;
  label: string;
  tag: string;
  mode: T;
  attrNode: TAttrNode;
  parentNode: string;
  childNode: T extends EComponentMode.container ? string[] : string;
};

export type TComponentEntityMap = {
  [id: string]: TComponentEntity<EComponentMode>;
};

/** 实例在父节点中的定位 */
export type TEtityPosition = {
  entityId: string;
  index: number;
};

/** 实例属性的定位 */
export type TAttrItemPosition = {
  /** 实例id */
  id: string;
  /** AttrNode下的key名 */
  key: string;
  /** 在AttrItem列表索引 */
  index: number;
};
