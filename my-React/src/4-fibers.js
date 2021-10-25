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
    console.log("dom", dom)
    const isProperty = key => key !== "children"
    Object.keys(fiber.props)
      .filter(isProperty)
      .forEach(name => {
        dom[name] = fiber.props[name]
      })

    return dom
}

function render(element, container) {
    console.log("container", container)
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element],
        },
    }
    console.log("render", nextUnitOfWork)
}

let nextUnitOfWork = null


// 在我们完成每个单元后，如果有任何其他需要做的事情，我们会让浏览器中断渲染。
function workLoop(deadline) {
    let shouldYield = false
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    console.log("next", fiber)
    // TODO add dom node
    if(!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    if(fiber.parent) {
        console.log("parent", fiber.parent)
        // 插入新节点
        fiber.parent.dom.appendChild(fiber.dom)
    }
    // TODO create new fibers
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null

    while(index < elements.length) {
        const element = elements[index]

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null
        }

        console.log("newFiber============", newFiber)

        if(index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
    // TODO return next unit of work
    if(fiber.child) {
        console.log("fiber", fiber.dom, "child", fiber.child)
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