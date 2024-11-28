import { renderList } from "./main";

export const BASE = "https://finviz.com/screener.ashx";

async function save(screener: string, link: string) {
	const local = chrome.storage.local;
	const input = document.querySelector("input#screener");


	const coll = await get(screener);
	const collByVal = await getByVal(link);
	console.log(collByVal)
	const val = collByVal?.map(val => Object.values(val)[0])
		.filter(value => value === link)

	if (link === BASE) {
		renderErrorMsg("Your screener filter is empty.", input!);
		return;
	}


	if (coll[screener] !== undefined) {
		renderErrorMsg("Screener Name existed already.", input!)
		return;
	}
	if (val !== undefined) {
		renderErrorMsg("Screener Filter existed already.", input!)
		return;
	}

	await local.set({ [screener]: link });
	const list = document.getElementById("list")
	if (list?.textContent?.includes("The watchlist is empty")) {
		list.innerHTML = ""
	}
	renderList();


	await chrome.storage.local.onChanged.addListener((changes, namespace) => {
		for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
			console.log(
				`Storage key "${key}" in namespace "${namespace}" changed.`,
				`Old value was "${oldValue}", new value is "${newValue}".`
			);
		}
		console.log({ changes, namespace })
	})

}
async function existed(screener: string, link: string) {
	const coll = await get(screener);
	const collByVal = await getByVal(link);
	const val = collByVal?.values().find(v => v === link);
	return coll[screener] !== undefined && val !== undefined

}
async function get(key: string = "") {
	// const s = await storage.getItem(`local:${key}`)
	// console.log({ s })
	return await chrome.storage.local.get(key === "" ? null : key);
}

async function getByVal(value: string) {
	const coll = await chrome.storage.local.get();
	if (!Object.keys(coll).length) return;
	const obj = Object.keys(coll)
		.filter((key) => coll[key] === value)
		.map(key => Object.assign({ [key]: coll[key] }))
	console.log({ obj })
	return obj
}

async function clear() {
	await chrome.storage.local.clear();
}

async function remove(key: string) {
	await chrome.storage.local.remove(key);
}


export const local = {
	save,
	get,
	getByVal,
	clear,
}

function renderErrorMsg(message: string, insertAfterElement: Element) {

	const errorMsg = document.getElementById("error-message");
	errorMsg!.style.color = "red";
	errorMsg!.innerText = message;
	insertAfterElement?.insertAdjacentElement("afterend", errorMsg!);

	setTimeout(() => {
		errorMsg!.textContent = ""
	}, 3000)
}