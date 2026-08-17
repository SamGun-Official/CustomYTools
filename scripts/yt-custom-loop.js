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
	const LIVE_STREAM_TITLE = "Custom loop is disabled for live streams";

	function getVideoElement() {
		return document.getElementsByClassName("video-stream html5-main-video")[0];
	}

	function isLiveStream() {
		const player = document.getElementById("movie_player");

		return player !== null && player.getAttribute("data-ctfyt-live") === "true";
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
		startTimeInput.autocomplete = "off";
		startTimeInput.spellcheck = false;
		startTimeInput.setAttribute("autocorrect", "off");
		startTimeInput.setAttribute("autocapitalize", "off");

		const inputSeparator = document.createElement("span");
		inputSeparator.className = "ctfyt-control-separator";
		inputSeparator.textContent = "→";

		const endTimeInput = startTimeInput.cloneNode();
		endTimeInput.title = "Loop end time (HH:MM:SS)";

		const wrapper = document.createElement("div");
		wrapper.id = CONTROLS_ID;
		wrapper.className = "ctfyt-control-group";
		wrapper.append(startTimeInput, inputSeparator, endTimeInput);

		const startTimeDefaultTitle = startTimeInput.title;
		const endTimeDefaultTitle = endTimeInput.title;
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

		function updateLiveLockState() {
			const isLive = isLiveStream();
			if (startTimeInput.disabled === isLive) {
				return;
			}

			startTimeInput.disabled = isLive;
			endTimeInput.disabled = isLive;
			startTimeInput.style.cursor = isLive ? "not-allowed" : "";
			endTimeInput.style.cursor = isLive ? "not-allowed" : "";
			startTimeInput.title = isLive ? LIVE_STREAM_TITLE : startTimeDefaultTitle;
			endTimeInput.title = isLive ? LIVE_STREAM_TITLE : endTimeDefaultTitle;
			if (isLive) {
				stopLoop();
			}
		}

		updateLiveLockState();

		const liveLockTimer = setInterval(() => {
			if (!document.body.contains(wrapper)) {
				clearInterval(liveLockTimer);
				return;
			}

			updateLiveLockState();
		}, 200);

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
