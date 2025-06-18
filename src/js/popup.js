function getManifestInfo() {
	chrome.runtime.sendMessage({ type: "GET_MANIFEST_INFO" }).then((response) => {
		$("#extension_title").text(response.manifestName);
		$("#extension_version").text(`v${response.manifestVersion}`);
	});
}

function detectActiveURL() {
	chrome.runtime.sendMessage({ type: "DETECT_ACTIVE_URL" }).then((response) => {
		if (response.tabStatusUpdate === true) {
			$("#page_status").text(response.isYT ? "Current tab is in YouTube!" : "Current tab is not in YouTube!");
			$(".toggle").prop("disabled", !response.isYT);
			if (response.isYT) {
				$("#options > ul").removeClass("line-through");
				flipOptionsToggle();
			}
		}
	});
}

function flipOptionsToggle(toggleBtn = undefined) {
	if (toggleBtn === undefined) {
		chrome.runtime.sendMessage({ type: "GET_TOGGLE_STATE" }).then((response) => {
			if (response.enabledScript) {
				$.each($(".toggle"), function (index, element) {
					const optionKey = $(element).attr("name").toUpperCase();
					$(element).prop("checked", response.enabledScript[optionKey]["TOGGLE_STATE"]);
				});
			}
		});
	} else {
		const optionKey = $(toggleBtn).attr("name").toUpperCase();
		chrome.runtime.sendMessage({ type: "SET_TOGGLE_STATE", key: optionKey }).then((response) => {});
	}
}

$(document).ready(function () {
	getManifestInfo();
	detectActiveURL();

	$(".toggle").on("change", function () {
		flipOptionsToggle(this);
	});
});
