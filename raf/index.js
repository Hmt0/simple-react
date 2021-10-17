let offsetTop = 0;
const div = document.querySelector(".div");
const run = () => {
  div.style.transform = `translate3d(0, ${offsetTop += 10}px, 0)`;
  window.requestAnimationFrame(run);
};
run();