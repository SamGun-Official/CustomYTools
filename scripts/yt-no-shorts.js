// ==UserScript==
// @name         YouTube Shorts (No Loop)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Rewrite "Shorts" URL into traditional watch URL.
// @author       SamGun-Official
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://www.dropmedia.co.uk/wp-content/uploads/2023/07/youtube-shorts6078.jpg
// @grant        none
// ==/UserScript==

// (function () {
// 	"use strict";

// 	let refreshInterval = setInterval(() => {
// 		const regexPattern = /^.*\/shorts\/([a-zA-Z0-9_-]+).*$/;
// 		const shortsURL = window.location.href;
// 		const matchResult = shortsURL.match(regexPattern);
// 		if (matchResult) {
// 			const videoID = matchResult[1];
// 			const watchURL = `https://www.youtube.com/watch?v=${videoID}`;
// 			window.history.back();
// 			window.location.href = watchURL;
// 			clearInterval(refreshInterval);
// 		}
// 	}, 100);
// })();

// Fungsi utama yang akan diekspor
function main() {
	"use strict";

	let refreshInterval = setInterval(() => {
		const regexPattern = /^.*\/shorts\/([a-zA-Z0-9_-]+).*$/;
		const shortsURL = window.location.href;
		const matchResult = shortsURL.match(regexPattern);

		if (matchResult) {
			const videoID = matchResult[1];
			const watchURL = `https://www.youtube.com/watch?v=${videoID}`;
			window.history.back();
			window.location.href = watchURL;
			clearInterval(refreshInterval);
		}
	}, 100);
}

// Ekspor fungsi utama agar bisa diimport
export { main };
