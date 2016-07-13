import extractDomain from './helpers/extractDomain';
import includes from './helpers/includes';

let blacklistedDomains = [];

/**
 * Changes icon badge based on whether extension is activated or
 * deactivated for the current domain.
 * @param url
 */
function handleBadge (url) {
  const color = includes(blacklistedDomains, extractDomain(url)) ? 'red' : 'green';
  const text = includes(blacklistedDomains, extractDomain(url)) ? 'off' : 'on';

  chrome.browserAction.setBadgeText({ text });
  chrome.browserAction.setBadgeBackgroundColor({ color })
}

/**
 * This listener trigger whenever the active tab changes
 */
chrome.tabs.onActivated.addListener(function () {
  // to get the URL of the active tab. null implies active tab.
  chrome.tabs.getSelected(null, function (tab) {
    handleBadge(tab.url);
  })
});

// listener for the update of tab through ajax.
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if(info.status === 'complete'){
    chrome.tabs.sendMessage(tabId, { data: tab, info }, function () {
      handleBadge(tab.url);
    });
  }
});

// get the blacklisted domains from chrome storage.
chrome.storage.sync.get('blacklistedDomains', function (response) {
  if (response && response.length) blacklistedDomains = response;
});

// listens on the click of icon and toggles blacklisted domain
chrome.browserAction.onClicked.addListener(function (tab) {
  const domain = extractDomain(tab.url);
  if (!includes(blacklistedDomains, domain)) {
    blacklistedDomains.push(domain)
  } else {
    const index = blacklistedDomains.indexOf(domain);
    blacklistedDomains.splice(index, 1);
  }

  chrome.storage.sync.set({ blacklistedDomains }, function () {
    // Notify that we saved.
    chrome.tabs.reload(tab.id);
  });
});
