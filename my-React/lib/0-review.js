"use strict";

var element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello"
  }
};
var node = document.createElement(element.type);
node["titile"] = element.props.title;
var text = document.createTextNode("");
text["nodeValue"] = element.props.children;
var container = document.getElementById("root");
node.appendChild(text);
container.appendChild(node);