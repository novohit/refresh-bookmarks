chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed.');
});

let queue = [];

async function refreshBookmarks() {
    function getBookmarks(bookmarkNode, depth = 0) {
        // 生成适量数量的缩进，以表示层级
        const indent = '  '.repeat(depth);

        if (bookmarkNode.url) {
            console.log(indent + "Refreshing: ", bookmarkNode.url);
            // 将 URL 添加到队列以便稍后处理
            queue.push(bookmarkNode.url);
        } else {
            console.log(indent + "Folder:", bookmarkNode.title);
        }

        if (bookmarkNode.children) {
            for (const child of bookmarkNode.children) {
                getBookmarks(child, depth + 1);
            }
        }
    }

    chrome.bookmarks.getTree((bookmarkTree) => {
        for (const bookmark of bookmarkTree) {
            getBookmarks(bookmark);
        }
        processQueue();
    });
}

let concurrentLimit = 5;  // 限制并发数量

async function processQueue() {
    while (queue.length > 0) {
        let currentBatch = queue.splice(0, concurrentLimit);
        await Promise.all(currentBatch.map(url => {
            return new Promise(resolve => {
                chrome.tabs.create({ url: url }, (tab) => {
                    // 这里添加逻辑以决定何时关闭标签，例如使用 setTimeout
                    setTimeout(() => {
                        chrome.tabs.remove(tab.id);
                        resolve();
                    }, 5000);  // 这里设置标签页保持打开状态的时间（单位：毫秒）
                });
            });
        }));
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'refreshBookmarks') {
        refreshBookmarks();
    }
});
