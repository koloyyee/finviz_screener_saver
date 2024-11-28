
export default defineContentScript({
	matches: ['*://*.google.com/*'],
	main() {
		console.log('Hello content.');
	},
});


// track the clicks
document.addEventListener("click", (event) => {
	event.preventDefault();
	event.stopPropagation();
	const target = event.target as HTMLElement;
	console.log(target.outerHTML);
})
console.log("hello")