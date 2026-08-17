// ==UserScript==
// @name         YouTube Redirect Shorts
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically redirects Shorts links to the regular watch page.
// @author       SamGun-Official
// @match        https://youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         none
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	let refreshInterval = setInterval(() => {
		const regexPattern = /^.*\/shorts\/([a-zA-Z0-9_-]+).*$/;
		const matchResults = window.location.href.match(regexPattern);
		if (matchResults) {
			const videoId = matchResults[1];
			const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
			window.location.replace(watchUrl);
			clearInterval(refreshInterval);
		}
	}, 100);
})();
