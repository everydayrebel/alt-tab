var tabOrder = [];

chrome.tabs.query({
  active: true
}, function(tabs) {
  tabOrder = tabs;
});

function fancyConsole(message) {
  console.log("%c" + message, "color: blue; font-style: italic");
}


//  TAB CLOSED
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  removeTabFromOrder(tabId, removeInfo.windowId);
});

//  TAB ACTIVATED
chrome.tabs.onActivated.addListener(function(activeInfo) {

  removeTabFromOrder(activeInfo.tabId);
  tabOrder[activeInfo.windowId].unshift(activeInfo.tabId);

  fancyConsole("Tab activated");

});


//  CONTENT SCRIPT LISTENERS
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.message) {
      case "change_tab":
        changeTab(request.amountToTab);
        break;
      case "return_tab_list":
        returnTabList();
        break;
    }
  }
);




function removeTabFromOrder(removeId) {
  if (tabOrder.indexOf(removeId) > -1) {
    for (var i = 0, l = tabOrder.length; i < l; i++) {
      var tabId = tabOrder[i];

      if (tabId === removeId) {
        tabOrder.splice(i, 1);
        break;
      }
    }
  }
}

function changeTab(amountToTab) {
  amountToTab = amountToTab % tabOrder.length;

  var orderedTabs = [],
      unorderedTabs = [];

  chrome.tabs.query({
    currentWindow: true
  }, function(tabs) {

    tabs.forEach(function(tab){
        tabOrder.forEach(function(orderedTabId, i) {
          if(orderedTabId === tab.id) {
            orderedTabs[i] = tab
          }
        })
      }
    });
  });

  //  this will trigger the tab activate listener
  chrome.tabs.update(tabOrder[amountToTab], {
    active: true
  });
};






function returnTabList() {

}