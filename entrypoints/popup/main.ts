import './style.css';
import { BASE, local } from "./utils";

async function loadPage() {
	const formBody = document.getElementById("favoritesForm");
	const section = document.querySelector("section");

	formBody?.classList.add("hidden","flex" ,"justify-evenly", "items-center");
	section?.classList.add("h-[3rem]", "p-3")
	const [tab] = await chrome.tabs.query({ active: true });

	if (tab.url?.includes("https://finviz.com/screener.ashx")) {
		formBody!.classList.remove("hidden")
		section?.classList.remove();
	}

}

function favoritesFormHandler() {
	const form = document.getElementById("favoritesForm") as HTMLFormElement;
	form?.addEventListener("submit", async (event) => {
		event.preventDefault();
		const [tab] = await chrome.tabs.query({ active: true });
		const formData = new FormData(form);
		const url = tab.url;
		const screener = String(formData.get("screener"));

		await local.save(screener, url!);

		const input = form.querySelector("#screener") as HTMLInputElement;
		if (input) {
			input.value = ""
		}
		renderList()
	})
}

export async function renderList() {

	const list = document.getElementById("list");
	let screeners = await local.get();

	if (Object.keys(screeners).length !== 0) {
		for (const [k, v] of Object.entries(screeners)) {
			const li = document.createElement("li");
			li.setAttribute("id", `item-${k}`)
			li.classList.add("flex", "gap-3", "items-center")

			const body = `
		<a id="${k}" href="${v}" target="_blank" class="text-lg"> ${k}</a>
		<form id="removeItem-${k}" >
			<input type="hidden" name="screener" value="${k}">
			<button type="submit" id="removeBtn" class="hover:border-red-400"> 🗑️ </button>
		</form>
		`
			li.innerHTML = body
			const existingLi = Array.from(list?.children || []).find((child) =>
				child.textContent?.includes(k)
			);
			if (existingLi) {
				list!.replaceChild(li, existingLi);
			} else {
				list?.appendChild(li);
			}
			removeItem(k);
		}
	} else {
		const empty = `
		<p> The watchlist is empty :( </p>
		<a href="${BASE}" target="_blank"> Go to Finviz Screener</a>
		`
		list!.innerHTML = empty;

		const clearListBtn = document.getElementById("clear_list");
		clearListBtn!.classList.add("hidden")

	}
}

function listClearingHandler() {
	const clearList = document.getElementById("clear_list");
	clearList?.addEventListener("click", () => {

		const confirmation = confirm("The WHOLE list will be wiped, are you sure?!")
		if (confirmation) {
			const list = document.getElementById("list");
			local.clear();
			if (list) {
				list.innerHTML = "";
			}
		}
	})
}

function removeItem(key: string) {
	const removeItem = document.getElementById(`removeItem-${key}`) as HTMLFormElement;
	removeItem?.addEventListener("submit", async (event) => {
		event.preventDefault();

		const formData = new FormData(removeItem);
		const key = String(formData.get("screener"));
		await chrome.storage.local.remove(key);

		const li = document.getElementById(`item-${key}`);
		li!.innerHTML = ""
	});
}

function tickerFormHandler() {
	const tickerForm = document.getElementById("tickerForm") as HTMLFormElement;
	tickerForm?.addEventListener("submit", async (event) => {
		event.preventDefault();
		const formData = new FormData(tickerForm);
		const ticker = String(formData.get("ticker"));
		chrome.tabs.update({ url: "https://finviz.com/quote.ashx?t=" + ticker })
		window.close();
	})
}

/******************************************************** */

(async () => {
	await loadPage();
	renderList();
	tickerFormHandler();
	listClearingHandler();
	favoritesFormHandler();
})();