var keysDown = {
	18: false, //	alt
	81: false //	q
},
	amountToTab = 0;

$(window).on({
	"keydown": function(e) {
		if (e.keyCode in keysDown) {
			keysDown[e.keyCode] = true;
			console.log("what's down?", e.keyCode)
			if (keysDown[18] && keysDown[81]) {
				//	open dialog if it's not open
				//	list current tabs, and the selected one
				chrome.runtime.sendMessage({
					"message": "return_tab_list"
				});
				
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
			}
		}
	}
});