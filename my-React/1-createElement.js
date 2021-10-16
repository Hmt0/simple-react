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

const element = Didact.createElement(
    "div",
    { id: "foo"},
    Didact.createElement("a", null, "bar"),
    Didact.createElement("b")
)

/** @jsx Didact.createElement */
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)