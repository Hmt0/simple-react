"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
    if (isEvent(name)) {
      var eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, fiber.props[name]);
    } else {
      dom[name] = fiber.props[name];
    }
  });
  Object.keys(fiber.props).filter(isProperty).filter(isEvent).forEach(function (name) {
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

  Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(function (name) {
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

  var domParentFiber = fiber.parent;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }

  var domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.remove(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
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
  var isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

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

var wipFiber = null;
var hookIndex = null;

function useState(initial) {
  var oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
  var hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  };
  var actions = oldHook ? oldHook.queue : [];
  console.log("<=================执行useState,actions:", actions);
  actions.forEach(function (action) {
    hook.state = action(hook.state);
  });

  var setState = function setState(action) {
    console.log("<================执行setState", hook.state, oldHook);
    hook.queue.push(action); // wipRoot实在setState中更新地

    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  }; // 更新当前fiber的hooks


  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  var children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
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
  render: render,
  useState: useState
};
/** @jsx Didact.createElement */

function Counter() {
  // const [state0, setState0] = Didact.useState(0)
  var _Didact$useState = Didact.useState(60),
      _Didact$useState2 = _slicedToArray(_Didact$useState, 2),
      state1 = _Didact$useState2[0],
      setState1 = _Didact$useState2[1];

  function handleClick() {
    // let localTimer = 5
    // const timer = setInterval(() => {
    //     // setInterval中的seState1还是第一个useState的函数，所以会一直往第一个hook离添加action，数字不会一直减少
    //     if(localTimer > 1) {
    //         localTimer--
    //     }
    //     else(
    //         clearInterval(timer)
    //     )
    //     setState1((preSecond) => {
    //         console.log("state1", state1)
    //         return preSecond - 1
    //     })
    // }, 1000)
    var second = 10;

    var countDown = function countDown() {
      if (second > 0) {
        second--;
      } else {
        second = 10;
        return;
      }

      setState1(function (second) {
        return second;
      });
      setTimeout(countDown, 1000);
    };

    setTimeout(countDown, 1000);
  }

  return Didact.createElement("div", null, Didact.createElement("button", {
    onClick: handleClick
  }, "\u5F00\u542F\u5012\u8BA1\u65F6"), Didact.createElement("h2", null, state1));
}

var element = Didact.createElement(Counter, null); // 此处是函数式组件，处理方式不同于一般组件

var container = document.getElementById("root");
Didact.render(element, container);