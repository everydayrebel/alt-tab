var tabOrder = {},
  currentWindowId = 0;

//  get current window id
chrome.windows.getCurrent({}, function(currentWindow) {
  currentWindowId = currentWindow.id;
  console.log("initial current window", currentWindow);

  //  get list of all current tab ids
  getTabsForWindow();
});




function fancyConsole(message) {
  console.log("%c" + message, "color: blue; font-style: italic");
}







//  TAB CREATED
chrome.tabs.onCreated.addListener(function(tab) {
  addTabToOrder(tab.id, tab.windowId);
  // fancyConsole("New tab opened");
  // console.log('tab', tab);
  // console.log('active tabOrder', tabOrder)
});

//  TAB CLOSED
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  removeTabFromOrder(tabId, removeInfo.windowId);
  // fancyConsole("Tab closed");
  // console.log('tab', tabId);
  // console.log('removeInfo', tabId);
  // console.log('active tabOrder', tabOrder)
});

//  TAB ACTIVATED
chrome.tabs.onActivated.addListener(function(activeInfo) {
  //  activated is fired any time a focus is given a tab
  //  cases include targetting tab and attaching a new tab

  var handleActiveOrder = function () {
    if (tabOrder[activeInfo.windowId].indexOf(activeInfo.tabId) > -1) {
      removeTabFromOrder(activeInfo.tabId, activeInfo.windowId);
    }

    //  add to front of the order
    tabOrder[activeInfo.windowId].unshift(activeInfo.tabId);
  };

  //  not sure that attach will always fire and add the tab to the array every time
  //  before actived is firedtherefore
  //  cannot assume that a tab exists in the current window's order
  fancyConsole("Tab activated");
  console.log('tab id', activeInfo.tabId);
  console.log('tab id', activeInfo.windowId);
  console.log('active tabOrder', JSON.stringify(tabOrder))

  if (tabOrder.hasOwnProperty(activeInfo.windowId)) {
    handleActiveOrder();
  } else {
    getTabsForWindow(activeInfo.newWindowId, handleActiveOrder);
  }
});

//  TAB ATTACHED
chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {

  var addTab = function() {
    addTabToOrder(tabId, attachInfo.newWindowId);

  }

  //  not necessarily safe to assume that an attached tab will also be focused
  //  so need to check and add window tabs
  //  on attach can/will fire before a focus change to the new window

  if (tabOrder.hasOwnProperty(attachInfo.newWindowId)) {
    addTab();
  } else {
    getTabsForWindow(attachInfo.newWindowId, addTab);
  }


  fancyConsole("Tab attached");
  console.log('tab', tabId);
  console.log('attachInfo', attachInfo)
  console.log('active tabOrder', JSON.stringify(tabOrder))

});

//  TAB DETACHED
chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
  removeTabFromOrder(tabId, detachInfo.oldWindowId)
  fancyConsole("Tab detached");
  console.log('tab', tabId);
  console.log('detachInfo', detachInfo)
  console.log('tabOrder', tabOrder)
});



//  when a window focus is changed
chrome.windows.onFocusChanged.addListener(function(windowId) {
  currentWindowId = windowId;
  !tabOrder.hasOwnProperty(windowId) && getTabsForWindow();
  fancyConsole("Window focus change");
  console.log('windowId', windowId)
  console.log('tabOrder', tabOrder)
});

//  when a window is removed
chrome.windows.onRemoved.addListener(function(windowId) {
  delete tabOrder[windowId];
  fancyConsole("Window is removed");
  console.log('windowId', windowId)
  console.log('tabOrder', tabOrder)
});

//  don't need on window create... will be caught on tab focus






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




function getTabsForWindow(targetWindowId, callBack) {
  var targetWindow = targetWindowId || currentWindowId;

  chrome.tabs.query({
    windowId: targetWindow
  }, function(tabs) {
    tabOrder[targetWindow] = tabs.map(function(tab) {
      return tab.id;
    });

    console.log('callBack', callBack)
    typeof callBack === "function" && callBack();

    console.log('gettabsforwindow tabOrder', JSON.stringify(tabOrder))


  });

}

function addTabToOrder(tabId, addWindowId) {
  var targetWindow = addWindowId || currentWindowId;

  var pushToArray = function() {
    tabOrder[targetWindow].push(tabId);
  };

  console.log('hasOwnProperty', tabOrder.hasOwnProperty(targetWindow))

  //  check if the window is already in tabOrder
  //  if there isn't, get it
  if (tabOrder.hasOwnProperty(targetWindow)) {
    pushToArray();
  } else {
    getTabsForWindow(targetWindow, pushToArray);
  }
}

function removeTabFromOrder(removeId, detachWindowId) {
  var targetWindow = detachWindowId || currentWindowId;

  for (var i = 0, l = tabOrder[targetWindow].length; i < l; i++) {
    var tabId = tabOrder[targetWindow][i];

    if (tabId === removeId) {
      tabOrder[targetWindow].splice(i, 1);
      break;
    }
  }
}

function changeTab(amountToTab) {
  var currentWindowTabs
  amountToTab = amountToTab % tabOrder[currentWindowId].length;
  //  I need the list of tabs of the current window here
  //  then switch to the next tab of current window
  // chrome.tabs.query({ windowId: currentWindowId }, function(tabs) {
  //   tabOrder = tabs.map(function(tab) {
  //     return tab.id;
  //   });
  // });

  chrome.tabs.update(tabOrder[currentWindowId][amountToTab], {
    active: true
  });
};






function returnTabList() {
  chrome.tabs.query({
    windowId: currentWindowId
  }, function(tabs) {
    tabOrder = tabs.map(function(tab) {
      return tab.id;
    });
  });
}