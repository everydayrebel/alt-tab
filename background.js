var tabOrder = [];

chrome.tabs.query({
  currentWindow: true
}, function(tabs) {
  tabOrder = tabs.map(function(tab) {
    return tab.id;
  });
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "change_tab") {
      changeTab(request.amountToTab);
    }
  }
);

chrome.tabs.onActivated.addListener(
  function(activeInfo) {
    removeTabFromOrder(activeInfo.tabId);
    tabOrder.unshift(activeInfo.tabId);
  }
);

chrome.tabs.onCreated.addListener(
  function(tab) {
    tabOrder.push(tab.id)
  }
);

chrome.tabs.onRemoved.addListener(
  function(removeInfo) {
    removeTabFromOrder(removeInfo);
  }
);




function removeTabFromOrder(removeId) {
  for (var i = 0, l = tabOrder.length; i < l; i++) {
    var tabId = tabOrder[i];

    if (tabId === removeId) {
      tabOrder.splice(i, 1);
      break;
    }
  }
}


function changeTab(amountToTab) {
  amountToTab = amountToTab % tabOrder.length;
  chrome.tabs.update(tabOrder[amountToTab], { active: true });
}