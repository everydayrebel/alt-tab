var tabOrder = [];

console.log('background run');

chrome.tabs.query({
  active: true
}, function(tabs) {
  tabOrder = tabs;
});


//  TAB CLOSED
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  removeTabFromOrder(tabId, removeInfo.windowId);
});

//  TAB ACTIVATED
chrome.tabs.onActivated.addListener(function(activeInfo) {
  removeTabFromOrder(activeInfo.tabId);
  tabOrder.unshift(activeInfo.tabId);
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
  returnOrderedTabs(function(amountToTab, orderedTabs) {
    chrome.tabs.update(orderedTabs[amountToTab % orderedTabs.length].id, {
      active: true
    });
  }.bind(undefined, amountToTab));
};



function returnTabList() {
  returnOrderedTabs(function(orderedTabs) {
    chrome.tabs.query({
      currentWindow: true,
      active: true
    }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "show_tab_list",
        orderedTabs: orderedTabs
      });
    });
  });
};


function returnOrderedTabs(callback) {
  chrome.tabs.query({
    currentWindow: true
  }, function(tabs) {
    var orderedTabs = [];
    for (var i = 0, l = tabOrder.length; i < l; i++) {
      for (var j = 0, l2 = tabs.length; j < l2; j++) {
        var curTab = tabs[j];
        if (curTab.id === tabOrder[i]) {
          orderedTabs.push(curTab);
          tabs.splice(j, 1);
          break;
        }
      }
    }

    orderedTabs = orderedTabs.concat(tabs);

    callback(orderedTabs);
  })
};