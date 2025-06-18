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

	let refreshInterval = setInterval(() => {
		const chatContainer = document.getElementById("chat-container").firstElementChild;
		if (chatContainer != null) {
			chatContainer.remove();
			clearInterval(refreshInterval);
		}
	}, 100);
})();
