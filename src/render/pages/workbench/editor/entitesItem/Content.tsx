import React, { useMemo } from "react";
import { useService } from "src/base/service-manager";
import {
  ASTGeneraterService,
  CodeGeneraterService,
  ComponentHandlerService,
} from "src/render/services";
import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type.d";

import style from "./style/content.less";

const componentHandlerService = useService<ComponentHandlerService>(
  "ComponentHandlerService"
);
const aSTGeneraterService = useService<ASTGeneraterService>(
  "ASTGeneraterService"
);
const codeGeneraterService = useService<CodeGeneraterService>(
  "CodeGeneraterService"
);

interface IContentProps {
  componentEntity: TComponentEntity<EComponentMode.container>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  isActive?: boolean;
}

const Content: React.FC<IContentProps> = (props) => {
  const { componentEntity, onClick = noop, isActive = false } = props;
  const { id, tag, attrNode, childNode } = componentEntity;
  const { styles = [] } = attrNode;

  const styleProp = useMemo(() => {
    return componentHandlerService.stylesAttrItemToStyleProp(styles);
  }, [styles]);

  const ast = aSTGeneraterService.transformToAST(componentEntity);
  console.log("taozhizhu ~🚀 file: Content.tsx ~🚀 line 32 ~🚀 ast", ast);
  const code = codeGeneraterService.transformToCode(ast);
  console.log("taozhizhu ~🚀 file: Content.tsx ~🚀 line 43 ~🚀 code", code);

  return React.createElement(
    tag,
    {
      componentid: id,
      className: isActive ? style.active : "",
      style: styleProp,
      onClick,
    },
    [childNode]
  );
};

export default Content;
