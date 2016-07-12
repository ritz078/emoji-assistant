import emojiAuto from 'emoji-autocomplete/src/autocomplete';
import $ from 'jquery';
import 'jquery.caret';

'use strict';
const body = document.body;

const cursorPosition = (oldStr, newStr) => {
  const length = Math.max(oldStr.length, newStr.length);
  for (let i = 0; i < length; i++) {
    if (oldStr[i] !== newStr[i]) return i;
  }
  return -1;
};

const wordAtPosition = (str, pos) => {
  // Perform type conversions.
  str = String(str);
  pos = Number(pos) >>> 0;

  // Search for the word's beginning and end.
  var left = str.slice(0, pos + 1).search(/(\S+$)|(\n+$)/),
    right = str.slice(pos).search(/\s/);

  // The last word in the string is a special case.
  if (right < 0) {
    return str.slice(left);
  }

  // Return the word, using the located bounds to extract it from the string.
  return str.slice(left, right + pos);
};

const input = document.getElementById('tweet-box-home-timeline');

let str = input.innerText;

let isSuggestionOpen = false;

function removeSuggestions(){
  $('#emoji-autosuggest').remove();
}

function navigate (e) {
  const $elements = $('#emoji-autosuggest .emoji-suggesstion');
  if(!$elements.length) return;
  const activeIndex = $elements.siblings('.active').data('index');
  if(e.which === 40 && (activeIndex < $elements.length)){
    $elements.removeClass('active');
    $($elements[activeIndex+1]).addClass('active');
  } else if (e.which === 38 && activeIndex > 0){
    $elements.removeClass('active');
    $($elements[activeIndex-1]).addClass('active');
  } else if (e.which === 13){
    const selected = $elements[activeIndex];
    return $(selected).find('.emoji-value').text()
  }
}

function handleKeyPress (e) {
  if(e.which === 16) return;
  if (e.which === 40 || e.which === 38 || e.which === 13) {
    e.preventDefault();
    e.stopPropagation();
    const selected = navigate(e);
    if(e.which === 13) {
      if(isContentEditable($(this))){
        this.innerHTML = html.replace(word, selected);
      } else {
        this.value = value.replace(word, selected)
      }
      removeSuggestions();
    }
    return false
  }else{
    value = this.value || this.innerText;
    html = this.innerHTML;
    changeIndex = cursorPosition(value, str);
    word = wordAtPosition(value, changeIndex);
  }

  console.log(word);
  removeSuggestions();
  if (word.indexOf(':') === 0) {
    e.preventDefault();
    e.stopPropagation();
    $(body).append(suggestions($(this), word.slice(1)));
    isSuggestionOpen = true;
  } else {
    isSuggestionOpen = false;
  }
  str = value;
  return false;
}

function isContentEditable ($elem) {
  return !!($elem[0].contentEditable && $elem[0].contentEditable === 'true');
}

let value, changeIndex, word, html;

$('div[contenteditable="true"]').off('keyup.emoji').on('keyup.emoji', function (e) {
  console.log('yayay',e.shiftKey);

  return handleKeyPress.bind(this)(e);
});


function suggestions (elem, query) {
  const results = emojiAuto.match(query).slice(0, 10);
  const position = elem.caret('offset');
  const suggestion = results.map((val, i) => {
    const className = i === 0 ? 'emoji-suggesstion active' : 'emoji-suggesstion';
    return `
    <div class='${className}' data-index='${i}'>
      <span class='emoji-value inline'>${val.emoji}</span>
      <span class='emoji-name inline'>${val.name}</span>
    </div>
`
  });

  return `
  <div id='emoji-autosuggest'
    style=' top: ${position.top + position.height + 10}px; left: ${position.left}px; '
  >${suggestion.join('')}</div>
`;
}

