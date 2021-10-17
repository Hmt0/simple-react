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

}

function commitRoot() {
    // TODO add nodes to dom
    commitWork(wipRoot.child)
    wipRoot = null
}

function commitWork(fiber) {
    if(!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
    }
    nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let wipRoot = null

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
    let index = 0
    let oldFiber = 
        wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null

    while(
        index < elements.length ||
        oldFiber != null
    ) {
        const element = elements[index]

        const sameType = 
            oldFiber &&
            element &&
            element.type == oldFiber.type

        if(sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }

        if(element && !sameType) {

        }

        if(oldFiber && !sameType) {

        }

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: wipFiber,
            dom: null
        }

        if(index === 0) {
            wipFiber.child = element
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