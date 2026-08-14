/**
 * @TODO
 * - Use inline player as an alternative instead using PiP
 */

(function () {
	"use strict";

	function getVideoElement() {
		return document.getElementsByClassName("video-stream html5-main-video")[0];
	}

	// Tracks whether the currently active PiP window was opened by this script (vs. the user
	// opening it manually via the native "I" button), so scrolling back into view only closes
	// PiP windows we opened ourselves.
	let autoTriggered = false;
	let observedVideo = null;
	let observer = null;
	// Whether the last intersection reading found the video out of view, kept separate from the
	// observer callback so the gesture retry below (see pipRequestPending) can re-check it later.
	let videoOutOfView = false;
	// requestPictureInPicture() needs a recent "qualifying" user gesture (click/keydown — scroll
	// does not reliably count in Chrome), so a request made right as the video scrolls out of view
	// can be silently rejected once that gesture has aged out. When that happens this stays true
	// until the next qualifying gesture retries it, instead of only getting one attempt tied to scroll.
	let pipRequestPending = false;

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

	// click/keydown are activation-triggering gestures per spec (unlike scroll/wheel), so retrying
	// from inside one of these reliably succeeds even after the original scroll-driven attempt was rejected.
	document.addEventListener("click", retryPendingPip, true);
	document.addEventListener("keydown", retryPendingPip, true);

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

	// Polled (not one-shot) since the <video> element may not exist yet on initial load, and to
	// re-attach if YouTube ever swaps it out for a different element.
	setInterval(() => {
		const video = getVideoElement();
		if (video !== undefined && video !== observedVideo) {
			attachObserver(video);
		}
	}, 100);
})();
