'use strict';

chrome.tabs.query({active:true}, function (tab) {
  console.log(tab)
});

chrome.storage.sync.set({'value': 'hello'}, function() {
  // Notify that we saved.
  console.log('Settings saved');
});

