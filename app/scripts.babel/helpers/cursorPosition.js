/**
 * returns the cursor index by comparing the previous text and new text
 * @param newStr
 * @param oldStr
 * @param isDeleted true if delete or backspace is pressed
 * @returns {number}
 */
export default function (newStr, oldStr, isDeleted) {
  const length = Math.max(oldStr.length, newStr.length);
  let changeIndex = -1;
  for (let i = 0; i < length; i++) {
    if (oldStr[i] !== newStr[i]) {
      changeIndex = i;
      break;
    }
  }
  return isDeleted ? changeIndex - 1 : changeIndex;
};
