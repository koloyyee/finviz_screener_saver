export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

});

// chrome.omnibox.onInputEntered.addListener((input) => {
// 	console.log(input)
// })