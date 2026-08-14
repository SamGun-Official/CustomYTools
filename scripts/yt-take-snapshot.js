(function () {
	"use strict";

	const CONTROLS_ID = "yt-take-snapshot-controls";

	function getVideoElement() {
		return document.getElementsByClassName("video-stream html5-main-video")[0];
	}

	function sanitizeFilename(name) {
		return name.replace(/[\\/:*?"<>|]/g, "_").trim();
	}

	function takeSnapshot() {
		const video = getVideoElement();
		if (!video || video.readyState < 2) {
			return;
		}

		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

		let dataUrl;
		try {
			dataUrl = canvas.toDataURL("image/png");
		} catch (error) {
			// Canvas comes back tainted for DRM-protected videos (EME), which blocks pixel readout — nothing more to do here.
			console.warn("[CustomYTools] Unable to capture snapshot for this video:", error);
			return;
		}

		const title = sanitizeFilename(document.title.replace(/ - YouTube$/, "")) || "youtube-video";
		const timestamp = Math.floor(video.currentTime);

		const link = document.createElement("a");
		link.href = dataUrl;
		link.download = `${title}_${timestamp}s.png`;
		link.click();
	}

	function buildButton() {
		const button = document.createElement("button");
		button.id = CONTROLS_ID;
		button.type = "button";
		button.textContent = "SS";
		button.title = "Take a snapshot of the current video frame";
		button.style.marginRight = "8px";
		button.style.padding = "4px 10px";
		button.style.borderRadius = "8px";
		button.style.border = "1px solid rgba(255, 255, 255, 0.2)";
		button.style.background = "transparent";
		button.style.color = "inherit";
		button.style.font = "inherit";
		button.style.fontWeight = "bold";
		button.style.cursor = "pointer";

		button.addEventListener("click", takeSnapshot);

		return button;
	}

	function injectButton() {
		if (document.getElementById(CONTROLS_ID) !== null) {
			return;
		}

		const topLevelButtons = document.querySelector("ytd-menu-renderer.ytd-watch-metadata #top-level-buttons-computed");
		if (topLevelButtons === null) {
			return;
		}

		// Sit right next to the custom loop's start time input when that feature is also on, otherwise take its usual spot.
		const loopControls = document.getElementById("yt-custom-loop-controls");
		if (loopControls !== null) {
			loopControls.insertAdjacentElement("afterend", buildButton());
		} else {
			topLevelButtons.insertBefore(buildButton(), topLevelButtons.firstChild);
		}
	}

	// Kept running (not cleared) since YouTube re-renders #top-level-buttons-computed on SPA video-to-video navigation, removing our button.
	setInterval(injectButton, 100);
})();
