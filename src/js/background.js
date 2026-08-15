const MANIFEST = "https://samgun-official.my.id/ext-updates/CustomYTools/version.json";
const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|m\.youtube\.com|youtu\.be)(\/.*)?$/;
const DATA_KEY = "featureList";

async function loadDefaultConfig() {
	return fetch(chrome.runtime.getURL("config.json")).then((response) => response.json());
}

function checkAvailableFeatures(storedFeatures, defaultFeatures) {
	return defaultFeatures.map((df) => new Map((storedFeatures ?? []).map((sf) => [sf.slug, sf])).get(df.slug) ?? df);
}

function setDataToStorage(data, callbackFn = () => {}) {
	chrome.storage.local.set({ ...data }, () => {
		if (chrome.runtime.lastError) {
			callbackFn({ error: chrome.runtime.lastError });
			return;
		}

		callbackFn(data);
	});
}

function getDataFromStorage(callbackFn) {
	loadDefaultConfig().then((defaultConfig) => {
		chrome.storage.local.get(null, (data) => {
			if (chrome.runtime.lastError) {
				callbackFn({ error: chrome.runtime.lastError });
				return;
			}

			const defaultDataKeys = Object.keys(defaultConfig);
			const unusedDataKeys = Object.keys(data).filter((key) => !defaultDataKeys.includes(key));
			const dataStorage = {};
			for (const dataKey of defaultDataKeys) {
				dataStorage[dataKey] = data[dataKey] ?? defaultConfig[dataKey];
				if (dataKey === DATA_KEY) {
					dataStorage[DATA_KEY] = checkAvailableFeatures(data[dataKey], defaultConfig[dataKey]);
				}
			}

			setDataToStorage(dataStorage, (update) => {
				if (update.error) {
					callbackFn({ error: update.error });
					return;
				}

				chrome.storage.local.remove(unusedDataKeys, () => {
					if (chrome.runtime.lastError) {
						callbackFn({ error: chrome.runtime.lastError });
						return;
					}

					callbackFn(update);
				});
			});
		});
	});
}

function getExtensionState(callbackFn) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (chrome.runtime.lastError) {
			callbackFn({ error: chrome.runtime.lastError });
			return;
		}

		getDataFromStorage((data) => {
			const manifestVersion = chrome.runtime.getManifest().version;
			const defaultResponse = {
				...data,
				tab: tabs[0],
				manifestVersion,
				isValidTargetTab: false,
				isNewerVersion: isNewerVersion(data.latestNotifiedVersion, manifestVersion),
			};
			if (data.error || !YT_REGEX.test(defaultResponse.tab?.url || "")) {
				callbackFn(defaultResponse);
				return;
			}

			callbackFn({ ...defaultResponse, isValidTargetTab: true });
		});
	});
}

function toggleFeature(slug, callbackFn) {
	getExtensionState((data) => {
		if (data.error || !data.isValidTargetTab) {
			callbackFn(data);
			return;
		}

		const feature = data.featureList.find((item) => item.slug === slug);
		if (feature && !feature.locked) {
			feature.active = !feature.active;
		}

		setDataToStorage(data, (update) => {
			if (update.error) {
				callbackFn({ error: update.error });
				return;
			}

			chrome.tabs.reload(update.tab.id, () => {
				if (chrome.runtime.lastError) {
					callbackFn({ error: chrome.runtime.lastError });
					return;
				}

				callbackFn(update);
			});
		});
	});
}

function isNewerVersion(latestVersion, currentVersion) {
	const latest = latestVersion.split(".").map(Number);
	const current = currentVersion.split(".").map(Number);
	for (let index = 0; index < Math.max(latest.length, current.length); index++) {
		if ((latest[index] || 0) > (current[index] || 0)) {
			return true;
		}
		if ((latest[index] || 0) < (current[index] || 0)) {
			return false;
		}
	}

	return false;
}

async function getExtensionInfo() {
	const extensionInfo = chrome.runtime.getManifest();
	const iconPath = extensionInfo.icons["128"];
	const response = await fetch(chrome.runtime.getURL(iconPath));
	const buffer = await response.arrayBuffer();
	let binary = "";
	for (const byte of new Uint8Array(buffer)) {
		binary += String.fromCharCode(byte);
	}

	return {
		extensionName: extensionInfo.name,
		extensionVersion: extensionInfo.version,
		extensionIcon: `data:${response.headers.get("content-type") || "image/png"};base64,${btoa(binary)}`,
	};
}

function showUpdateNotice(newerVersion, downloadUrl, extensionInfo) {
	const noticeId = "cyt-update-notice";
	if (document.getElementById(noticeId)) {
		return;
	}

	const iconImg = document.createElement("img");
	iconImg.src = extensionInfo.extensionIcon;
	iconImg.style.cssText = "width: 16px; height: 16px; vertical-align: middle;";

	const notifierTitle = document.createElement("div");
	notifierTitle.style.cssText = "font: 16px/1 Roboto, Arial, sans-serif; font-weight: bold;";
	notifierTitle.textContent = `${extensionInfo.extensionName} - v${extensionInfo.extensionVersion}`;

	const containerHeader = document.createElement("div");
	containerHeader.style.cssText = "display: flex; align-items: center; column-gap: 8px;";
	containerHeader.append(iconImg, notifierTitle);

	const noticeContainer = document.createElement("div");
	const closeButton = document.createElement("span");
	closeButton.style.cssText = "float: right; font: 16px/1 Roboto, Arial, sans-serif; font-weight: bold; cursor: pointer;";
	closeButton.textContent = "×";
	closeButton.addEventListener("click", () => noticeContainer.remove());

	const noticeHeader = document.createElement("div");
	noticeHeader.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;";
	noticeHeader.append(containerHeader, closeButton);

	const sourceLink = document.createElement("a");
	sourceLink.href = sourceLink.title = downloadUrl;
	sourceLink.target = "_blank";
	sourceLink.rel = "noopener noreferrer";
	sourceLink.style.cssText = "display: block; color: #3ea6ff; text-decoration: none;";
	sourceLink.textContent = `A new update v${newerVersion} is available! Click here to download from the source.`;

	const noticeContainerStyle = "position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; max-width: 320px; padding: 12px 16px; background: #212121; color: #ffffff; font: 14px/1.4 Roboto, Arial, sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); user-select: none;";
	noticeContainer.id = noticeId;
	noticeContainer.style.cssText = noticeContainerStyle;
	noticeContainer.append(noticeHeader, sourceLink);
	document.body.appendChild(noticeContainer);
}

function prepareUpdateNotice(tabId, url) {
	const updateNoticeSessionKey = "updateNotificationShown";
	if (!YT_REGEX.test(url || "")) {
		return;
	}

	chrome.storage.session.get(updateNoticeSessionKey, (session) => {
		if (session[updateNoticeSessionKey]) {
			return;
		}

		getDataFromStorage((data) => {
			if (data.error || !isNewerVersion(data.latestNotifiedVersion, data.currentVersion)) {
				return;
			}

			chrome.storage.session.set({ [updateNoticeSessionKey]: true });
			getExtensionInfo().then((extensionInfo) => {
				chrome.scripting.executeScript({
					target: { tabId },
					func: showUpdateNotice,
					args: [data.latestNotifiedVersion, data.latestNotifiedUrl, extensionInfo],
				});
			});
		});
	});
}

function checkForUpdates(callbackFn = () => {}) {
	getDataFromStorage(async (data) => {
		if (data.error) {
			callbackFn({ error: data.error });
			return;
		}

		const fetchedResponse = await fetch(MANIFEST, { cache: "no-cache" });
		if (!fetchedResponse.ok) {
			callbackFn({ error: "Cannot fetch version data from the source." });
			return;
		}

		const fetchedManifest = await fetchedResponse.json();
		const extensionManifest = chrome.runtime.getManifest();
		const latestVersion = fetchedManifest.version;
		const currentVersion = extensionManifest.version;
		const dataStorage = { ...data, currentVersion, latestNotifiedVersion: latestVersion, latestNotifiedUrl: fetchedManifest.download_url };
		setDataToStorage(dataStorage, (update) => {
			if (update.error) {
				callbackFn({ error: update.error });
				return;
			}
			if (isNewerVersion(latestVersion, currentVersion)) {
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					if (tabs[0]) {
						prepareUpdateNotice(tabs[0].id, tabs[0].url);
					}
				});
			}

			callbackFn(update);
		});
	});
}

chrome.alarms.create("update-check", { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(() => checkForUpdates());
chrome.runtime.onInstalled.addListener(() => checkForUpdates());
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
	if (message.action === "GET_EXTENSION_STATE") {
		getExtensionState((data) => sendResponse(data));
	} else if (message.action === "TOGGLE_FEATURE") {
		toggleFeature(message.slug, (update) => sendResponse(update));
	} else if (message.action === "CHECK_FOR_UPDATES") {
		checkForUpdates((update) => sendResponse(update));
	}

	return true;
});
chrome.runtime.onStartup.addListener(() => checkForUpdates());
chrome.tabs.onActivated.addListener(({ tabId }) => {
	chrome.tabs.get(tabId, (tab) => {
		if (chrome.runtime.lastError || !tab) {
			return;
		}

		prepareUpdateNotice(tabId, tab.url);
	});
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && YT_REGEX.test(tab.url || "")) {
		getDataFromStorage((data) => {
			if (data.error) {
				return;
			}
			for (const feature of data.featureList) {
				if (feature.active && feature.location) {
					chrome.scripting.executeScript({
						target: { tabId },
						files: [feature.location],
					});
				}
			}
		});
		prepareUpdateNotice(tabId, tab.url);
	}
});
