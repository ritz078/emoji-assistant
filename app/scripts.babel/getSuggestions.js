import flush from 'just-flush'
import uniqBy from 'lodash.uniqby'
import matchSorter from 'match-sorter'
import emojiData from './emoji.json'
import basicEmoji from 'node-emoji/lib/emoji.json'

function swap (json) {
  const ret = {}
  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      ret[json[key]] = key
    }
  }
  return ret
}

const emojiToNameMapping = swap(basicEmoji)

function getEmojiDetailsFromEmoji (emoji) {
  const emojiName = emojiToNameMapping[emoji]
  return emojiData.filter(x => x.short_name === emojiName)[0]
}

export default function getSuggestions (term, cb) {
  chrome.storage.sync.get({
    smartSuggestions: true
  }, function (items) {
    const filtered = matchSorter(emojiData, term, {
      keys: ['name', 'short_names']
    })

    if (items.smartSuggestions) {
      fetch(`https://emoji.getdango.com/api/emoji?q=${term}`)
        .then(res => res.json())
        .then(({results}) => {
          const smartEmojis = flush(results.map(({text}) => {
            return getEmojiDetailsFromEmoji(text)
          }))

          const suggestions = uniqBy(smartEmojis.concat(filtered), 'short_name')
          cb(suggestions)
        })
        .catch(error => {
          const filtered = matchSorter(emojiData, term, {
            keys: ['name', 'short_names']
          })
          cb(filtered)
        })
    } else {
      cb(filtered)
    }
  })

}