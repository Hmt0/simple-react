"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createElement(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type: type,
    props: _objectSpread(_objectSpread({}, props), {}, {
      children: children.map(function (child) {
        return _typeof(child) === 'object' ? child : createTextNode(child);
      })
    })
  };
}

function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}

function createDom(fiber) {
  var dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);

  var isProperty = function isProperty(key) {
    return key !== "children";
  };

  Object.keys(fiber.props).filter(isProperty).forEach(function (name) {
    dom[name] = fiber.props[name];
  });
  return dom;
}

var isEvent = function isEvent(key) {
  return key.startsWith("on");
};

var isProperty = function isProperty(key) {
  return key != "children" && !isEvent(key);
};

var isNew = function isNew(prev, next) {
  return function (key) {
    return prev[key] != next[key];
  };
}; // 新fiber props不等于旧fiber props


var isGone = function isGone(prev, next) {
  return function (key) {
    return !(key in next);
  };
}; // key不属于新fiber props


function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  Object.keys(prevProps).filter(isEvent).filter(function (key) {
    return !(key in nextProps) || isNew(prevProps, nextProps)(key);
  }).forEach(function (name) {
    var eventType = name.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevProps[name]);
  }); // Add event listeners

  Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(function (name) {
    var eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  }); // Remove old properties

  Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(function (name) {
    dom[name] = "";
  }); // set new changed properties

  Object.keys(nextProps).filter(isProperty).filter(isNew(newProps, nextProps)).forEach(function (name) {
    dom[name] = nextProps[name];
  });
}

function commitRoot() {
  // TODO add nodes to dom
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  var domParent = fiber.parent.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot // link to old fiber

  };
  nextUnitOfWork = wipRoot;
  deletions = [];
}

var nextUnitOfWork = null;
var wipRoot = null;
var currentRoot = null;
var deletions = []; // 在我们完成每个单元后，如果有任何其他需要做的事情，我们会让浏览器中断渲染。

function workLoop(deadline) {
  var shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // TODO add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  } // TODO create new fibers


  var elements = fiber.props.children;
  reconcileChildren(fiber, elements); // TODO return next unit of work

  if (fiber.child) {
    return fiber.child;
  }

  var nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  // wip -> work in progress
  var index = 0;
  var oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  var prevSibling = null; // 遍历孩子和旧fiber的孩子

  while (index < elements.length || oldFiber != null) {
    var _element = elements[index];
    var newFiber = null;
    var sameType = oldFiber && _element && _element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: _element.props,
        dom: oldFiber.dom,
        // 不需要修改dom
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE"
      };
    } // 创建新fiber


    if (_element && !sameType) {
      newFiber = {
        type: _element.type,
        props: _element.props,
        dom: null,
        // 之后新建dom节点
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT"
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

var Didact = {
  createElement: createElement,
  render: render
};
/** @jsx Didact.createElement */

var element = Didact.createElement("div", {
  id: "foo"
}, Didact.createElement("a", null, "bar"), Didact.createElement("b", null));
var container = document.getElementById("root");
Didact.render(element, container);