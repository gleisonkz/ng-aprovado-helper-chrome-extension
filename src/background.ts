chrome.tabs.onSelectionChanged.addListener((tabId) =>
  handleDraggingError(tabId)
);

chrome.runtime.onMessage.addListener(({ videoMessage }) => {
  if (videoMessage === 'posted') {
    alert('VIDEO SALVO COM SUCESSO DONE');
  }
});

function handleDraggingError(tabId: number) {
  chrome.tabs.get(tabId, (tab) => {
    if (
      chrome.runtime.lastError &&
      chrome.runtime.lastError.message ==
        'Tabs cannot be edited right now (user may be dragging a tab).'
    ) {
      setTimeout(() => handleDraggingError(tabId), 100);
      return;
    }
    listenVideoEnded(tab);
  });
}

function listenVideoEnded(tab: chrome.tabs.Tab) {
  const { url } = tab;
  const isInYoutube = /youtube.com\/watch\?/.test(url!);
  disablePopUp(tab);
  if (!isInYoutube) return;
  enablePopUp(tab);
}

function enablePopUp(tab: chrome.tabs.Tab) {
  chrome.browserAction.enable(tab.id);
  chrome.browserAction.setIcon({ path: 'assets/icons/48.png' });
}

function disablePopUp(tab: chrome.tabs.Tab) {
  chrome.browserAction.disable(tab.id);
  chrome.browserAction.setIcon({ path: 'assets/icons/disable-icon.png' });
}
