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
  console.log("<================commitWork阶段");
  console.log("提交的节点：", fiber);

  if (!fiber) {
    return;
  }

  var domParentFiber = fiber.parent;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }

  var domParent = domParentFiber.dom;
  console.log("domParent(函数式组件没有dom)：", domParent);

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    console.log("插入节点：", fiber.dom);
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    console.log("删除节点");
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    console.log("更新节点：", fiber.dom);
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
  console.log("commitWork阶段==================>");
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
  console.log("<============render阶段", "\nelement:", element, "\ncontainer:", container, "\nnextUnitOfWork:", nextUnitOfWork, "\ndeletions", deletions, "\nrender阶段============>");
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
    console.log("<==============commit阶段");
    commitRoot();
    console.log("commit阶段==============>");
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  console.log("<============performUnitOfWork阶段\n", "fiber type", fiber.type);
  var isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    console.log("fiber是函数组件");
    updateFunctionComponent(fiber);
  } else {
    console.log("fiber是普通组件");
    updateHostComponent(fiber);
  } // TODO return next unit of work


  if (fiber.child) {
    console.log("查找fiber.child存在，则返回fiber.child作为nextUnitOfWork:", fiber.child);
    return fiber.child;
  }

  var nextFiber = fiber;
  console.log("查找fiber.sibling，向上查找fiber.parent：");

  while (nextFiber) {
    console.log("nextFiber", nextFiber);

    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }

  console.log("performUnitOfWork阶段=============>");
}

var wipFiber = null;
var hookIndex = null;

function useState(initial) {
  console.log("<==============执行useState");
  var oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
  var hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  };
  var actions = oldHook ? oldHook.queue : [];
  console.log("hook:", hook, "\noldhook", oldHook, "\nactions", actions); // 执行oldHook中的useState回调

  actions.forEach(function (action) {
    hook.state = action(hook.state);
  });

  var setState = function setState(action) {
    console.log("<================执行setState"); // 闭包，保存着当前fiber的hook
    // 执行setState并没有立即执行action，而是把action添加到hook的队列中
    // 并更新wipRoot引发重新渲染
    // 在更新函数组件的时候重新执行useState里面的action队列

    hook.queue.push(action);
    console.log("action:", action);
    console.log("更新hook.queue:", hook.queue);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    };
    nextUnitOfWork = wipRoot;
    console.log("更新nextUnitOfWork:", nextUnitOfWork);
    deletions = [];
  }; // 更新当前fiber的hooks


  wipFiber.hooks.push(hook);
  hookIndex++;
  console.log("每调用一次useState,hookIndex+1:", hookIndex);
  console.log("useState返回初始state和setState函数：", hook.state, setState);
  return [hook.state, setState];
}

function updateFunctionComponent(fiber) {
  console.log("<============updateFunctionComponent阶段");
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  var children = [fiber.type(fiber.props)];
  console.log("fiber.type是函数：", fiber.type);
  console.log("执行函数后得到子组件：", children);
  console.log("wipFiber.hooks:", wipFiber.hooks);
  reconcileChildren(fiber, children);
  console.log("updateFunctionComponent阶段============>");
}

function updateHostComponent(fiber) {
  console.log("<============updateHostComponent阶段");

  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  console.log("fiber dom:", fiber.dom);
  reconcileChildren(fiber, fiber.props.children);
  console.log("updateHostComponent阶段============>");
}

function reconcileChildren(wipFiber, elements) {
  console.log("<============reconcileChildren阶段"); // wip -> work in progress

  var index = 0;
  var oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  var prevSibling = null; // 遍历孩子和旧fiber的孩子

  console.log("遍历新fiber孩子和旧fiber孩子");

  while (index < elements.length || oldFiber != null) {
    var _element = elements[index];
    console.log("element:", _element, "\noldFiber:", oldFiber);
    var newFiber = null;
    var sameType = oldFiber && _element && _element.type == oldFiber.type;

    if (sameType) {
      console.log("dom类型相同");
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
      console.log("dom类型不同，需要插入新节点newFiber:", newFiber);
    }

    if (oldFiber && !sameType) {
      console.log("dom类型不同，需要删除旧节点");
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
      console.log("把第一个newFiber赋给wipFiber.child：", wipFiber);
    } else {
      prevSibling.sibling = newFiber;
      console.log("其余的newFiber赋给preSibling.sibling：", prevSibling);
    }

    prevSibling = newFiber;
    index++;
  }

  console.log("reconcileChildren阶段============>");
}

var Didact = {
  createElement: createElement,
  render: render,
  useState: useState
};
/** @jsx Didact.createElement */

function Counter() {
  var _Didact$useState = Didact.useState(0),
      _Didact$useState2 = _slicedToArray(_Didact$useState, 2),
      state0 = _Didact$useState2[0],
      setState0 = _Didact$useState2[1];

  var _Didact$useState3 = Didact.useState(1),
      _Didact$useState4 = _slicedToArray(_Didact$useState3, 2),
      satte1 = _Didact$useState4[0],
      setState1 = _Didact$useState4[1];

  var _Didact$useState5 = Didact.useState(2),
      _Didact$useState6 = _slicedToArray(_Didact$useState5, 2),
      satte2 = _Didact$useState6[0],
      setState2 = _Didact$useState6[1];

  return Didact.createElement("h1", {
    onClick: function onClick() {
      setState0(function (c) {
        return c + 1;
      });
      setCount1(function (c) {
        return c + 1;
      });
    }
  }, "Count: ", state0);
}

var element = Didact.createElement(Counter, null); // 此处是函数式组件，处理方式不同于一般组件

var container = document.getElementById("root");
Didact.render(element, container);