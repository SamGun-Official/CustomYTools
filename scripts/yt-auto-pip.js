// ==UserScript==
// @name         YouTube Auto Picture-in-Picture (PiP)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automatically pops the video into Picture-in-Picture when scrolled away, and restores it when scrolled back.
// @author       SamGun-Official
// @match        https://youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         none
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	let autoTriggered = false;
	let observedVideo = null;
	let observer = null;
	let videoOutOfView = false;
	let pipRequestPending = false;

	function getVideoElement() {
		return document.getElementsByClassName("video-stream html5-main-video")[0];
	}

	function attemptEnterPip(video) {
		video
			.requestPictureInPicture()
			.then(() => {
				autoTriggered = true;
				pipRequestPending = false;
			})
			.catch(() => {
				pipRequestPending = true;
			});
	}

	function handleIntersection(entries) {
		const entry = entries[0];
		const video = observedVideo;
		if (video === undefined || video === null) {
			return;
		}

		videoOutOfView = !entry.isIntersecting;
		if (videoOutOfView) {
			if (!video.paused && document.pictureInPictureElement !== video) {
				attemptEnterPip(video);
			}
		} else {
			pipRequestPending = false;
			if (document.pictureInPictureElement === video && autoTriggered) {
				document
					.exitPictureInPicture()
					.then(() => {
						autoTriggered = false;
					})
					.catch(() => {});
			}
		}
	}

	function retryPendingPip() {
		const video = observedVideo;
		if (!pipRequestPending || !videoOutOfView || video === undefined || video === null) {
			return;
		}
		if (video.paused || document.pictureInPictureElement === video) {
			pipRequestPending = false;
			return;
		}

		attemptEnterPip(video);
	}

	function attachObserver(video) {
		if (observer !== null) {
			observer.disconnect();
		}

		observedVideo = video;
		observer = new IntersectionObserver(handleIntersection, { threshold: 0 });
		observer.observe(video);
		video.addEventListener("leavepictureinpicture", () => {
			autoTriggered = false;
		});
	}

	document.addEventListener("click", retryPendingPip, true);
	document.addEventListener("keydown", retryPendingPip, true);

	setInterval(() => {
		const video = getVideoElement();
		if (video !== undefined && video !== observedVideo) {
			attachObserver(video);
		}
	}, 100);
})();
