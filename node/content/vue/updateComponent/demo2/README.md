# 这里介绍下渲染的整体过程

## 一、生成render函数

### 1、入口
```js
// 阶段：在webpack阶段或者带编译的Vue。

// Vue-loader在编译阶段就会转化
// 带编译的Vue是在$mount阶段转换
// 我们这里介绍 带编译的Vue：vue.esm.browser.js 版本

// $mount有多个地方定义
// vue.esm.browser.js 版本有两个地方定义

// 转换成template，在编译处定义

// 入口：src/platforms/web/entry-runtime-with-compiler.js
// 源码（精简版）

const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function(){
    // 不是render则转换为render
    if (!options.render) {
        const { render, staticRenderFns } = compileToFunctions(options.template, {
            outputSourceRange: process.env.NODE_ENV !== 'production',
            shouldDecodeNewlines,
            shouldDecodeNewlinesForHref,
            delimiters: options.delimiters,
            comments: options.comments
        }, this)
        options.render = render
        options.staticRenderFns = staticRenderFns
    }
    // 最终还是会走runtime的$mount
    return mount.call(this, el, hydrating)
}
```

### 2、compileToFunctions()
```js
// 我们来看compileToFunctions的定义

// 入口：src/platforms/web/compiler/index.js
const { compile, compileToFunctions } = createCompiler(baseOptions)

// 其中baseOptions为：
export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  directives,
  isPreTag,
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules)
}
// 因为是解析
// 1、所以需要认识tag（是否是HTML tag，是否是pre tag，命名空间）
// 2、及认识Vue的指令directives，然后会把这些指令处理成我们的render中的props、on、directives等。
// 3、style attrs class 等模块的处理方法。

// createCompiler的入口：src/compiler/index.js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
// 这里是高阶函数
// 根据createCompiler是函数，也就是最后面会返回一个函数
// baseCompile会在内部执行

// 1、parse： => ast
// 2、optimize：优化，静态标记
// 3、generate： ast => code

// 我们进入createCompilerCreator：src/compiler/create-compiler.js

// 我们结合$mount中的compileToFunctions来看代码
export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      // 拿到baseOptions
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []

      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length

          warn = (msg, range, tip) => {
            const data: WarningMessage = { msg }
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength
              }
            }
            (tip ? tips : errors).push(data)
          }
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      finalOptions.warn = warn

      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```
### 3、compile
```js
// 入口：src/compiler/create-compiler.js
function compile (
    template: string,
    options?: CompilerOptions
): CompiledResult {
    // baseOptions就是上下文的baseOptions
    const finalOptions = Object.create(baseOptions)
    const errors = []
    const tips = []
    
    // 下面做的就是merge baseOptions 和 options
    if (options) {
    // merge custom modules
    if (options.modules) {
        finalOptions.modules =
        (baseOptions.modules || []).concat(options.modules)
    }
    // merge custom directives
    if (options.directives) {
        finalOptions.directives = extend(
        Object.create(baseOptions.directives || null),
        options.directives
        )
    }
    // copy other options
    for (const key in options) {
        if (key !== 'modules' && key !== 'directives') {
        finalOptions[key] = options[key]
        }
    }
    }

    finalOptions.warn = warn
    // 最终执行的是baseCompile
    const compiled = baseCompile(template.trim(), finalOptions)
    if (process.env.NODE_ENV !== 'production') {
    detectErrors(compiled.ast, warn)
    }
    compiled.errors = errors
    compiled.tips = tips
    return compiled
}

// 这个只是整合options
// 最终走baseCompile
```

### 4、baseCompile

```js
// createCompiler的入口：src/compiler/index.js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
// baseCompile是最终parse的地方
```

### 5、整理下

```js
// 我们整理下，方便查看

// 1、执行compileToFunctions
const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function(){
    // 不是render则转换为render
    if (!options.render) {
        const { render, staticRenderFns } = compileToFunctions(options.template, {
            outputSourceRange: process.env.NODE_ENV !== 'production',
            shouldDecodeNewlines,
            shouldDecodeNewlinesForHref,
            delimiters: options.delimiters,
            comments: options.comments
        }, this)
        options.render = render
        options.staticRenderFns = staticRenderFns
    }
    // 最终还是会走runtime的$mount
    return mount.call(this, el, hydrating)
}

// 2、compileToFunctions
// 入口：src/compiler/to-function.js
export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn

    // compile
    const compiled = compile(template, options)

    // turn code into functions
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })
  }
}

function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}

// 简单来说，compileToFunctions就是在compile的基础上，对code转换为function

// 3、进入compiled
// 入口：src/compiler/create-compiler.js
export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
    // 关注这里
    // 调用，看上面， const compiled = compile(template, options)
    // 也就是参数是这里的
    //    const { render, staticRenderFns } = compileToFunctions(options.template, {
    //     outputSourceRange: process.env.NODE_ENV !== 'production',
    //     shouldDecodeNewlines,
    //     shouldDecodeNewlinesForHref,
    //     delimiters: options.delimiters,
    //     comments: options.comments
    // }, this)
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      // baseOptions就是上下文的baseOptions
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []
      
      // 下面做的就是merge baseOptions 和 options
      if (options) {
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      finalOptions.warn = warn
      // 最终执行的是baseCompile
      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

// 总结：
// 1、执行$mount
// 2、执行compileToFunctions，中间会走compile。然后把code等转换为Function
// 3、compile 会 merge options。最终走的是baseCompile
// 4、baseCompile 逻辑是

// 1、parse： => ast
// 2、optimize：优化，静态标记
// 3、generate： ast => code

// OK。基本流程走完，如果还需要深入怎么解析的。需要进入baseCompiler的parse
```
### 6、parse()
```js
// 我们再来看下baseCompile

// createCompiler的入口：src/compiler/index.js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  //options 为经compile，会merge baseOptions和options的最终options
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```
```js
// 入口：src/compiler/parser/index.js

// 这里代码很长，我们关注下parseHTML即可。
/**
 * Convert HTML string to AST.
 */
export function parse (
  template: string,
  options: CompilerOptions
): ASTElement | void {
  warn = options.warn || baseWarn

  platformIsPreTag = options.isPreTag || no
  platformMustUseProp = options.mustUseProp || no
  platformGetTagNamespace = options.getTagNamespace || no
  const isReservedTag = options.isReservedTag || no
  maybeComponent = (el: ASTElement) => !!(
    el.component ||
    el.attrsMap[':is'] ||
    el.attrsMap['v-bind:is'] ||
    !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag))
  )
  transforms = pluckModuleFunction(options.modules, 'transformNode')
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')

  delimiters = options.delimiters

  const stack = []
  const preserveWhitespace = options.preserveWhitespace !== false
  const whitespaceOption = options.whitespace
  let root
  let currentParent
  let inVPre = false
  let inPre = false
  let warned = false

  function warnOnce (msg, range) {
    if (!warned) {
      warned = true
      warn(msg, range)
    }
  }

  function closeElement (element) {
    trimEndingWhitespace(element)
    if (!inVPre && !element.processed) {
      element = processElement(element, options)
    }
    // tree management
    if (!stack.length && element !== root) {
      // allow root elements with v-if, v-else-if and v-else
      if (root.if && (element.elseif || element.else)) {
        if (process.env.NODE_ENV !== 'production') {
          checkRootConstraints(element)
        }
        addIfCondition(root, {
          exp: element.elseif,
          block: element
        })
      } else if (process.env.NODE_ENV !== 'production') {
        warnOnce(
          `Component template should contain exactly one root element. ` +
          `If you are using v-if on multiple elements, ` +
          `use v-else-if to chain them instead.`,
          { start: element.start }
        )
      }
    }
    if (currentParent && !element.forbidden) {
      if (element.elseif || element.else) {
        processIfConditions(element, currentParent)
      } else {
        if (element.slotScope) {
          // scoped slot
          // keep it in the children list so that v-else(-if) conditions can
          // find it as the prev node.
          const name = element.slotTarget || '"default"'
          ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
        }
        currentParent.children.push(element)
        element.parent = currentParent
      }
    }

    // final children cleanup
    // filter out scoped slots
    element.children = element.children.filter(c => !(c: any).slotScope)
    // remove trailing whitespace node again
    trimEndingWhitespace(element)

    // check pre state
    if (element.pre) {
      inVPre = false
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false
    }
    // apply post-transforms
    for (let i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options)
    }
  }

  function trimEndingWhitespace (el) {
    // remove trailing whitespace node
    if (!inPre) {
      let lastNode
      while (
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 &&
        lastNode.text === ' '
      ) {
        el.children.pop()
      }
    }
  }

  function checkRootConstraints (el) {
    if (el.tag === 'slot' || el.tag === 'template') {
      warnOnce(
        `Cannot use <${el.tag}> as component root element because it may ` +
        'contain multiple nodes.',
        { start: el.start }
      )
    }
    if (el.attrsMap.hasOwnProperty('v-for')) {
      warnOnce(
        'Cannot use v-for on stateful component root element because ' +
        'it renders multiple elements.',
        el.rawAttrsMap['v-for']
      )
    }
  }

  parseHTML(template, {
    warn,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    start (tag, attrs, unary, start, end) {
      // check namespace.
      // inherit parent ns if there is one
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs)
      }

      let element: ASTElement = createASTElement(tag, attrs, currentParent)
      if (ns) {
        element.ns = ns
      }

      if (process.env.NODE_ENV !== 'production') {
        if (options.outputSourceRange) {
          element.start = start
          element.end = end
          element.rawAttrsMap = element.attrsList.reduce((cumulated, attr) => {
            cumulated[attr.name] = attr
            return cumulated
          }, {})
        }
        attrs.forEach(attr => {
          if (invalidAttributeRE.test(attr.name)) {
            warn(
              `Invalid dynamic argument expression: attribute names cannot contain ` +
              `spaces, quotes, <, >, / or =.`,
              {
                start: attr.start + attr.name.indexOf(`[`),
                end: attr.start + attr.name.length
              }
            )
          }
        })
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true
        process.env.NODE_ENV !== 'production' && warn(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          `<${tag}>` + ', as they will not be parsed.',
          { start: element.start }
        )
      }

      // apply pre-transforms
      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element
      }

      if (!inVPre) {
        processPre(element)
        if (element.pre) {
          inVPre = true
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true
      }
      if (inVPre) {
        processRawAttrs(element)
      } else if (!element.processed) {
        // structural directives
        processFor(element)
        processIf(element)
        processOnce(element)
      }

      if (!root) {
        root = element
        if (process.env.NODE_ENV !== 'production') {
          checkRootConstraints(root)
        }
      }

      if (!unary) {
        currentParent = element
        stack.push(element)
      } else {
        closeElement(element)
      }
    },

    end (tag, start, end) {
      const element = stack[stack.length - 1]
      // pop stack
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
        element.end = end
      }
      closeElement(element)
    },

    chars (text: string, start: number, end: number) {
      if (!currentParent) {
        if (process.env.NODE_ENV !== 'production') {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.',
              { start }
            )
          } else if ((text = text.trim())) {
            warnOnce(
              `text "${text}" outside root element will be ignored.`,
              { start }
            )
          }
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
      const children = currentParent.children
      if (inPre || text.trim()) {
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text)
      } else if (!children.length) {
        // remove the whitespace-only node right after an opening tag
        text = ''
      } else if (whitespaceOption) {
        if (whitespaceOption === 'condense') {
          // in condense mode, remove the whitespace node if it contains
          // line break, otherwise condense to a single space
          text = lineBreakRE.test(text) ? '' : ' '
        } else {
          text = ' '
        }
      } else {
        text = preserveWhitespace ? ' ' : ''
      }
      if (text) {
        if (!inPre && whitespaceOption === 'condense') {
          // condense consecutive whitespaces into single space
          text = text.replace(whitespaceRE, ' ')
        }
        let res
        let child: ?ASTNode
        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text
          }
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          child = {
            type: 3,
            text
          }
        }
        if (child) {
          if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
            child.start = start
            child.end = end
          }
          children.push(child)
        }
      }
    },
    comment (text: string, start, end) {
      // adding anything as a sibling to the root node is forbidden
      // comments should still be allowed, but ignored
      if (currentParent) {
        const child: ASTText = {
          type: 3,
          text,
          isComment: true
        }
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          child.start = start
          child.end = end
        }
        currentParent.children.push(child)
      }
    }
  })
  return root
}

// 代码太多。反正最终是转换为ast树
```
### 7、ast树
```js
// template
`
    <div id="app">
        {{color}}
        <div :title="color"></div>
        <input v-model="inputValue">
        <child1 :num="3"></child1>
    </div>
`
// 我们来看下ast
{
    attrs: [
        {
            dynamic: undefined
            end: 13
            name: "id"
            start: 5
            value: "\"app\""
            [[Prototype]]: Object
        }
    ]
    attrsList: [
        {
            end: 13
            name: "id"
            start: 5
            value: "app"
        }
    ]
    attrsMap:{
        id: "app"
    }

    children: [
        {
            end: 41
            expression: "\"\\n        \"+_s(color)+\"\\n        \""
            start: 14
            text: "\n        {{color}}\n        "
            tokens: (3) ['\n        ', {…}, '\n        ']
            type: 2
        },
        {
            attrs: [{…}]
            attrsList: [{…}]
            attrsMap: {:title: 'color'}
            children: []
            end: 67
            hasBindings: true
            parent: {type: 1, tag: 'div', attrsList: Array(1), attrsMap: {…}, rawAttrsMap: {…}, …}
            plain: false
            rawAttrsMap: {:title: {…}}
            start: 41
            tag: "div"
            type: 1
        },
        {
            end: 76
            start: 67
            text: " "
            type: 3
        },
        {
            attrsList: [{…}]
            attrsMap: {v-model: 'inputValue'}
            children: []
            directives: [{…}]
            end: 104
            hasBindings: true
            parent: {type: 1, tag: 'div', attrsList: Array(1), attrsMap: {…}, rawAttrsMap: {…}, …}
            plain: false
            rawAttrsMap: {v-model: {…}}
            start: 76
            tag: "input"
            type: 1
        },
        {
            end: 113
            start: 104
            text: " "
            type: 3
        },
        {
            attrs: [{…}]
            attrsList: [{…}]
            attrsMap: {:num: '3'}
            children: []
            end: 139
            hasBindings: true
            parent: {type: 1, tag: 'div', attrsList: Array(1), attrsMap: {…}, rawAttrsMap: {…}, …}
            plain: false
            rawAttrsMap: {:num: {…}}
            start: 113
            tag: "child1"
            type: 1
        },
        {
            end: 150
            parent: undefined
            plain: false
            rawAttrsMap:
            id:
            end: 13
            name: "id"
            start: 5
            value: "app"
        }
    ]
    start: 0
    tag: "div"
    type: 1     
}

// 也就是这个阶段，只是认出各种tag，拿到attrs，及children，parent 和位置信息
```
### 8、optimize
```js
optimize(ast, options)
// 优化，静态标记
// 也就是加速static
// root还会加上staticRoor
```
![avatar](vue_updateComponent_demo2_optimize.png)

### 9、generate
```js
// ast => code
 const code = generate(ast, options)

// 入口：src/compiler/codegen/index.js
// 源码：
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options)
  // fix #11483, Root level <script> tags should not be rendered.
  const code = ast ? (ast.tag === 'script' ? 'null' : genElement(ast, state)) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}

// 我们先来看下code是什么
// 字符串
with(this){
    return _c(
        "div",
        { attrs: { id: "app" } },
        [
            _v("\n        " + _s(color) + "\n        "),
            _c("div", { attrs: { title: color } }),
            _v(" "),
            _c("input", {
                directives: [
                    {
                        name: "model",
                        rawName: "v-model",
                        value: inputValue,
                        expression: "inputValue",
                    },
                ],
                domProps: {
                    value: inputValue,
                },
                on: {
                    input: function($event) {
                        if ($event.target.composing) return;
                        inputValue = $event.target.value;
                    },
                },
            }),
            _v(" "),
            _c("child1", { attrs: { num: 3 } }),
        ],
        1
  );
}

// 我们发现，这里会解析ast数，转化为我们熟悉的render函数的内容
// 1、如v-model。则会给input类型，添加input事件。

// 这里我们补充下slot相关内容
// child1 具有
<child1>
    sda{{color}}
    <template v-slot:header>
        ad{{color}}
    </template>
    <template v-slot:footer="t">
        {{t}}{color}}
    </template>
</child1>
// 则会转化为
_c(
    "child1",
    {
    attrs: { num: 3 },
    scopedSlots: _u([
        {
        key: "header",
        fn: function() {
            return [
            _v("\n                ad" + _s(color) + "\n            "),
            ];
        },
        proxy: true,
        },
        {
        key: "footer",
        fn: function(t) {
            return [
            _v("\n                " + _s(t) + "{color}}\n            "),
            ];
        },
        },
    ]),
    },
    [_v("\n            \n            sda" + _s(color) + "\n            ")]
),

// 也就是
// 1、default会放到children那里
// 2、其它具名的，会放到scopedSlots这里。

// 后续我们关注下他们的生成时间和上下文是谁
// 我们发现其它的，包括作用域卡槽。是利用
function(t){
    
}
// 来修改访问作用域的
// 执行render后。也就是里面的变量，就会从当前渲染vm中。读取到了。！！！

```
## 二、生成Vnode
```js
// 1、走compiler的$mount：把template转换为render。render内容我们前面可以看到是什么结构
// 2、再走web版本的runtime的$mount：执行mountComponent(this, el, hydrating)
//    走生成渲染Watch,进而执行，这个Watcher getter
let updateComponent = () => {
    vm._update(vm._render(), hydrating)
}
//   vm._render() 用于生成Vnode。其中render就是compiler阶段生成的。内容类似于：function(){with(this){...}}
vnode = render.call(vm._renderProxy, vm.$createElement)
// 这里我们来分析下，生成的怎么来生成Vnode的。

// 生成Vnode。也就是执行render.call(vm._renderProxy, vm.$createElement)
// 也就是执行
function(){
    new Function(code)
}
// 上面我们也看到了code里面，都是_c等一堆函数。
// 分析这里，也就是主要分析_c或者$createElement的原理

export function initRender (vm: Component) {
    // 这个是内部用的，如上面的_c
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
    // 这个是给用户用的
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
    // 其它略
}

// 所以我们进入createElement
// 我们带着data、context是什么时候生成的角度来进入代码
```
### 1、createElement()
```js
vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)

// 入口：src/core/vdom/create-element.js
// 从这里开始，我们进入Vnode的领域

// 源码
export function createElement (
  context: Component, // vm
  tag: any,           // tag
  data: any,          // 数据对象
  children: any,      // childern
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
    // 我们正常这里是Object。如果是数组或基本数据类型，会处理下参数
    // 也就是我们平常使用createElement('div',123)
    // 则第二个参数，会认为是children。没有数据对象。这里官网也说了，可选！
    // 当然我们也可以：createElement('div',undefined 或 {} ,123)
    if (Array.isArray(data) || isPrimitive(data)) {
        normalizationType = children
        children = data
        data = undefined
    }
    if (isTrue(alwaysNormalize)) {
        normalizationType = ALWAYS_NORMALIZE
    }
    return _createElement(context, tag, data, children, normalizationType)
}

// 这个函数主要是为了兼容不同参数的统一入口
// 也就是到这为止，data还是我们render时候的数据对象。
```

### 2、_createElement
```js
// 入口：src/core/vdom/create-element.js

// 源码（精简版）
export function _createElement(){
    // 入参合法性判断，略
    // 其它处理，略
   
    // 这里先略
    if (Array.isArray(children) &&
        typeof children[0] === 'function'
    ) {
        data = data || {}
        data.scopedSlots = { default: children[0] }
        children.length = 0
    }
    // 正式进入生成Vnode
    if(typeof tag === 'string') {
        if (config.isReservedTag(tag)) {
            // 如果是保留的tag
            vnode = new VNode(
                config.parsePlatformTagName(tag), data, children,
                undefined, undefined, context
            )
        } else if((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))){
            // resolveAsset 会在context.$options[components] 中，用tag或小写或转驼峰的方式，找有没有这个属性
            // 也就是判断是不是我们注册了的组件（全局组件，也会在vm.$options[components]）
            vnode = createComponent(Ctor, data, context, children, tag)
        } else {
            // 其它情况，正常把它渲染吧
            vnode = new VNode(
                tag, data, children,
                undefined, undefined, context
            )
        }
    } else {
        // tag除了字符串，还支持函数，Object。
        // 官网有介绍：https://cn.vuejs.org/v2/guide/render-function.html#createElement-%E5%8F%82%E6%95%B0
        vnode = createComponent(tag, data, context, children)
    }
    // 后续逻辑先略
}
// 1、html标签生成Vnode比较简单，直接走new VNode
//    也就是说，这个时候，data就是render里面的数据对象，上下文就是当前vm
// 2、我们再来看下组件的逻辑
vnode = createComponent(Ctor, data, context, children, tag)

// 入口：src/core/vdom/create-component.js
// 源码：
// 我们结合入参来看
// vnode = createComponent(Ctor, data, context, children, tag)
// 其中Crot：在当前context的$options中，拿到我们注册的该组件，也就是拿到我们组件的options
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }
  const baseCtor = context.$options._base
  // 根据我们的配置，然后基于baseCtor，生成新的vm
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // extract props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  // install component management hooks onto the placeholder node
  installComponentHooks(data)

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  // Weex specific: invoke recycle-list optimized @render function for
  // extracting cell-slot template.
  // https://github.com/Hanks10100/weex-native-directive/tree/master/component
  /* istanbul ignore if */
  if (__WEEX__ && isRecyclableComponent(vnode)) {
    return renderRecyclableComponentTemplate(vnode)
  }

  return vnode
}
// 可以看到这里，对data就行了处理
// 1、生成了propsData: const propsData = extractPropsFromVNodeData(data, Ctor, tag)
//    也就是，根据attrs。结合组件的optios的props。拿到propsData
//    因为attrs会在父vm上，读取值，所以其实这个时候vm的数据全了。
// 2、生成了componentOptions：{ Ctor, propsData, listeners, tag, children },
// 3、其它略
 
// 我们重点来关注下这里
installComponentHooks(data)

function installComponentHooks (data: VNodeData) {
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}
// 也即是data.hooks挂载Vnode关于组件的hooks

// 重点看下这里
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      // 1、根据当前vnode，主要是crot和其它
      //    然后当前渲染的vm（parent）
      //    来生成子实例
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      // 子组件，走$mount。
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },

  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },

  insert (vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      callHook(componentInstance, 'mounted')
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance)
      } else {
        activateChildComponent(componentInstance, true /* direct */)
      }
    }
  },

  destroy (vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}
// 也就是，在__patch__的过程当中，会走Vnode的hooks。
// 如果是组建，因为挂载了组件的hooks。所以，会走

// OK。也就是说子组建的new 销毁什么的。是在这里执行的
// 后面我们patch的时候还会来介绍
```
### 3、new VNode()
```js
// 也就是一个Object。来表示一个tag
// 我们输出组件一个来看看
VNode {
    tag: 'vue-component-1-child1', //  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data: {…},
    children: undefined,
    text: undefined,
    elm: undefined, …}
    asyncFactory: undefined
    asyncMeta: undefined
    children: undefined
    componentInstance: VueComponent {_uid: 1, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: VueComponent, …}
    componentOptions: {propsData: {…}, listeners: undefined, tag: 'child1', children: undefined, Ctor: ƒ}
    context: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
    data: {attrs: {…}, on: undefined, hook: {…}, pendingInsert: null}
    elm: div
    fnContext: undefined
    fnOptions: undefined
    fnScopeId: undefined
    isAsyncPlaceholder: false
    isCloned: false
    isComment: false
    isOnce: false
    isRootInsert: false
    isStatic: false
    key: undefined
    ns: undefined
    parent: undefined
    raw: false
    [[Prototype]]: Object
}

// 我们再输出一个预设的tag看看
VNode {
    tag: 'div',
    data: {…},
    children: Array(2),
    text: undefined,
    elm: undefined, …}
    asyncFactory: undefined
    asyncMeta: undefined
    children: (2) [VNode, VNode]
    componentInstance: undefined  // 这个只有组件的Vnode才有值
    componentOptions: undefined   // 这个只有组件的Vnode才有值
    context: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
    data: {attrs: {…}}
    elm: div#app
    fnContext: undefined
    fnOptions: undefined
    fnScopeId: undefined
    isAsyncPlaceholder: false
    isCloned: false
    isComment: false
    isOnce: false
    isRootInsert: true
    isStatic: false
    key: undefined
    ns: undefined
    parent: undefined
    raw: false
    [[Prototype]]: Object
}

// 到这里。
// 我们可以理解为我们的render里面的结构，转化为了Vnode结构。

// 主要做两件事情
// 1、也就是如果是HTML类型的Vnode。则生成普通Vnode。context为当前组件vm
// 2、如果是组件，则根据当前的this。拿到该组件的options。实例化一个新的vm。context为新的vm。

// 这样下来之后，每个Vnode都有自己的context。就知道从哪里取值。
```

## 三、_update()

### 1、_update()
```js
// 生成Vnode之后，每个Vnode都有自己的context
// 及parent、children类似html节点的结构
// 这个时候，就可以把Vnode转化为html。并渲染到HTML上。

// 回到渲染Watcher的 getter
let updateComponent = () => {
    vm._update(vm._render(), hydrating)
}

// vm._render() 生成Vnode后，这个时候会执行vm._update()
// 从前面Vue构造器，我们知道_update是在lifecycleMixin(vm)时挂载上去的

// 入口：src/core/instance/lifecycle.js

// 源码：
export function lifecycleMixin (Vue: Class<Component>) {
    Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
        const vm: Component = this
        const prevEl = vm.$el
        const prevVnode = vm._vnode
        // activeInstance存储当前激活的vm实例
        // setActiveInstance会存储之前激活的vm实例。调用返回函数后。又回重置回去。
        const restoreActiveInstance = setActiveInstance(vm)
        vm._vnode = vnode
        // Vue.prototype.__patch__ is injected in entry points
        // based on the rendering backend used.
        if (!prevVnode) {
            // 初始化渲染
            // initial render
            vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
        } else {
            // 更新的时候
            // updates
            vm.$el = vm.__patch__(prevVnode, vnode)
        }
        restoreActiveInstance()
        // update __vue__ reference
        if (prevEl) {
            prevEl.__vue__ = null
        }
        if (vm.$el) {
            vm.$el.__vue__ = vm
        }
        // if parent is an HOC, update its $el as well
        if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
            vm.$parent.$el = vm.$el
        }
        // updated hook is called by the scheduler to ensure that children are
        // updated in a parent's updated hook.
    }
    Vue.prototype.$forceUpdate = function () {/*略*/} 
    Vue.prototype.$destroy = function () {/*略*/}
}

// setActiveInstance
export function setActiveInstance(vm: Component) {
  const prevActiveInstance = activeInstance
  activeInstance = vm
  return () => {
    activeInstance = prevActiveInstance
  }
}
```
### 2、__patch__（）

```js
// 这里demo1也有介绍，不够深入，我们再深入分析下。

// 从这里
 vm.$el = vm.__patch__(prevVnode, vnode)
 // 我们知道，__patch__ 后
 // 1、对比prevVnode（第一次的prevVnode为，模板）
 // 2、生成新的document element

// 最初的vm.$el是在mountComponent的时候加上的。
// 这里再回顾下，$mount的流程
// 1、走编译的$mount
// 2、走runtime的$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
// 3、走mountComponent
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
   vm.$el = el
   // hook
   callHook(vm, 'beforeMount')
   // 创建渲染Watcher
   // 后续会走这个getter
   // 然后，走vm._render()。把render结构，转化为Vnode结构
   // 然后走vm._update()。也就是走__patch__。根据Vnode的上下文，生成document element
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
    new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  // hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
// 这里补充下
// 从这里，也可以看出hook
// 第一次的时候，会执行beforeMount、mounted
// 后续派发的时候，会走Watcher的this.run()。也就是会执行 callHook(vm, 'beforeUpdate')
```

```js
// __patch__（） 逻辑分析
// 这块生成__patch__的逻辑比较多。我们抽象直接来看__patch__（）即可。
// createPatchFunction 逻辑。看demo1

// 看下面代码。我结合入参来看下
 vm.$el = vm.__patch__(prevVnode, vnode)

// 入口：src/core/vdom/patch.js
//  OK。我们使用的__patch。是在这里定义的
// 我们来看下
return function patch (oldVnode, vnode, hydrating, removeOnly) {
    // 如果没有新节点
    if (isUndef(vnode)) {
        // 此时，如果有旧节点,走unmount
        if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
        return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []
    // 如果没有旧节点，说明只需要插入就行
    if (isUndef(oldVnode)) {
        // empty mount (likely as component), create new root element
        isInitialPatch = true
        createElm(vnode, insertedVnodeQueue)
    } else {
        // 判断是不是节点
        // 根节点的oldVnode为$el。此时为true
        const isRealElement = isDef(oldVnode.nodeType)
        // 如果不是html节点，判断是不是相同组件
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
            // patch existing root node
            patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
        } else {
            // 1、我们先看这里这个逻辑
            if (isRealElement) {
                // mounting to a real element
                // check if this is server-rendered content and if we can perform
                // a successful hydration.
                if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                    oldVnode.removeAttribute(SSR_ATTR)
                    hydrating = true
                }
                if (isTrue(hydrating)) {
                    if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                    invokeInsertHook(vnode, insertedVnodeQueue, true)
                    return oldVnode
                    } else if (process.env.NODE_ENV !== 'production') {
                    warn(
                        'The client-side rendered virtual DOM tree is not matching ' +
                        'server-rendered content. This is likely caused by incorrect ' +
                        'HTML markup, for example nesting block-level elements inside ' +
                        '<p>, or missing <tbody>. Bailing hydration and performing ' +
                        'full client-side render.'
                    )
                    }
                }
                // either not server-rendered, or hydration failed.
                // create an empty node and replace it
                oldVnode = emptyNodeAt(oldVnode)
            }

            // replacing existing element
            const oldElm = oldVnode.elm
            const parentElm = nodeOps.parentNode(oldElm)

            // create new node
            createElm(
                vnode,
                insertedVnodeQueue,
                // extremely rare edge case: do not insert if old element is in a
                // leaving transition. Only happens when combining transition +
                // keep-alive + HOCs. (#4590)
                oldElm._leaveCb ? null : parentElm,
                nodeOps.nextSibling(oldElm)
            )

            // update parent placeholder node element, recursively
            if (isDef(vnode.parent)) {
                let ancestor = vnode.parent
                const patchable = isPatchable(vnode)
                while (ancestor) {
                    for (let i = 0; i < cbs.destroy.length; ++i) {
                    cbs.destroy[i](ancestor)
                    }
                    ancestor.elm = vnode.elm
                    if (patchable) {
                    for (let i = 0; i < cbs.create.length; ++i) {
                        cbs.create[i](emptyNode, ancestor)
                    }
                    // #6513
                    // invoke insert hooks that may have been merged by create hooks.
                    // e.g. for directives that uses the "inserted" hook.
                    const insert = ancestor.data.hook.insert
                    if (insert.merged) {
                        // start at index 1 to avoid re-invoking component mounted hook
                        for (let i = 1; i < insert.fns.length; i++) {
                        insert.fns[i]()
                        }
                    }
                    } else {
                    registerRef(ancestor)
                    }
                    ancestor = ancestor.parent
                }
            }
            // destroy old node
            if (isDef(parentElm)) {
                removeVnodes([oldVnode], 0, 0)
            } else if (isDef(oldVnode.tag)) {
                invokeDestroyHook(oldVnode)
            }
        }
    }
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
}

// 也就是先看一开始root __patch__是怎么做的。

// 1、如果是html。则转化为oldVnode = emptyNodeAt(oldVnode)
//   为了后面统一处理
// 2、然后走createElm
createElm(
    vnode,
    insertedVnodeQueue,
    // extremely rare edge case: do not insert if old element is in a
    // leaving transition. Only happens when combining transition +
    // keep-alive + HOCs. (#4590)
    oldElm._leaveCb ? null : parentElm,
    nodeOps.nextSibling(oldElm)
)
```
### 3、createElm()

```js
// 入口：src/core/vdom/patch.js

// 入参：(新的Vnode,插入Vnode队列，parentElm，旧节点的下个兄弟节点)

// 我们来看下这部分逻辑
function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
) {
    // 这里跳过
    if (isDef(vnode.elm) && isDef(ownerArray)) {
        // This vnode was used in a previous render!
        // now it's used as a new node, overwriting its elm would cause
        // potential patch errors down the road when it's used as an insertion
        // reference node. Instead, we clone the node on-demand before creating
        // associated DOM element for it.
        vnode = ownerArray[index] = cloneVNode(vnode)
    }
   // 这里跳过
    vnode.isRootInsert = !nested // for transition enter check
    // 如果Vnode是组建，则走这里
    // 这里面会根据Cror等来生成前面提供的create逻辑。
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return
    }
    // 如果Vnode不是组件，走下面
    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
        if (process.env.NODE_ENV !== 'production') {
            if (data && data.pre) {
                creatingElmInVPre++
            }
        }
        // 根据tag。生成一个空的标签
        vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
        // 增加scope给class使用
        // 逻辑；如果自己有scope则加自己的。否则加最近祖先的
        setScope(vnode)

        /* istanbul ignore if */
        if (__WEEX__) {
            // in Weex, the default insertion order is parent-first.
            // List items can be optimized to use children-first insertion
            // with append="tree".
            const appendAsTree = isDef(data) && isTrue(data.appendAsTree)
            if (!appendAsTree) {
                if (isDef(data)) {
                invokeCreateHooks(vnode, insertedVnodeQueue)
                }
                insert(parentElm, vnode.elm, refElm)
            }
            createChildren(vnode, children, insertedVnodeQueue)
            if (appendAsTree) {
                if (isDef(data)) {
                invokeCreateHooks(vnode, insertedVnodeQueue)
                }
                insert(parentElm, vnode.elm, refElm)
            }
        } else {
            // 创建子节点
            createChildren(vnode, children, insertedVnodeQueue)
            if (isDef(data)) {
                // 执行create hooks
                invokeCreateHooks(vnode, insertedVnodeQueue)
            }
            // 在parentEle的refElm之前，插入本节点。
            insert(parentElm, vnode.elm, refElm)
        }

        if (process.env.NODE_ENV !== 'production' && data && data.pre) {
            creatingElmInVPre--
        }
    } else if (isTrue(vnode.isComment)) {
        vnode.elm = nodeOps.createComment(vnode.text)
        insert(parentElm, vnode.elm, refElm)
    } else {
        vnode.elm = nodeOps.createTextNode(vnode.text)
        insert(parentElm, vnode.elm, refElm)
    }
}
// 我们先分析不是组建的情况，是组建的情况，下个小节会介绍

// 入参：(新的Vnode,插入Vnode队列，parentElm，旧节点的下个兄弟节点)
// 1、根据Vnode，创建一个空的tag 类型标签
// 2、创建子节点，挂载到Vnode的.el上。
// 3、走 invokeCreateHooks(vnode, insertedVnodeQueue)
// 4、把自己挂载到父节点的指定位置。

// 我们发现，对于数据解析这块，逻辑在invokeCreateHooks(vnode, insertedVnodeQueue)

// 我们来分析下
function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; ++i) {
        cbs.create[i](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    if (isDef(i)) {
        if (isDef(i.create)) i.create(emptyNode, vnode)
        if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
}
// 其中cbs为createPatchFunction函数，生成的。代码如下
export function createPatchFunction (backend) {
  let i, j
  const cbs = {}
  // demo1这里对modules有稍微聊下，这里再细聊下
  const { modules, nodeOps } = backend
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
  // 其它略 
}

// modules的生成入口：src/platforms/web/runtime/patch.js
const modules = platformModules.concat(baseModules)
// 其中baseModules为
export default [
  ref, // 如下，提供了3个函数，用于处理ref
  directives
]

// ref
export default {
  create (_: any, vnode: VNodeWithData) {
    registerRef(vnode)
  },
  update (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true)
      registerRef(vnode)
    }
  },
  destroy (vnode: VNodeWithData) {
    registerRef(vnode, true)
  }
}

export function registerRef (vnode: VNodeWithData, isRemoval: ?boolean) {
  const key = vnode.data.ref
  if (!isDef(key)) return

  const vm = vnode.context
  const ref = vnode.componentInstance || vnode.elm
  const refs = vm.$refs
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref]
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref)
      }
    } else {
      refs[key] = ref
    }
  }
}
// 逻辑也很简单，如果有ref。则往当前vm上的refs push ref
// ref指向挂载ref的组件或者elm
// 所以，我们可以用ref来获取组件或者element


```
```js
 function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data;
    if (isDef(i)) {
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

// init:
{
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  }
}

//createComponentInstanceForVnode
export function createComponentInstanceForVnode (
  // we know it's MountedComponentVNode but flow doesn't
  vnode: any,
  // activeInstance in lifecycle state
  parent: any
): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  // check inline-template render functions
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnode.componentOptions.Ctor(options)
}
// 仅仅是创建了一个vm：相对于new Vue(options)
// 但是，因为此时还没有$el。所以走$mount。不会走下去。

// initComponent
function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
        vnode.data.pendingInsert = null
    }
    vnode.elm = vnode.componentInstance.$el
    if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue)
        setScope(vnode)
    } else {
        // empty component root.
        // skip all element-related modules except for ref (#3455)
        registerRef(vnode)
        // make sure to invoke the insert hook
        insertedVnodeQueue.push(vnode)
    }
}
//  invokeCreateHooks(vnode, insertedVnodeQueue)
function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; ++i) {
        cbs.create[i](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
        if (isDef(i.create)) i.create(emptyNode, vnode);
        if (isDef(i.insert)) insertedVnodeQueue.push(vnode);
    }
}
// 这里会执行，各个模块的created逻辑。如ref的。attrs的。style的。directive的

// 后续， insert(parentElm, vnode.elm, refElm);
// 也就是插入到父节点那里去。
// 这里面涉及diff等
```
```js
// 关于卡槽。
// 如
`<child1 :num="parentNum">       
    sda{{color}}
    <template v-slot:header>
        ad{{color}}
    </template>
    <template v-slot:footer="t">
        {{t}}{{color}}
    </template>
</child1>`
=>
_c(
    "child1",
    {
    attrs: { num: parentNum },
    scopedSlots: _u([
        {
        key: "header",
        fn: function() {
            return [
            _v("\n                ad" + _s(color) + "\n            "),
            ];
        },
        proxy: true,
        },
        {
        key: "footer",
        fn: function(t) {
            return [
            _v("\n                " + _s(t) + _s(color) + "\n            "),
            ];
        },
        },
    ]),
    },
    [_v("       \n            sda" + _s(color) + "\n            ")]
),

// 也就是会根据模板的内容，生成正常的子节点。
// 1、default会作为子节点
// 2、其它，会放到scopedSlots中。并且内容会
funtion(){
    return ''
}
// 的形式，来增加自己的作用域。（这里理解下作用域卡槽）
// 生成的时候，也是根据 [_v("       \n            sda" + _s(color) + "\n            ")]
// 来生成原先内容，那新内容。也就是组件内部的内容。是什么时候生成的呢？

// 在组件渲染的时候，如果有卡槽。则会
`
                    <div>
                        <slot name="header">123</slot>
                        <slot name="default">ad</slot>  
                        <slot name="footer" :user="{num}"></slot>
    
                    </div>
`
with(this){
    return _c(
        'div',
        [_t("header",function(){return [_v("123")]}),
        _v(" "),
        _t("default",function(){return [_v("ad")]}),
        _v(" "),
        _t("footer",null,{"user":{num}})
        ],2)
}

// 先略。


$set(x, "inputValue", $event.target.value)}
```
## 四、总结
```js
// 1、render结构为：
new Function(`
  with(this){
      return _c('div',{},[ // _c就是createdElement。
          _c(),
          _c(),
          _v()
      ])
  }
`)
// 也就是ast树，会转化为render树：从上面看也是层级结构。
// 当然，对于组件，组件内部的ast子节点，并不会转化为render树的子节点。 
// 因为这个组件内部写的内容，可以是插槽。也就是标记为插槽。转化为fn。提供给该组件渲染时，读取内容即可
// 然后这个结构，后面会转化为Vnode。Vnode也是这个结构

// render执行时，会先执行，函数的参数：也就是子组建先创建Vnode。然后再创建父组件

// 也就是
// 1个组件 => 1个ast树 => 1个render树 => 1个Vnode树


// 2、__patch__
// __patch__的hooks：const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
// 过程：
// a、深度遍历Vnode。最终转化为element。然后挂载到parent上
// b、如果当前Vnode是html类型，则较为简单
//    nodeOps.createElement(tag, vnode)
//    执行hooks（__patch__的hooks）
//    挂载到父ele上：insert(parentElm, vnode.elm, refElm)
// c、如果当前Vnode是组件类型，则走createComponent
//    走i.data.hooks.init：从父vm拿到该组件的options
//      实例化新的vm：会走beforeCreated,created
//      child.$mount($el):走上面流程。此时$el还没有，此时走render，根据scopeSlot才会生成真正的内容。
//    然后再走
if (isDef(vnode.componentInstance)) {
    // 走create hooks
    initComponent(vnode, insertedVnodeQueue)
    // 插入到父ele
    insert(parentElm, vnode.elm, refElm)
    if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
    }
    return true
}
```