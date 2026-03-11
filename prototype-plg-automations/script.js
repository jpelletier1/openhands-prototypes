// Interactive functionality for the conversation interface

document.addEventListener('DOMContentLoaded', () => {
    // Chat input handling
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');
    
    // Send message function
    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (message) {
            console.log('Sending message:', message);
            // Add your message sending logic here
            chatInput.value = '';
            updateStatusMessage('Processing request...');
        }
    };

    // Send button click
    sendButton.addEventListener('click', sendMessage);

    // Enter key to send
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Git control buttons
    const gitButtons = document.querySelectorAll('.git-btn');
    gitButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.querySelector('span').textContent;
            console.log('Git action:', action);
            // Add your git action logic here
            updateStatusMessage(`Executing: ${action}...`);
        });
    });

    // Header action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.getAttribute('title');
            console.log('Action clicked:', title);
            // Add your action logic here
            
            // Visual feedback
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            setTimeout(() => {
                btn.style.backgroundColor = '';
            }, 200);
        });
    });

    // Update status message
    const updateStatusMessage = (message) => {
        const statusRight = document.querySelector('.status-right span');
        if (statusRight) {
            statusRight.textContent = message;
            
            // Reset after 3 seconds
            setTimeout(() => {
                statusRight.textContent = 'Initializing Agent...';
            }, 3000);
        }
    };

    // Three dots menu
    const threeDotsBtn = document.querySelector('.three-dots');
    if (threeDotsBtn) {
        threeDotsBtn.addEventListener('click', () => {
            console.log('Opening menu...');
            // Add your menu logic here
        });
    }

    // Sidebar navigation
    const navIcons = document.querySelectorAll('.nav-icon');
    navIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log('Navigation clicked');
            // Add your navigation logic here
        });
    });

    // Simulate status updates
    const statusMessages = [
        'Initializing Agent...',
        'Analyzing repository...',
        'Ready to build!',
        'Waiting for input...'
    ];
    
    let messageIndex = 0;
    setInterval(() => {
        messageIndex = (messageIndex + 1) % statusMessages.length;
        const statusRight = document.querySelector('.status-right span');
        if (statusRight && chatInput.value === '') {
            statusRight.textContent = statusMessages[messageIndex];
        }
    }, 5000);

    // Auto-focus chat input
    chatInput.focus();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K to focus input
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            chatInput.focus();
            chatInput.select();
        }
        
        // Escape to clear input
        if (e.key === 'Escape') {
            chatInput.value = '';
            chatInput.blur();
        }
    });

    console.log('Conversation interface initialized');
});
