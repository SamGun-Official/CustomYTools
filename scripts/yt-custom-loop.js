(function () {
	"use strict";

	const CONTROLS_ID = "yt-custom-loop-controls";

	function parseTimeToSeconds(timeStr) {
		const parts = timeStr
			.split(":")
			.map((part) => parseInt(part, 10))
			.map((num) => (Number.isNaN(num) || num < 0 ? 0 : num));
		while (parts.length < 3) {
			parts.unshift(0);
		}

		const [hrs, mins, secs] = parts.slice(-3);

		return hrs * 3600 + mins * 60 + secs;
	}

	function getVideoElement() {
		return document.getElementsByClassName("video-stream html5-main-video")[0];
	}

	function buildControls() {
		const wrapper = document.createElement("div");
		wrapper.id = CONTROLS_ID;
		wrapper.style.display = "flex";
		wrapper.style.alignItems = "center";
		wrapper.style.gap = "4px";
		wrapper.style.marginRight = "8px";

		const startInput = document.createElement("input");
		startInput.type = "text";
		startInput.value = "00:00:00";
		startInput.placeholder = "00:00:00";
		startInput.size = 8;
		startInput.title = "Loop start time (HH:MM:SS)";
		startInput.style.width = "72px";
		startInput.style.textAlign = "center";
		startInput.style.borderRadius = "8px";
		startInput.style.border = "1px solid rgba(255, 255, 255, 0.2)";
		startInput.style.background = "transparent";
		startInput.style.color = "inherit";
		startInput.style.font = "inherit";
		startInput.style.padding = "4px";

		const separator = document.createElement("span");
		separator.textContent = "→";

		const endInput = startInput.cloneNode();
		endInput.title = "Loop end time (HH:MM:SS)";

		wrapper.append(startInput, separator, endInput);

		let loopTimer = null;

		function stopLoop() {
			if (loopTimer !== null) {
				clearInterval(loopTimer);
				loopTimer = null;
			}
		}

		const MIN_LOOP_DURATION_SECONDS = 3;

		function handleRangeChange() {
			const video = getVideoElement();
			if (video === undefined) {
				return;
			}

			const startSeconds = parseTimeToSeconds(startInput.value);
			const endSeconds = parseTimeToSeconds(endInput.value);
			// End left at its default (00:00:00) while a start was set means "loop until the video's actual end".
			const useVideoEnd = endSeconds === 0 && startSeconds > 0;

			function resolveEndSeconds() {
				return useVideoEnd ? video.duration || Infinity : endSeconds;
			}

			stopLoop();

			if (resolveEndSeconds() - startSeconds < MIN_LOOP_DURATION_SECONDS) {
				return;
			}

			// YouTube reuses the same <video> element across SPA video-to-video navigation (only its
			// source changes), so a source mismatch — not just DOM detachment — means "this is a different video now".
			const boundSrc = video.currentSrc;

			loopTimer = setInterval(() => {
				if (!document.body.contains(video) || video.currentSrc !== boundSrc) {
					stopLoop();
					return;
				}
				// Only enforce the range while the player's own Loop mode (right-click > Loop) is on.
				if (!video.loop) {
					return;
				}
				const resolvedEnd = resolveEndSeconds();
				if (video.currentTime < startSeconds || video.currentTime >= resolvedEnd) {
					video.currentTime = startSeconds;
				}
			}, 100);
		}

		startInput.addEventListener("change", handleRangeChange);
		endInput.addEventListener("change", handleRangeChange);

		return wrapper;
	}

	function injectControls() {
		if (document.getElementById(CONTROLS_ID) !== null) {
			return;
		}

		const topLevelButtons = document.querySelector("ytd-menu-renderer.ytd-watch-metadata #top-level-buttons-computed");
		if (topLevelButtons === null) {
			return;
		}

		topLevelButtons.insertBefore(buildControls(), topLevelButtons.firstChild);
	}

	// Kept running (not cleared) since YouTube re-renders #top-level-buttons-computed on SPA video-to-video navigation, removing our controls.
	setInterval(injectControls, 100);

	// Previous placeholder implementation, kept for rollback reference:
	// let intervalId = null;
	//
	// function startTimer() {
	// 	if (intervalId) {
	// 		clearInterval(intervalId);
	// 	}
	// 	intervalId = setInterval(() => {
	// 		console.log("Timer running in isolated world...");
	// 		// Logika Anda (misal: deteksi shorts)
	// 	}, 100);
	// }
	//
	// startTimer();
	//
	// chrome.runtime.onMessage.addListener((message) => {
	// 	if (message.type === "RESTART_TIMER") {
	// 		startTimer();
	// 	}
	//
	// 	return true;
	// });
})();
