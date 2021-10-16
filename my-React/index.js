const element = {
    type: "h1",
    props: {
        title: "foo",
        children: "Hello"
    },
}

function createElement(type, props, ...children) {
    return {
        type: type,
        props: {
            ...props,
            children: children.map(child => {
                typeof child === 'object'
                    ? child
                    : createTextNode(child)
            }),
        },
    }
}

function createTextNode(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            child: [],
        },
    }
}

const Didact = {
    createElement,
}

const node = document.createElement(element.type)
node["titile"] = element.props.title

const text = document.createTextNode("")
text["nodeValue"] = element.props.children

const container = document.getElementById("root")
node.appendChild(text)
container.appendChild(node)