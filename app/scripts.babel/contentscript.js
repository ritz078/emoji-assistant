import emojiAuto from 'emoji-autocomplete/src/autocomplete';
import $ from './vendor/jquery.min';
import './vendor/jquery.caret';

import cursorPosition from './helpers/cursorPosition';
import wordAtPosition from './helpers/wordAtPosition';
import isContentEditable from './helpers/isContentEditable';
import suppress from './helpers/suppress';

'use strict';
const body = document.body;
let $input, isSuggestionOpen, html, blacklistedDomains=[];

/**
 * Removes the dropdown
 */
function removeSuggestions () {
  $('#emoji-autosuggest').remove();
  isSuggestionOpen = false;
}

$(window).click(() => {
  removeSuggestions();
});

function suggestions (elem, query) {
  const results = emojiAuto.match(query).slice(0, 10);
  const position = elem.caret('offset');
  const suggestion = results.map((val, i) => {
    const className = i === 0 ? 'emoji-suggestion active' : 'emoji-suggestion';
    return `
    <div class='${className}' data-index='${i}'>
      <span class='emoji-value inline'>${val.emoji}</span>
      <span class='emoji-name inline'>${val.name}</span>
    </div>`;
  });

  return `<div id='emoji-autosuggest'
    style='top:${position.top + position.height + 5}px; left: ${position.left}px;'
  >${suggestion.join('')}</div>`;
}

/**
 * Handle emoji navigation like up, down arrow and select
 * @param e
 * @returns {*|jQuery}
 */
function navigate (e) {
  const $elements = $('#emoji-autosuggest .emoji-suggestion');
  if (!$elements.length) return;
  const activeIndex = $elements.siblings('.active').data('index');
  if (e.which === 40 && (activeIndex < $elements.length)) {
    $elements.removeClass('active');
    $($elements[activeIndex + 1]).addClass('active');
  } else if (e.which === 38 && activeIndex > 0) {
    $elements.removeClass('active');
    $($elements[activeIndex - 1]).addClass('active');
  } else if (e.which === 13) {
    const selected = $elements[activeIndex];
    return $(selected).find('.emoji-value').text()
  }
}


/**
 * Handles keyup event of the input boxes or contenteditables.
 * @param e
 */
function handleKeyPress (e) {
  if (e.which === 16) return; // shift key

  let value;

  if (isSuggestionOpen && (e.which === 40 || e.which === 38 || e.which === 13)) {
    const selected = navigate(e);
    if (e.which === 13) {
      if (isContentEditable($(this)[0])) {
        this.innerHTML = html.replace(this.word, selected + ' ');
      } else {
        this.value = this.value.replace(this.word, selected + ' ')
      }
      removeSuggestions();
    }
    return false;
  } else {
    value = this.value || this.innerText;
    html = this.innerHTML;

    const isDeleted = e.which === 8; // backspace/delete
    const changeIndex = cursorPosition(value, this.initialText, isDeleted);
    this.word = wordAtPosition(value, changeIndex);
  }

  removeSuggestions();
  if (this.word.indexOf(':') === 0) {
    $(body).append(suggestions($(this), this.word.slice(1)));
    $('#emoji-autosuggest').off('click').on('click', (e) => {
      suppress(e)
    });
    isSuggestionOpen = true;
  }
  this.initialText = value;
}

function init () {
  // prevent for the textareas of github.com
  if(window.location.hostname === 'github.com'){
    $('textarea').addClass('es-disabled');
  }

  if (blacklistedDomains.indexOf(window.location.hostname) >= 0){
    $(body).removeClass('enable-emoji-assistant').addClass('disable-emoji-assistant');
    return;
  } else {
    $(body).removeClass('disable-emoji-assistant').addClass('enable-emoji-assistant');
  }

  removeSuggestions();

  $input = $('div[contenteditable="true"],input[type=text], textarea').not('.es-disabled');

  $input.each(function () {
    this.initialText = isContentEditable(this) ? $(this).text() : $(this).val()
  });

  $($input).off('keydown.emoji').on('keydown.emoji', function (e) {
    if (e.which == 13 && isSuggestionOpen && !isContentEditable(this)) {
      suppress(e)
    }
  });

  $($input).off('keyup.emoji').on('keyup.emoji', function (e) {
    if (!isSuggestionOpen && e.which === 13) return true;
    suppress(e);
    handleKeyPress.bind(this)(e);
  });
}

let url;

// listener for URL change
chrome.runtime.onMessage.addListener(function (request) {
    init();
    url = request.data.url;
});

chrome.storage.sync.get('blacklistedDomains', function (response) {
  blacklistedDomains = response.blacklistedDomains;
  init();
});
