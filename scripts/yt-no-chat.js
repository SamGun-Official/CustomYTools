// ==UserScript==
// @name         Fix YouTube Memory Leaks
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  A script to (possibly) reduce memory consumption and fix memory leaks from e.g. YouTube Streaming Live Chat.
// @author       SamGun-Official
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// ==/UserScript==

// To Do: Add channel whitelist
(function () {
	"use strict";

	// Superseded by the capped pruning below (removed the whole chat frame once, fully disabling chat instead of just bounding its memory use):
	let refreshInterval = setInterval(() => {
		const chatContainer = document.getElementById("chat-container");
		if (chatContainer && chatContainer.firstElementChild != null) {
			chatContainer.firstElementChild.remove();
			clearInterval(refreshInterval);
		}
	}, 100);

	// const MAX_CHAT_ITEMS = 150;
	// let itemsContainer = null;

	// // Superseded: assumed the chat iframe's internal renderers (#items etc.) sat behind
	// // native shadow roots, so it walked element.shadowRoot recursively to find them.
	// // A captured DOM dump (yt-cht-tmp.html) showed <!--css-build:shady--> markers and
	// // class="style-scope ..." throughout, meaning YouTube's live chat runs Polymer in
	// // Shady DOM mode - everything is flattened into regular light DOM. element.shadowRoot
	// // is therefore null the whole way down, so this never found #items and pruned nothing.
	// // function deepQuerySelector(root, selector) {
	// // 	if (!root) {
	// // 		return null;
	// // 	}
	// //
	// // 	const direct = root.querySelector?.(selector);
	// // 	if (direct) {
	// // 		return direct;
	// // 	}
	// //
	// // 	for (const el of root.querySelectorAll?.("*") ?? []) {
	// // 		if (el.shadowRoot) {
	// // 			const found = deepQuerySelector(el.shadowRoot, selector);
	// // 			if (found) {
	// // 				return found;
	// // 			}
	// // 		}
	// // 	}
	// //
	// // 	return null;
	// // }
	// //
	// // function resolveChatItemsContainer() {
	// // 	try {
	// // 		const chatContainer = document.getElementById("chat-container");
	// // 		if (!chatContainer) {
	// // 			return null;
	// // 		}
	// //
	// // 		const chatFrame = deepQuerySelector(chatContainer, "iframe#chatframe") ?? deepQuerySelector(chatContainer, 'iframe[src*="live_chat"]');
	// // 		const chatDocument = chatFrame?.contentDocument;
	// // 		if (!chatDocument) {
	// // 			return null;
	// // 		}
	// //
	// // 		return deepQuerySelector(chatDocument, "#items");
	// // 	} catch {
	// // 		return null;
	// // 	}
	// // }

	// // The chat iframe (same-origin, so contentDocument is reachable) is the only real
	// // document boundary here - everything inside it, down to #items, is plain light DOM
	// // (per yt-cht-tmp.html), so a normal querySelector/getElementById chain reaches it.
	// function resolveChatItemsContainer() {
	// 	try {
	// 		const chatFrame = document.querySelector("#chat-container iframe#chatframe") ?? document.querySelector('#chat-container iframe[src*="live_chat"]');
	// 		const chatDocument = chatFrame?.contentDocument;
	// 		if (!chatDocument) {
	// 			return null;
	// 		}

	// 		return chatDocument.getElementById("items");
	// 	} catch {
	// 		return null;
	// 	}
	// }

	// // Instead of deleting the chat frame outright, keep chat live but cap how many
	// // message nodes stay in the DOM, so a fast-flowing stream (e.g. a raided/large
	// // livestream chat) can't keep accumulating nodes and slowing the tab down.
	// setInterval(() => {
	// 	if (!itemsContainer || !itemsContainer.isConnected) {
	// 		itemsContainer = resolveChatItemsContainer();
	// 	}
	// 	if (!itemsContainer) {
	// 		return;
	// 	}

	// 	while (itemsContainer.childElementCount > MAX_CHAT_ITEMS) {
	// 		itemsContainer.firstElementChild.remove();
	// 	}
	// }, 100);
})();
