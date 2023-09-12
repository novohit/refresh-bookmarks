console.log('');
document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.getElementById('refreshButton');
    refreshButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'refreshBookmarks' });
    });
});