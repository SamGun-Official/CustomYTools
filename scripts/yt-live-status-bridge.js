(function () {
	"use strict";

	const LIVE_ATTRIBUTE = "data-ctfyt-live";

	function pollLiveStatus() {
		const player = document.getElementById("movie_player");
		if (player === null || typeof player.getVideoData !== "function") {
			return;
		}

		let isLive = false;
		try {
			isLive = Boolean(player.getVideoData().isLive);
		} catch (error) {
			isLive = false;
		}

		const isLiveString = String(isLive);
		if (player.getAttribute(LIVE_ATTRIBUTE) !== isLiveString) {
			player.setAttribute(LIVE_ATTRIBUTE, isLiveString);
		}
	}

	setInterval(pollLiveStatus, 100);
})();
