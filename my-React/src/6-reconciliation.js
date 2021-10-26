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
        .filter(isNew(newProps, nextProps))
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
    if(!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    if(
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === "DELETION") {
        domParent.removeChild(fiber.dom)
    } else if (
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
    ) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
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
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    // TODO add dom node
    if(!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    // TODO create new fibers
    const elements = fiber.props.children
    reconcileChildren(fiber, elements)
    
    // TODO return next unit of work
    if(fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while(nextFiber) {
        if(nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

function reconcileChildren(wipFiber, elements) {
    // wip -> work in progress
    let index = 0
    let oldFiber = 
        wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    // 遍历孩子和旧fiber的孩子
    while(
        index < elements.length ||
        oldFiber != null
    ) {
        const element = elements[index]
        let newFiber = null

        const sameType = 
            oldFiber &&
            element &&
            element.type == oldFiber.type

        if(sameType) {
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
        }


        if(oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }

        if(oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if(index === 0) {
            wipFiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
}

const Didact = {
    createElement,
    render,
}

/** @jsx Didact.createElement */
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)



const container = document.getElementById("root")
Didact.render(element, container)