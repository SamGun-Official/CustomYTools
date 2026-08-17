// ==UserScript==
// @name         YouTube Fix Memory Leaks
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Removes the chat panel from YouTube to prevent memory leaks and improve performance.
// @author       SamGun-Official
// @match        https://youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         none
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	// Note that this is a temporary solution to prevent memory leaks from the YouTube chat panel.
	// Permanent solution will be implemented in the future, but this is a quick fix for now.
	let refreshInterval = setInterval(() => {
		const chatContainer = document.getElementById("chat-container");
		if (chatContainer && chatContainer.firstElementChild != null) {
			const panel = document.getElementById("panels-full-bleed-container");
			if (panel) {
				panel.style.display = "none";
			}

			chatContainer.firstElementChild.remove();
			clearInterval(refreshInterval);
		}
	}, 100);
})();
