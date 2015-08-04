var keysDown = {
	18: false, //	alt
	81: false //	q
},
	amountToTab = 0,
	tabDialogOpen = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.action) {
      case "show_tab_list":
      	if (keysDown[18] && keysDown[81])
        	renderTabList(request.orderedTabs);
        break;
    }
  });

$(window).on({
	"keydown": function(e) {
		if (e.keyCode in keysDown) {
			keysDown[e.keyCode] = true;
			console.log("what's down?", e.keyCode)
			console.log('keys')
			if (keysDown[18] && keysDown[81]) {
				//	open dialog if it's not open
				//	list current tabs, and the selected one
				console.log('both keys are down');
				chrome.runtime.sendMessage({
					"message": "return_tab_list"
				});
				tabDialogOpen = true;
				amountToTab += 1;
			}
		}
	},
	"keyup": function(e) {
		if (e.keyCode in keysDown) {
			keysDown[e.keyCode] = false;
			console.log("what's up?", e.keyCode)
			if ((keysDown[18] === false) && (keysDown[81] === false)) {
				chrome.runtime.sendMessage({
					"message": "change_tab",
					"amountToTab": amountToTab
				});
				amountToTab = 0;
				$.modal.close();
			}
		}
	}
});

function renderTabList(tabList) {
	var dialogContent = "";

	tabList.forEach(function(tab){
		dialogContent += "<div><img src='" + tab.favIconUrl + "' />" + tab.title + "</div>";
	});

	$.modal(dialogContent, {
		close: false
	});
}