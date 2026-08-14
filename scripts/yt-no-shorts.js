// ==UserScript==
// @name         YouTube Shorts (No Loop)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically redirect "Shorts" videos to the normal YouTube player.
// @author       SamGun-Official
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://www.dropmedia.co.uk/wp-content/uploads/2023/07/youtube-shorts6078.jpg
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
