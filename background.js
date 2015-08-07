var tabIdOrder = [];

console.log('background run');

chrome.tabs.query({
  active: true,
  currentWindow: true
}, function(tabs) {
  tabIdOrder = tabs.map(function(tab) {
    return tab.id;
  });
  console.log(tabIdOrder)
});


//  TAB CLOSED
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  removeTabFromOrder(tabId, removeInfo.windowId);
});

//  TAB ACTIVATED (FOCUS CHANGE)
chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('activated tab', activeInfo.tabId)
  sendResetMessage();
  console.log('tab activated fire');
  removeTabFromOrder(activeInfo.tabId);
  tabIdOrder.unshift(activeInfo.tabId);


});

//  WINDOW FOCUS CHANGE
chrome.windows.onFocusChanged.addListener(function () {
  sendResetMessage();

  console.log(' activated fire');
    // chrome.tabs.sendMessage(tabs[0].id, {
    //     action: "reset_tab_state",
    //     orderedTabs: orderedTabs
    //   });
})

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
  if (tabIdOrder.indexOf(removeId) > -1) {
    for (var i = 0, l = tabIdOrder.length; i < l; i++) {
      var tabId = tabIdOrder[i];

      if (tabId === removeId) {
        tabIdOrder.splice(i, 1);
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
    for (var i = 0, l = tabIdOrder.length; i < l; i++) {
      for (var j = 0, l2 = tabs.length; j < l2; j++) {
        var curTab = tabs[j];
        if (curTab.id === tabIdOrder[i]) {
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

function sendResetMessage() {
  console.log('reset sent', tabIdOrder[0]);
  chrome.tabs.sendMessage(tabIdOrder[0], {
      action: "reset_tab_state"
    });
};