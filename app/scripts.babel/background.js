'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  chrome.pageAction.show(tabId);
  chrome.tabs.sendMessage(tabId, {data: tab}, function (response) {
    console.log(response)
  });
});

console.log('\'Allo \'Allo! Event Page for Page Action');
