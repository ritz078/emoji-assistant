import extractDomain from './helpers/extractDomain';
import includes from './helpers/includes';

let blacklistedDomains = [];



function handleBadge (url) {

  const color = includes(blacklistedDomains, extractDomain(url)) ? 'red' : 'green';

  chrome.browserAction.setBadgeText({text:'3'});
  chrome.browserAction.setBadgeBackgroundColor({color})
}

chrome.tabs.onActivated.addListener(function () {
  chrome.tabs.getSelected(null, function(tab) {
    console.log(tab);
    handleBadge(tab.url);
  })
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  chrome.tabs.sendMessage(tabId, { data: tab }, function (response) {
    handleBadge(tab.url);
  });
});

chrome.storage.sync.get('blacklistedDomains', function (response) {
  if(response && response.length) blacklistedDomains = response;
});

chrome.browserAction.onClicked.addListener(function(tab) {
  const domain = extractDomain(tab.url);
  if(!includes(blacklistedDomains, domain)){
    blacklistedDomains.push(domain)
  } else {
    const index = blacklistedDomains.indexOf(domain);
    blacklistedDomains.splice(index, 1);
  }

  chrome.storage.sync.set({blacklistedDomains}, function() {
    // Notify that we saved.
    chrome.tabs.reload(tab.id);
  });
});
