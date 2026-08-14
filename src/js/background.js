const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|m\.youtube\.com|youtu\.be)(\/.*)?$/;
const DATA_KEY = "featureList";

async function loadDefaultConfig() {
	return fetch(chrome.runtime.getURL("config.json")).then((response) => response.json());
}

function checkAvailableFeatures(storedFeatures, defaultFeatures) {
	return defaultFeatures.map((df) => {
		return new Map((storedFeatures ?? []).map((sf) => [sf.slug, sf])).get(df.slug) ?? df;
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

			chrome.storage.local.remove(unusedDataKeys, () => {
				if (chrome.runtime.lastError) {
					callbackFn({ error: chrome.runtime.lastError });
					return;
				}

				callbackFn(dataStorage);
			});
		});
	});
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

function getExtensionState(callbackFn) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (chrome.runtime.lastError) {
			callbackFn({ error: chrome.runtime.lastError });
			return;
		}

		getDataFromStorage((data) => {
			const manifestVersion = chrome.runtime.getManifest().version;
			const defaultResponse = { ...data, tab: tabs[0], manifestVersion, isValidTargetTab: false };
			if (data.error || !YT_REGEX.test(defaultResponse.tab.url)) {
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

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
	if (message.action === "GET_EXTENSION_STATE") {
		getExtensionState((data) => sendResponse(data));
	} else if (message.action === "TOGGLE_FEATURE") {
		toggleFeature(message.slug, (update) => sendResponse(update));
	}

	return true;
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
	}
});
