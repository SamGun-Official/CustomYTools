(function () {
	"use strict";

	const SECTION_ID = "ctfyt-controls-section";
	const SECTION_BODY_ID = "ctfyt-controls-section-body";
	const STYLE_ID = "ctfyt-controls-section-style";

	function ensureStylesInjected() {
		if (document.getElementById(STYLE_ID) !== null) {
			return;
		}

		const style = document.createElement("style");
		style.id = STYLE_ID;
		style.textContent = `
			.ctfyt-section {
				--ctfyt-accent: #2dd4bf;
				--ctfyt-accent-ink: #063a35;
				--ctfyt-bg: rgba(0, 0, 0, 0.04);
				--ctfyt-border: rgba(0, 0, 0, 0.1);
				--ctfyt-text-primary: #0f0f0f;
				--ctfyt-text-secondary: #606060;
				--ctfyt-inner-section-bg: rgba(0, 0, 0, 0.05);
				--ctfyt-inner-section-border: rgba(0, 0, 0, 0.12);
				--ctfyt-control-bg: rgba(0, 0, 0, 0.06);
				--ctfyt-control-border: rgba(0, 0, 0, 0.18);
				--ctfyt-control-hover-bg: rgba(0, 0, 0, 0.1);
				container-type: inline-size;
				container-name: ctfyt-section;
				position: relative;
				width: 100%;
				display: flex;
				flex-direction: column;
				gap: 10px;
				padding: 10px 14px;
				background: var(--ctfyt-bg);
				font-family: "Roboto", Arial, sans-serif;
				color: var(--ctfyt-text-primary);
				border: 1px solid var(--ctfyt-border);
				border-left: 3px solid var(--ctfyt-accent);
				border-radius: 12px;
				box-sizing: border-box;
			}

			html[dark] .ctfyt-section {
				--ctfyt-bg: rgba(255, 255, 255, 0.05);
				--ctfyt-border: rgba(255, 255, 255, 0.13);
				--ctfyt-text-primary: #f1f1f1;
				--ctfyt-text-secondary: #aaaaaa;
				--ctfyt-inner-section-bg: rgba(255, 255, 255, 0.06);
				--ctfyt-inner-section-border: rgba(255, 255, 255, 0.14);
				--ctfyt-control-bg: rgba(255, 255, 255, 0.09);
				--ctfyt-control-border: rgba(255, 255, 255, 0.22);
				--ctfyt-control-hover-bg: rgba(255, 255, 255, 0.16);
			}

			.ctfyt-section__header {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.ctfyt-section__badge {
				width: 28px;
				height: 28px;
				display: flex;
				flex-shrink: 0;
				align-items: center;
				justify-content: center;
				background: var(--ctfyt-accent);
				color: var(--ctfyt-accent-ink);
				border-radius: 7px;
			}

			.ctfyt-section__badge svg {
				width: 16px;
				height: 16px;
				fill: currentColor;
			}

			.ctfyt-section__heading {
				min-height: 28px;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				line-height: 1;
			}

			.ctfyt-section__title {
				font-size: 12px;
				font-weight: 700;
				color: var(--ctfyt-text-primary);
				letter-spacing: 0.2px;
			}

			.ctfyt-section__subtitle {
				font-size: 11px;
				color: var(--ctfyt-text-secondary);
			}

			.ctfyt-section__body {
				display: flex;
				flex-wrap: wrap;
				align-items: stretch;
				gap: 8px;
			}

			.ctfyt-inner-section {
				display: flex;
				flex: 1 1 auto;
				flex-direction: column;
				gap: 6px;
				padding: 8px 10px;
				background: var(--ctfyt-inner-section-bg);
				border: 1px solid var(--ctfyt-inner-section-border);
				border-radius: 10px;
			}

			.ctfyt-inner-section__title {
				font-size: 10px;
				font-weight: 700;
				color: var(--ctfyt-text-secondary);
				letter-spacing: 0.5px;
				text-transform: uppercase;
				white-space: nowrap;
			}

			.ctfyt-inner-section__content {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 6px;
			}

			.ctfyt-control-group {
				display: inline-flex;
				align-items: center;
				gap: 6px;
			}

			.ctfyt-control-button {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				padding: 6px 14px;
				background: var(--ctfyt-control-bg);
				font: 500 12px/1 Roboto, Arial, sans-serif;
				color: var(--ctfyt-text-primary);
				border: 1px solid var(--ctfyt-accent);
				border-radius: 18px;
				white-space: nowrap;
				cursor: pointer;
				transition: background-color 0.15s ease;
			}

			.ctfyt-control-button:hover {
				background: var(--ctfyt-control-hover-bg);
			}

			.ctfyt-control-input {
				width: 72px;
				padding: 5px 8px;
				background: var(--ctfyt-control-bg);
				font: 500 12px/1 Roboto, Arial, sans-serif;
				text-align: center;
				color: var(--ctfyt-text-primary);
				border: 1px solid var(--ctfyt-accent);
				border-radius: 8px;
			}

			.ctfyt-control-button:focus,
			.ctfyt-control-input:focus {
				outline: none;
				box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.35);
			}

			.ctfyt-control-separator {
				font-size: 14px;
				color: var(--ctfyt-text-secondary);
				line-height: 1;
			}

			@container ctfyt-section (max-width: 420px) {
				.ctfyt-section__header {
					flex-wrap: wrap;
				}
			}
		`;
		document.head.appendChild(style);
	}

	function buildBadgeIcon() {
		const svgNS = "http://www.w3.org/2000/svg";
		const path = document.createElementNS(svgNS, "path");
		path.setAttribute(
			"d",
			"M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z",
		);

		const svg = document.createElementNS(svgNS, "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		svg.appendChild(path);

		return svg;
	}

	function buildSection() {
		const badge = document.createElement("div");
		badge.className = "ctfyt-section__badge";
		badge.appendChild(buildBadgeIcon());

		const title = document.createElement("span");
		title.className = "ctfyt-section__title";
		title.textContent = "CustomTools for YouTube™";

		const subtitle = document.createElement("span");
		subtitle.className = "ctfyt-section__subtitle";
		subtitle.textContent = "Controls from this extension are available here";

		const heading = document.createElement("div");
		heading.className = "ctfyt-section__heading";
		heading.append(title, subtitle);

		const header = document.createElement("div");
		header.className = "ctfyt-section__header";
		header.append(badge, heading);

		const body = document.createElement("div");
		body.id = SECTION_BODY_ID;
		body.className = "ctfyt-section__body";

		const section = document.createElement("div");
		section.id = SECTION_ID;
		section.className = "ctfyt-section";
		section.append(header, body);

		return section;
	}

	function buildInnerSection(title) {
		const titleElement = document.createElement("span");
		titleElement.className = "ctfyt-inner-section__title";
		titleElement.textContent = title;

		const content = document.createElement("div");
		content.className = "ctfyt-inner-section__content";

		const innerSection = document.createElement("div");
		innerSection.className = "ctfyt-inner-section";
		innerSection.append(titleElement, content);

		return innerSection;
	}

	window.ctfytGetControlsInnerSection = function (id, title) {
		const middleRow = document.querySelector("ytd-watch-metadata #middle-row");
		if (middleRow === null) {
			return null;
		}

		ensureStylesInjected();
		if (document.getElementById(SECTION_ID) === null) {
			middleRow.appendChild(buildSection());
		}

		const innerSectionId = `ctfyt-inner-section-${id}`;
		let innerSection = document.getElementById(innerSectionId);
		if (innerSection === null) {
			innerSection = buildInnerSection(title);
			innerSection.id = innerSectionId;
			document.getElementById(SECTION_BODY_ID).appendChild(innerSection);
		}

		return innerSection.querySelector(".ctfyt-inner-section__content");
	};
})();
