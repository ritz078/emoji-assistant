import suppress from './helpers/suppress'
import basicEmoji from 'node-emoji/lib/emoji.json'
import getSuggestions from './getSuggestions'
import getTemplate from './getTemplate'
import emojilib from 'emojilib/emojis.json'

const body = document.body
let $input, blacklistedDomains = []

/**
 * Just a hack to manually trigger emoji-suggest
 * when sometimes the elements don't update on SPAs
 *
 * Shortcut : Cmd + Alt + E
 */
$(window).keydown((e) => {
  if (e.metaKey && e.altKey && e.which === 69) {
    suppress(e)
    init()
  }
})

function getEmoji (name) {
  return basicEmoji[name] || (emojilib[name.replace('-', '_')] && emojilib[name.replace('-', '_')].char)
}

function init () {
  const hostname = window.location.hostname

  // prevent for the textareas of github.com
  if (hostname === 'github.com') {
    $('textarea').addClass('es-disabled')
  }

  if (blacklistedDomains.indexOf(window.location.hostname) >= 0) {
    $(body).removeClass('enable-emoji-assistant').addClass('disable-emoji-assistant')
    return
  } else {
    $(body).removeClass('disable-emoji-assistant').addClass('enable-emoji-assistant')
  }

  $input = $('div[contenteditable="true"],input[type=text], textarea').not('.es-disabled')

  $input
    .textcomplete([{
      id: 'emoji-autosuggest',
      match: /\B:([\-+\w]*)$/,
      search: function (term, callback) {
        getSuggestions(term, callback)
      },
      template: function (emoji) {
        const service = (hostname === 'twitter.com' || hostname === 'tweetdeck.twitter.com')
          && emoji && emoji.has_img_twitter
        return getTemplate(emoji, service)
      },
      replace: function (value) {
        return getEmoji(value.short_name) + ' '
      },
      index: 1
    }], {
      dropdownClassName: 'emoji-assistant',
      height: 265,
      maxCount: 14,
      placementStr: 'top',
      debounce: 400,
      zIndex: '999999'
    })
}

let url

// listener for URL change
chrome.runtime.onMessage.addListener(function (request) {
  init()
  url = request.data.url
})

chrome.storage.sync.get('blacklistedDomains', function (response) {
  blacklistedDomains = response.blacklistedDomains || []
  init()
})
