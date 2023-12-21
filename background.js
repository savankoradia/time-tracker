var allTasks = {};
function getAllTasks() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['tasks'], (result) => {
      if ('tasks' in result) {
        allTasks = result.tasks;
        resolve(result.tasks);
      }
    });
  });
}

function getLastRunningTask(sendResponse) {
  getAllTasks().then(function (tasks) {
    // sendResponse({ message: 'Button click received!' + JSON.stringify(tasks) });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'buttonClicked') {
    getLastRunningTask(sendResponse);
    sendResponse({ message: 'Button click received!' + JSON.stringify(allTasks) });
  }
});