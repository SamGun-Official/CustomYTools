// ==UserScript==
// @name         YouTube Custom Video Loop
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Loop any custom start/end time range on a video, not just the whole thing.
// @author       SamGun-Official
// @match        https://youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         none
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	const CONTROLS_ID = "yt-custom-loop-controls";
	const MIN_LOOP_DURATION_SECONDS = 3;

	function getVideoElement() {
		return document.getElementsByClassName("video-stream html5-main-video")[0];
	}

	function parseTimeToSeconds(timeString) {
		const stringParts = timeString.split(":");
		const numberParts = stringParts.map((part) => parseInt(part, 10));
		const parsedParts = numberParts.map((num) => (Number.isNaN(num) || num < 0 ? 0 : num));
		while (parsedParts.length < 3) {
			parsedParts.unshift(0);
		}

		const [hours, minutes, seconds] = parsedParts.slice(-3);
		const totalSeconds = hours * 3600 + minutes * 60 + seconds;

		return totalSeconds;
	}

	function buildControls() {
		const startTimeInput = document.createElement("input");
		startTimeInput.type = "text";
		startTimeInput.className = "ctfyt-control-input";
		startTimeInput.value = "00:00:00";
		startTimeInput.placeholder = "00:00:00";
		startTimeInput.title = "Loop start time (HH:MM:SS)";

		const inputSeparator = document.createElement("span");
		inputSeparator.className = "ctfyt-control-separator";
		inputSeparator.textContent = "→";

		const endTimeInput = startTimeInput.cloneNode();
		endTimeInput.title = "Loop end time (HH:MM:SS)";

		const wrapper = document.createElement("div");
		wrapper.id = CONTROLS_ID;
		wrapper.className = "ctfyt-control-group";
		wrapper.append(startTimeInput, inputSeparator, endTimeInput);

		let loopTimer = null;

		function stopLoop() {
			if (loopTimer !== null) {
				clearInterval(loopTimer);
				loopTimer = null;
			}
		}

		function handleRangeChange() {
			const video = getVideoElement();
			if (video === undefined) {
				return;
			}

			const startSeconds = parseTimeToSeconds(startTimeInput.value);
			const endSeconds = parseTimeToSeconds(endTimeInput.value);
			const useVideoEnd = endSeconds === 0 && startSeconds > 0;

			function resolveEndSeconds() {
				return useVideoEnd ? video.duration || Infinity : endSeconds;
			}

			stopLoop();
			if (resolveEndSeconds() - startSeconds < MIN_LOOP_DURATION_SECONDS) {
				return;
			}

			const boundSrc = video.currentSrc;
			loopTimer = setInterval(() => {
				if (!document.body.contains(video) || video.currentSrc !== boundSrc) {
					stopLoop();
					return;
				}
				if (!video.loop) {
					return;
				}
				if (video.currentTime < startSeconds || video.currentTime >= resolveEndSeconds()) {
					video.currentTime = startSeconds;
				}
			}, 100);
		}

		startTimeInput.addEventListener("change", handleRangeChange);
		endTimeInput.addEventListener("change", handleRangeChange);

		return wrapper;
	}

	setInterval(() => {
		if (document.getElementById(CONTROLS_ID) !== null) {
			return;
		}

		const innerSection = window.ctfytGetControlsInnerSection("allow_custom_loop", "Custom Loop");
		if (innerSection === null) {
			return;
		}

		innerSection.appendChild(buildControls());
	}, 100);
})();
