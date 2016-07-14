import suppress from './helpers/suppress';

'use strict';
const body = document.body;
let $input, blacklistedDomains=[];

/**
 * Just a hack to manually trigger emoji-suggest
 * when sometimes the elements don't update on SPAs
 *
 * Shortcut : Cmd + Alt + E
 */
$(window).keydown((e) => {
  if(e.metaKey && e.altKey && e.which === 69){
    suppress(e);
    init();
  }
});

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

  $input.textcomplete('destroy');

  $input = $('div[contenteditable="true"],input[type=text], textarea').not('.es-disabled');

  $input.textcomplete([{
    id: 'emoji-autosuggest',
    match: /\B:([\-+\w]*)$/,
    search: function (term, callback) {
      console.log(term, callback);
      callback(window.emojiAuto.match(term))
    },
    template: function (value) {
      return `
        <span class='emoji-value inline'>${value.emoji}</span>
        <span class='emoji-name inline'>${value.name}</span>`
    },
    replace: function (value) {
      return value.emoji + ' ';
    },
    index: 1
  }], {
    dropdownClassName: 'emoji-assistant',
    height: 265,
    maxCount: 10,
    placementStr: 'top'
  });
}

let url;

// listener for URL change
chrome.runtime.onMessage.addListener(function (request) {
    init();
    url = request.data.url;
});

chrome.storage.sync.get('blacklistedDomains', function (response) {
  blacklistedDomains = response.blacklistedDomains || [];
  init();
});
