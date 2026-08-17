// ==UserScript==
// @name         YouTube Clean UI
// @namespace    http://tampermonkey.net/
// @version      2.3.10
// @description  Strips out ads and clutter from the page for a cleaner viewing experience.
// @author       SamGun-Official
// @match        https://youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         none
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	function removeAdElement(selector) {
		const ad = document.querySelector(selector);
		if (ad) {
			ad.remove();
		}
	}

	let ogVolume = 1;
	let pbRate = 1;
	let preventSkip = false;
	const scriptTimer = setInterval(() => {
		document.querySelectorAll(".ytp-ad-overlay-close-button").forEach((button) => button.click());
		removeAdElement("#masthead-ad"); // Header Ad
		removeAdElement(".style-scope.ytd-watch-next-secondary-results-renderer.sparkles-light-cta.GoogleActiveViewElement"); // Side Ad 1
		removeAdElement(".style-scope.ytd-item-section-renderer.sparkles-light-cta"); // Side Ad 2
		removeAdElement(".style-scope.ytd-companion-slot-renderer"); // Companion Ad
		removeAdElement(".ytp-ad-message-container"); // Incoming Ad
		removeAdElement("ytd-ad-slot-renderer"); // Right Side Ad
		removeAdElement("ytd-reel-shelf-renderer"); // Right Side Shorts

		const vid = document.querySelector(".video-stream.html5-main-video");
		const ad = document.querySelector(".video-ads.ytp-ad-module");
		if (!vid) {
			return;
		}
		if (!ad) {
			pbRate = vid.playbackRate;
		}
		if (ad && ad.children.length > 0 && document.querySelector(".ytp-ad-text[class*='ytp-ad-preview-text']") !== undefined) {
			vid.playbackRate = 16;
			vid.muted = true;
		}

		const skipButton = document.querySelector(".ytp-skip-ad-button");
		if (skipButton) {
			skipButton.click();
		}

		const sidePanel = document.getElementById("panels");
		if (sidePanel) {
			for (const section of sidePanel.children) {
				if (section.targetId === "engagement-panel-ads") {
					section.style.display = "none";
				}
			}
		}
		if (document.querySelector("ytd-enforcement-message-view-model")) {
			location.reload();
			clearInterval(scriptTimer);
		}
		if (document.querySelector(".html5-video-player.ad-created")) {
			const navigationDownButton = document.querySelector(".navigation-container.style-scope.ytd-shorts #navigation-button-down button");
			if (!preventSkip && navigationDownButton) {
				navigationDownButton.click();
				preventSkip = true;
				setTimeout(() => (preventSkip = false), 3000);
			}
		}
	}, 100);
})();
