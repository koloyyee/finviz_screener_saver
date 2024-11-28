import './style.css';
import { BASE, local } from "./utils";


const [tab] = await chrome.tabs.query({ active: true });

function loadPage() {
	const formBody = document.getElementById("saveFavorites");
	const section = document.querySelector("section");

	formBody?.classList.add("hidden");
	section?.classList.add("h-[3rem]", "p-3")
	if (tab.url?.includes("https://finviz.com/screener.ashx")) {
		formBody!.classList.toggle("hidden")
	}
	formBody?.classList.add("h-[3rem]", "flex", "flex-col");
}

const form = document.getElementById("saveFavorites");
form?.addEventListener("submit", async (event) => {
	event.preventDefault();
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

export async function renderList() {

	const list = document.getElementById("list");
	let screeners = await local.get();

	if (Object.keys(screeners).length !== 0) {
		for (const [k, v] of Object.entries(screeners)) {
			const li = document.createElement("li");
			li.setAttribute("id", `item-${k}`)
			const body = `
		<a id="${k}" href="${v}" target="_blank"> ${k}</a>
		<form id="removeItem-${k}" >
			<input type="hidden" name="screener" value="${k}">
			<button type="submit" id="removeBtn"> - </button>
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
		const emptyList = document.createElement("p")
		emptyList.innerText = "The watchlist is empty :("
		list?.appendChild(emptyList)
		const clearListBtn = document.getElementById("clear_list");
		clearListBtn!.classList.add("hidden")

		const finvizLink = document.createElement("a")
		finvizLink.setAttribute("href", BASE)
		finvizLink.setAttribute("target" , "_blank")
		finvizLink.innerText = "Go to Finviz Screener"
		emptyList.insertAdjacentElement("afterend",finvizLink )
	}
}

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


/******************************************************** */
loadPage();
renderList();