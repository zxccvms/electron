const { injectable, useService, inject } = require("injecter");
const React = require("react");
const ReactDom = require("react-dom");
const { useState, useCallback } = React
const testService = useService('Test2Service')

const root = document.querySelector('#root')


console.log('使用react替换界面元素')

const Test = props => {

  const onClick = useCallback(() => {
    // testService.print('test.js print test')
    console.log(123)
  }, [])

  return <div onClick={onClick}>test.js</div>
}

ReactDom.render(<Test />, root)