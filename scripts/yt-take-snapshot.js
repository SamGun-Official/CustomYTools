// ==UserScript==
// @name         YouTube Take Frame Snapshot
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Capture and download the current video frame as a PNG with one click.
// @author       SamGun-Official
// @match        https://youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         none
// @grant        none
// ==/UserScript==

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
			console.warn("Unable to capture snapshot for this video:", error);
			return;
		}

		const title = sanitizeFilename(document.title.replace(/ - YouTube$/, "")) || "youtube-video";
		const timestamp = Math.floor(video.currentTime);
		const link = document.createElement("a");
		link.href = dataUrl;
		link.download = `${title}_${timestamp}s.png`;
		link.click();
	}

	function buildControls() {
		const button = document.createElement("button");
		button.id = CONTROLS_ID;
		button.type = "button";
		button.className = "ctfyt-control-button";
		button.title = "Take a snapshot of the current video frame";
		button.setAttribute("aria-label", "Take a snapshot of the current video frame");
		button.textContent = "Take Snapshot";
		button.addEventListener("click", takeSnapshot);

		return button;
	}

	setInterval(() => {
		if (document.getElementById(CONTROLS_ID) !== null) {
			return;
		}

		const innerSection = window.ctfytGetControlsInnerSection("take_video_snapshot", "Video Snapshot");
		if (innerSection === null) {
			return;
		}

		innerSection.appendChild(buildControls());
	}, 100);
})();
