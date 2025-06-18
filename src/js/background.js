const ytURL = /^(https?:\/\/)?(www\.)?(youtube\.com|m\.youtube\.com|youtu\.be)(\/.*)?$/;
let jsonData = {
	BLOCK_ADS: {
		REFRESH_TIMER: null,
		TOGGLE_STATE: false,
	},
	NO_SHORTS: {
		REFRESH_TIMER: null,
		TOGGLE_STATE: false,
	},
	HIDE_CHAT: {
		REFRESH_TIMER: null,
		TOGGLE_STATE: false,
	},
	CUSTOM_LOOP: {
		REFRESH_TIMER: null,
		TOGGLE_STATE: false,
	},
};

function getManifestInfo(message, sendResponse) {
	if (message.type === "GET_MANIFEST_INFO") {
		const data = chrome.runtime.getManifest();
		if (data.version) {
			sendResponse({
				manifestName: data.name,
				manifestVersion: data.version,
			});
		}
	}
}

function detectActiveURL(message, sendResponse) {
	if (message.type === "DETECT_ACTIVE_URL") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs.length > 0) {
				const isYT = ytURL.test(tabs[0].url);
				sendResponse({ tabStatusUpdate: true, isYT });
			} else {
				sendResponse({ tabStatusUpdate: false });
			}
		});
	}
}

function getToggleState() {
	chrome.storage.local.get(["jsonData"]).then((data) => {
		if (data.jsonData) {
			jsonData = data.jsonData;
		}

		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs.length > 0) {
				chrome.tabs
					.sendMessage(tabs[0].id, { data: jsonData, key: "ALL" })
					.then((response) => {
						console.log(response);
						if (response.key) {
							jsonData[response.key]["REFRESH_TIMER"] = response.timer;
							chrome.storage.local.set({ jsonData });
						}
					})
					.catch((error) => {});
			}
		});
	});
}

function setToggleState(optionKey = undefined) {
	if (typeof optionKey === "string") {
		jsonData[optionKey]["TOGGLE_STATE"] = !jsonData[optionKey]["TOGGLE_STATE"];
	} else {
		optionKey = "ALL";
	}

	chrome.storage.local.set({ jsonData: jsonData }).then(async () => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs.length > 0) {
				chrome.tabs
					.sendMessage(tabs[0].id, { data: jsonData, key: optionKey })
					.then((response) => {
						console.log(response);
						if (response.key) {
							jsonData[response.key]["REFRESH_TIMER"] = response.timer;
							chrome.storage.local.set({ jsonData });
						}
					})
					.catch((error) => {});
			}
		});
	});
}

function updateToggleState(message, sendResponse) {
	if (message.type === "GET_TOGGLE_STATE") {
		getToggleState();
		sendResponse({ enabledScript: jsonData });
	} else if (message.type === "SET_TOGGLE_STATE") {
		setToggleState(message.key);
		sendResponse({ enabledScript: jsonData });
	}
}

function popupMessageHandler(message, sender, sendResponse) {
	getManifestInfo(message, sendResponse);
	detectActiveURL(message, sendResponse);
	updateToggleState(message, sendResponse);

	return true;
}

chrome.runtime.onInstalled.addListener(setToggleState);
chrome.runtime.onMessage.addListener(popupMessageHandler);
chrome.runtime.onStartup.addListener(getToggleState);
chrome.tabs.onActivated.addListener(getToggleState);
chrome.tabs.onCreated.addListener(getToggleState);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	console.log(changeInfo);
	if (changeInfo.status === "complete") {
		getToggleState();
	}
});
