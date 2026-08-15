function populateFeatures(isValidTargetTab, featureList) {
	const wrapper = document.getElementById("wrapper");
	const options = document.getElementById("options");
	const dummyLi = document.querySelector("li:has(#dummy)");
	featureList.forEach((feature, index) => {
		const li = dummyLi.cloneNode(true);
		li.querySelector("label").setAttribute("for", feature.slug);
		li.querySelector("span").textContent = `${index + 1}.  ${feature.name}`;

		const input = li.querySelector("input");
		input.name = input.id = feature.slug;
		input.dataset.locked = feature.locked || !isValidTargetTab ? "true" : "false";
		input.addEventListener("change", function () {
			const toggleLastState = this.checked;
			wrapper.inert = true;
			chrome.runtime.sendMessage({ action: "TOGGLE_FEATURE", slug: feature.slug }, (response) => {
				if (response.error) {
					input.checked = toggleLastState;
				}

				wrapper.inert = false;
			});
		});
		if (!feature.locked && isValidTargetTab) {
			input.removeAttribute("disabled");
		}
		if (feature.active && isValidTargetTab) {
			input.checked = true;
		}

		options.appendChild(li);
	});
	if (featureList.length > 0) {
		dummyLi.remove();
	}
}

function getExtensionState() {
	chrome.runtime.sendMessage({ action: "GET_EXTENSION_STATE" }, (response) => {
		if (response.error) {
			return;
		}

		const statusText = document.querySelector("#info_detail");
		const isValidTargetTab = response.isValidTargetTab;
		if (isValidTargetTab) {
			statusText.textContent = "YouTube";
			statusText.classList.remove("!text-warning");
			document.getElementById("options").classList.remove("line-through");
			document.querySelectorAll(".form-control").forEach((element) => element.classList.remove("!bg-warning-content"));
		} else {
			statusText.textContent = "Not YouTube";
			statusText.classList.add("!text-warning");
			document.getElementById("options").classList.add("line-through");
			document.querySelectorAll(".form-control").forEach((element) => element.classList.add("!bg-warning-content"));
		}

		const featureList = response.featureList;
		if (Array.isArray(featureList) && document.getElementById("dummy") !== null) {
			populateFeatures(isValidTargetTab, featureList);
		}

		const isNewerVersion = response.isNewerVersion;
		const downloadNotifier = document.getElementById("download_notifier");
		if (isNewerVersion) {
			downloadNotifier.dataset.updateAvailable = isNewerVersion;
			downloadNotifier.href = downloadNotifier.title = response.latestNotifiedUrl;
			downloadNotifier.querySelector("span").textContent = `v${response.latestNotifiedVersion}`;
			downloadNotifier.classList.remove("hidden");
		} else {
			downloadNotifier.classList.add("hidden");
		}

		document.getElementById("extension_version").textContent = `v${response.manifestVersion}`;
	});
}

document.addEventListener("DOMContentLoaded", () => {
	getExtensionState();

	document.getElementById("check_for_updates").addEventListener("click", () => {
		chrome.runtime.sendMessage({ action: "CHECK_FOR_UPDATES" }, (response) => {
			if (response.error) {
				return;
			}

			getExtensionState();
		});
	});
});
