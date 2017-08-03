chrome.storage.sync.get({
  smartSuggestions: true
},function (items) {
  document.getElementById('box1').checked = items.smartSuggestions
})

document.getElementById('box1').onchange = function () {
  chrome.storage.sync.set({
    smartSuggestions: this.checked
  })
}