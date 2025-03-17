document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    const autoSubmitCheckbox = document.getElementById('autoSubmit');
    const statusDisplay = document.getElementById('status');
    
    // Load current settings
    chrome.storage.local.get(['enabled', 'autoSubmit'], function(result) {
        const enabled = result.enabled || false;
        const autoSubmit = result.autoSubmit || false;
        
        toggleBtn.textContent = enabled ? 'Disable Auto-Completer' : 'Enable Auto-Completer';
        autoSubmitCheckbox.checked = autoSubmit;
        statusDisplay.textContent = 'Status: ' + (enabled ? 'Enabled' : 'Disabled');
    });
    
    // Toggle button functionality
    toggleBtn.addEventListener('click', function() {
        chrome.storage.local.get(['enabled'], function(result) {
            const newState = !(result.enabled || false);
            
            chrome.storage.local.set({enabled: newState}, function() {
                toggleBtn.textContent = newState ? 'Disable Auto-Completer' : 'Enable Auto-Completer';
                statusDisplay.textContent = 'Status: ' + (newState ? 'Enabled' : 'Disabled');
                
                // Send message to content script
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleState', enabled: newState});
                    }
                });
            });
        });
    });
    
    // Auto-submit checkbox functionality
    autoSubmitCheckbox.addEventListener('change', function() {
        chrome.storage.local.set({autoSubmit: this.checked}, function() {
            // Send message to content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'updateAutoSubmit', autoSubmit: autoSubmitCheckbox.checked});
                }
            });
        });
    });
});