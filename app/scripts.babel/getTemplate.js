import basicEmoji from 'node-emoji/lib/emoji.json'

export default function getTemplate (emoji, service = false) {
  if (!emoji) service = false

  let backgroundImage = ''
  let backgroundPosition = ''

  if (service) {
    backgroundImage = chrome.extension.getURL('images/sheet_twitter_64_indexed_256.png')
    backgroundPosition = `${-emoji.sheet_x * 20}px ${-emoji.sheet_y * 20}px`
  }

  const style = `
  background-image:url(${backgroundImage});
  background-position: ${backgroundPosition}`

  const icon = service ? `<i class='twf twf-lg' style='${style}'></i>` : basicEmoji[emoji.short_name]

  return `
    <span class='emoji-value inline'>${icon}</span>
    <span class='emoji-name inline'>${(emoji.name || emoji.short_name).toLowerCase()}</span>
`
}