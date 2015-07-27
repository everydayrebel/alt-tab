var openTabs = [];
var tabOrder = [];

chrome.tabs.query({
  currentWindow: true
}, function(tabs) {
  openTabs = tabs;
  tabOrder = openTabs.map(function(tab) {
    return tab.id;
  });
  console.log("init tab order", tabOrder);
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("message received");
    if (request.message === "change_tab") {
      changeTab(request.amountToTab);
    }
  }
);

chrome.tabs.onActivated.addListener(
  function(activeInfo) {
    console.log('swtiched info', activeInfo);
    removeTabFromOrder(activeInfo.tabId);
    tabOrder.unshift(activeInfo.tabId);
    console.log('post switch array', tabOrder);
  }
);

chrome.tabs.onCreated.addListener(
  function(tab) {
    tabOrder.push(tab.id)
    console.log('created tab', tab);
  }
);

chrome.tabs.onRemoved.addListener(
  function(removeInfo) {
    console.log('removeInfo', removeInfo);
    console.log('preremove array', tabOrder)
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
  console.log("forward!!");
}