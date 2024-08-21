chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ city: "Minsk" });
});
