chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    city: {
      name: "Minsk",
      location: {
        lat: 53.906184,
        lng: 27.555353,
      },
    },
  });
});
