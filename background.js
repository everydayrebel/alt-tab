var tabOrder = {},
  currentWindowId = 0;

//  get current window id
chrome.windows.getCurrent({}, function(currentWindow) {
  currentWindowId = currentWindow.id;
});

//  get list of all current tab ids
getTabsForWindow();




//  when a new tab is activated
chrome.tabs.onActivated.addListener(function(activeInfo) {
  removeTabFromOrder(activeInfo.tabId);
  tabOrder[currentWindowId].unshift(activeInfo.tabId);
});

//  when a new tab is created
chrome.tabs.onCreated.addListener(function(tab) {
  tabOrder.push(tab.id)
});

//  when a tab is closed
chrome.tabs.onRemoved.addListener(function(removeInfo) {
  removeTabFromOrder(removeInfo);
});

//  when a tab is detatched
chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
  removeTabFromOrder(tabId, detachInfo.oldWindowId)
});



//  when a window focus is changed
chrome.windows.onFocusChanged.addListener(
  function(windowId) {
    currentWindowId = windowId;
  }
);

//  when a window is removed
chrome.windows.onRemoved.addListener(
  function(windowId) {
    delete tabOrder[windowId];
  }
);

//  don't need on window create... will be caught on focus





//  handle message listeners from content script
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




function getTabsForWindow() {
  chrome.tabs.query({
    windowId: currentWindowId
  }, function(tabs) {
    tabOrder[currentWindowId] = tabs.map(function(tab) {
      return tab.id;
    });
  });
}

function addTabToOrder(tabId, window)

function removeTabFromOrder(removeId, detachWindowId) {
  var targetWindow = detachWindowId || currentWindowId;

  for (var i = 0, l = tabOrder[targetWindow].length; i < l; i++) {
    var tabId = tabOrder[i];

    if (tabId === removeId) {
      tabOrder.splice(i, 1);
      break;
    }
  }
}

function changeTab(amountToTab) {
  var currentWindowTabs
  amountToTab = amountToTab % tabOrder.length;
  //  I need the list of tabs of the current window here
  //  then switch to the next tab of current window
  chrome.tabs.query({
    windowId: currentWindowId
  }, function(tabs) {
    tabOrder = tabs.map(function(tab) {
      return tab.id;
    });
  });
});




chrome.tabs.update(tabOrder[amountToTab], {
  active: true
});
}

function returnTabList() {
  chrome.tabs.query({
    windowId: currentWindowId
  }, function(tabs) {
    tabOrder = tabs.map(function(tab) {
      return tab.id;
    });
  });
}