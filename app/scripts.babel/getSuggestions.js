import flush from 'just-flush'
import uniqBy from 'lodash.uniqby'
import * as JsSearch from 'js-search'
import emojiData from './emoji.json'
import basicEmoji from 'node-emoji/lib/emoji.json'

function swap(json){
  const ret = {};
  for(const key in json){
    if(json.hasOwnProperty(key)) {
      ret[json[key]] = key;
    }
  }
  return ret;
}

const emojiToNameMapping = swap(basicEmoji)

function getEmojiDetailsFromEmoji (emoji) {
  const emojiName = emojiToNameMapping[emoji]
  return emojiData.filter(x => x.short_name === emojiName)[0]
}

const search = new JsSearch.__moduleExports.Search('name')
search.addIndex('short_names')
search.addDocuments(emojiData)

export default function getSuggestions (term, cb) {
  fetch(`https://emoji.getdango.com/api/emoji?q=${term}`)
    .then(res => res.json())
    .then(({results}) => {
      const smartEmojis = flush(results.map(({text}) => {
        return getEmojiDetailsFromEmoji(text)
      }))
      const suggestions = uniqBy(smartEmojis.concat(search.search(term)), 'short_name')
      cb(suggestions)
    })
    .catch(error => {
      cb(search.search(term))
    })
}