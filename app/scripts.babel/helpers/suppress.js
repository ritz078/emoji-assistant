export default function (e) {
  e.preventBubble = false;
  e.preventDefault();
  e.stopPropagation();
}
