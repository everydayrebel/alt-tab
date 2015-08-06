var keysDown = {
		18: false, //	alt
		81: false //	q
	},
	amountToTab = 0,
	tabDialogOpen = false,
	modalNode = "tabModalContainer",
	tabList = [];

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch (request.action) {
			case "show_tab_list":
				tabList = request.orderedTabs;
				renderTabList(request.orderedTabs);
				// if (keysDown[18] && keysDown[81]) {
				// 	tabList = request.orderedTabs;
				// 	renderTabList();
				// }
				break;
		}
	});

$(window).on({
	"keydown": function(e) {
		if (e.keyCode in keysDown) {
			keysDown[e.keyCode] = true;

			if (keysDown[18] && keysDown[81]) {
				//	open dialog if it's not open
				//	list current tabs, and the selected one
				amountToTab += 1;
				if (tabDialogOpen) {
					changeTabListSelected();
				} else {
					tabDialogOpen = true;
					chrome.runtime.sendMessage({
						"message": "return_tab_list"
					});
				}
			}
		}
	},
	"keyup": function(e) {
		if (e.keyCode in keysDown) {
			keysDown[e.keyCode] = false;
			if (!keysDown[18]) {
				chrome.runtime.sendMessage({
					"message": "change_tab",
					"amountToTab": amountToTab
				});
				amountToTab = 0;
				tabDialogOpen = false;
				$.modal.close();
			}
		}
	}
});

function renderTabList() {
	var dialogContent = "",
		iToSelect = (amountToTab % tabList.length) + 1;

	tabList.forEach(function(tab, i) {
		dialogContent += "<div class='pageSection'>" + tab.title + "</div>";
	});
	if (keysDown[18] && keysDown[81]) {
		modal = $.modal(dialogContent, {
			containerId: modalNode,
			close: false
		});
	}
	changeTabListSelected();
}

function changeTabListSelected() {
	var modal = $("#" + modalNode);
	modal.find("div.selected").removeClass("selected");
	modal.find(".pageSection:eq(" + (amountToTab % tabList.length) + ")").addClass("selected");
}