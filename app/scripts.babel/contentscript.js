import suppress from './helpers/suppress';
import emojiData from './emoji.json';
import basicEmoji from 'node-emoji/lib/emoji.json'
import * as JsSearch from 'js-search';

const search = new JsSearch.__moduleExports.Search('name')
search.addIndex('short_names')
search.addDocuments(emojiData)


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

function getTemplate (emoji, service=false) {
  if(!emoji) service = false;

  let backgroundImage = '';
  let backgroundPosition = '';

  if(service){
    backgroundImage = chrome.extension.getURL(`images/sheet_${service}_64_indexed_256.png`);
    backgroundPosition = `${-emoji.sheet_x * 20}px ${-emoji.sheet_y * 20}px`;
  }

  const style = `
  background-image:url(${backgroundImage});
  background-position: ${backgroundPosition}`;

  const icon = service ? `<i class='twf twf-lg' style='${style}'></i>` : basicEmoji[emoji.short_name];

  return `
    <span class='emoji-value inline'>${icon}</span>
    <span class='emoji-name inline'>${(emoji.name || emoji.short_name).toLowerCase()}</span>
`
}

function init () {
  const hostname = window.location.hostname;

  // prevent for the textareas of github.com
  if(hostname === 'github.com'){
    $('textarea').addClass('es-disabled');
  }

  if (blacklistedDomains.indexOf(window.location.hostname) >= 0){
    $(body).removeClass('enable-emoji-assistant').addClass('disable-emoji-assistant');
    return;
  } else {
    $(body).removeClass('disable-emoji-assistant').addClass('enable-emoji-assistant');
  }

  $input = $('div[contenteditable="true"],input[type=text], textarea').not('.es-disabled');

  $input
    .textcomplete([{
    id: 'emoji-autosuggest',
    match: /\B:([\-+\w]*)$/,
    search: function (term, callback) {
      callback(search.search(term))
    },
    template: function (emoji) {
      if(
        (hostname === 'twitter.com' || hostname === 'tweetdeck.twitter.com')
        && emoji && emoji.has_img_twitter
      ){
        return getTemplate(emoji, 'twitter');
      }
      return getTemplate(emoji);
    },
    replace: function (value) {
      return value.emoji + ' ';
    },
    index: 1
  }], {
    dropdownClassName: 'emoji-assistant',
    height: 265,
    maxCount: 10,
    placementStr: 'top',
    debounce: 150,
    zIndex: '999999'
  })
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
