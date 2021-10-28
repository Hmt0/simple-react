function createElement(type, props, ...children) {
    return {
        type: type,
        props: {
            ...props,
            children: children.map(child => 
                typeof child === 'object'
                    ? child
                    : createTextNode(child)
            ),
        },
    }
}

function createTextNode(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

function createDom(fiber) {
    const dom = 
        fiber.type == "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type)
    const isProperty = key => key !== "children"
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            if(isEvent(name)) {
                const eventType = name.toLowerCase().substring(2)
                dom.addEventListener(
                    eventType, fiber.props[name]
                )
            } else {
                dom[name] = fiber.props[name]
            }
        })
    Object.keys(fiber.props)
        .filter(isProperty)
        .filter(isEvent)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })
    return dom
}

const isEvent = key => key.startsWith("on")
const isProperty = key => key != "children" && !isEvent(key)
const isNew = (prev, next) => key => 
    prev[key] != next[key] // 新fiber props不等于旧fiber props
const isGone = (prev, next) => key => !(key in next) // key不属于新fiber props

function updateDom(dom, prevProps, nextProps) {
    // Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key =>
                !(key in nextProps) ||
                isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name  
                .toLowerCase()
                .substring(2)
            dom.removeEventListener(
                eventType,
                prevProps[name]
            )
        })
    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })
    // Remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = ""
        })

    // set new changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        })
}

function commitRoot() {
    // TODO add nodes to dom
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber) {
    console.log("<================commitWork阶段")
    console.log("提交的节点：",fiber)
    if(!fiber) {
        return
    }
    let domParentFiber = fiber.parent
    while(!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber.dom
    console.log("domParent(函数式组件没有dom)：", domParent)
    if(
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        console.log("插入节点：", fiber.dom)
        domParent.appendChild(fiber.dom)
    } else if (
        fiber.effectTag === "DELETION") {
        console.log("删除节点")
        commitDeletion(fiber, domParent)
    } else if (
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
    ) {
        console.log("更新节点：", fiber.dom)
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
    console.log("commitWork阶段==================>")
}

function commitDeletion(fiber, domParent) {
    if(fiber.dom) {
        domParent.remove(fiber.dom)
    } else {
    commitDeletion(fiber.child, domParent)
    }
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot, // link to old fiber
    }
    nextUnitOfWork = wipRoot
    deletions = []
    console.log("<============render阶段",
        "\nelement:",element,
        "\ncontainer:",container,
        "\nnextUnitOfWork:",nextUnitOfWork,
        "\ndeletions", deletions,
        "\nrender阶段============>"
    )
}

let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null
let deletions = []

// 在我们完成每个单元后，如果有任何其他需要做的事情，我们会让浏览器中断渲染。
function workLoop(deadline) {
    let shouldYield = false
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }

    if(!nextUnitOfWork && wipRoot) {
        console.log("<==============commit阶段")
        commitRoot()
        console.log("commit阶段==============>")
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    console.log("<============performUnitOfWork阶段\n", 
    "fiber type", fiber.type)
    const isFunctionComponent = 
        fiber.type instanceof Function
    if(isFunctionComponent) {
        console.log("fiber是函数组件")
        updateFunctionComponent(fiber)
    } else {
        console.log("fiber是普通组件")
        updateHostComponent(fiber)
    }
    // TODO return next unit of work
    if(fiber.child) {
        console.log("查找fiber.child存在，则返回fiber.child作为nextUnitOfWork:",fiber.child)
        return fiber.child
    }
    let nextFiber = fiber
    console.log("查找fiber.sibling，向上查找fiber.parent：")
    while(nextFiber) {
        console.log("nextFiber", nextFiber)
        if(nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
    console.log("performUnitOfWork阶段=============>")
}

let wipFiber = null
let hookIndex = null

function useState(initial) {
    console.log("<==============执行useState")
    const oldHook = 
        wipFiber.alternate &&
        wipFiber.alternate.hooks && 
        wipFiber.alternate.hooks[hookIndex]
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [],
    }
    const actions = oldHook ? oldHook.queue : []
    console.log("hook:", hook, "\noldhook", oldHook, "\nactions", actions)
    // 执行oldHook中的useState回调
    actions.forEach(action => {
        hook.state = action(hook.state)
    })

    const setState = action => {
        console.log("<================执行setState")
        // 闭包，保存着当前fiber的hook
        // 执行setState并没有立即执行action，而是把action添加到hook的队列中
        // 并更新wipRoot引发重新渲染
        // 在更新函数组件的时候重新执行useState里面的action队列
        hook.queue.push(action)
        console.log("action:", action)
        console.log("更新hook.queue:", hook.queue)
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        }
        nextUnitOfWork = wipRoot
        console.log("更新nextUnitOfWork:", nextUnitOfWork)
        deletions = []
    }
    // 更新当前fiber的hooks
    wipFiber.hooks.push(hook)
    hookIndex++
    console.log("每调用一次useState,hookIndex+1:", hookIndex)
    console.log("useState返回初始state和setState函数：", hook.state, setState)
    return [hook.state, setState]
}

function updateFunctionComponent(fiber) {
    console.log("<============updateFunctionComponent阶段")
    wipFiber = fiber
    hookIndex = 0
    wipFiber.hooks = []
    const children = [fiber.type(fiber.props)]
    console.log("fiber.type是函数：", fiber.type)
    console.log("执行函数后得到子组件：", children)
    reconcileChildren(fiber, children)
    console.log("updateFunctionComponent阶段============>")
}

function updateHostComponent(fiber) {
    console.log("<============updateHostComponent阶段")
    if(!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    console.log("fiber dom:", fiber.dom)
    reconcileChildren(fiber, fiber.props.children)
    console.log("updateHostComponent阶段============>")
}

function reconcileChildren(wipFiber, elements) {
    console.log("<============reconcileChildren阶段")
    // wip -> work in progress
    let index = 0
    let oldFiber = 
        wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    // 遍历孩子和旧fiber的孩子
    console.log("遍历新fiber孩子和旧fiber孩子")
    while(
        index < elements.length ||
        oldFiber != null
    ) {
        const element = elements[index]
        console.log("element:", element,"\noldFiber:", oldFiber)
        let newFiber = null

        const sameType = 
            oldFiber &&
            element &&
            element.type == oldFiber.type

        if(sameType) {
            console.log("dom类型相同")
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom, // 不需要修改dom
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }

        // 创建新fiber
        if(element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null, // 之后新建dom节点
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
            console.log("dom类型不同，需要插入新节点newFiber:",newFiber)
        }


        if(oldFiber && !sameType) {
            console.log("dom类型不同，需要删除旧节点")
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }

        if(oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if(index === 0) {
            wipFiber.child = newFiber
            console.log("把第一个newFiber赋给wipFiber.child：", wipFiber)
        } else {
            prevSibling.sibling = newFiber
            console.log("其余的newFiber赋给preSibling.sibling：", prevSibling)
        }

        prevSibling = newFiber
        index++
    }
    console.log("reconcileChildren阶段============>")
}

const Didact = {
    createElement,
    render,
    useState,
}

/** @jsx Didact.createElement */
function Counter() {
    const [state, setState] = Didact.useState(1)
    const [count, setCount] = Didact.useState(0)
    return (
        <h1 onClick={() => {
            setState(c => c+1)
            setCount(c => c+1)}}> 
            Count: {state}
        </h1>
    )
}
const element = <Counter />
// 此处是函数式组件，处理方式不同于一般组件
const container = document.getElementById("root")
Didact.render(element, container)