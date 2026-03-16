// OpenHands PLG Wizard - Interactive Setup Flow

document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        currentStep: 1,
        provider: null,
        profile: {
            role: null,
            purpose: null,
            orgSize: null
        },
        integrations: {
            github: true,
            slack: false,
            jira: false
        },
        selectedUseCases: [],
        useCaseTriggers: {},
        selectedRepos: [],
        modelOption: null,
        apiKey: null,
        businessEmail: null,
        setupComplete: false,
        customUseCases: []
    };

    // Use case descriptions data with documentation URLs
    const useCaseData = {
        'prd-refinement': {
            name: 'PRD Refinement',
            emoji: '📝',
            slashCommand: '/prd-refinement',
            docUrl: 'https://docs.openhands.dev/workflows/prd-refinement',
            description: 'Automatically analyze and refine Product Requirements Documents by identifying gaps, suggesting improvements, and adding technical specifications.'
        },
        'task-decomposition': {
            name: 'Task Decomposition',
            emoji: '🔀',
            slashCommand: '/decompose',
            docUrl: 'https://docs.openhands.dev/workflows/task-decomposition',
            description: 'Break down complex issues into smaller, actionable tasks. Perfect for taking high-level features and creating implementation subtasks.'
        },
        'pr-summary': {
            name: 'Weekly PR Summary',
            emoji: '📊',
            slashCommand: '/pr-summary',
            docUrl: 'https://docs.openhands.dev/workflows/pr-summary',
            description: 'Get a comprehensive summary of all PRs, reviews, and merge activity posted to your Slack channel on a regular schedule.'
        },
        'code-review': {
            name: 'Code Review',
            emoji: '👀',
            slashCommand: '/pr-review',
            docUrl: 'https://docs.openhands.dev/workflows/code-review',
            description: 'Perform comprehensive code reviews on pull requests, identifying issues, suggesting improvements, and ensuring code quality standards.'
        }
    };

    // Sample repos (simulated data)
    const sampleRepos = [
        { name: 'frontend-app', fullName: 'acme-corp/frontend-app', language: 'TypeScript', stars: 234 },
        { name: 'backend-api', fullName: 'acme-corp/backend-api', language: 'Python', stars: 156 },
        { name: 'mobile-app', fullName: 'acme-corp/mobile-app', language: 'Swift', stars: 89 },
        { name: 'shared-utils', fullName: 'acme-corp/shared-utils', language: 'JavaScript', stars: 45 },
        { name: 'infrastructure', fullName: 'acme-corp/infrastructure', language: 'Terraform', stars: 67 },
        { name: 'data-pipeline', fullName: 'acme-corp/data-pipeline', language: 'Python', stars: 123 },
        { name: 'docs-site', fullName: 'acme-corp/docs-site', language: 'MDX', stars: 34 },
        { name: 'design-system', fullName: 'acme-corp/design-system', language: 'TypeScript', stars: 201 },
        { name: 'analytics-service', fullName: 'acme-corp/analytics-service', language: 'Go', stars: 78 },
        { name: 'auth-service', fullName: 'acme-corp/auth-service', language: 'Rust', stars: 145 },
        { name: 'ml-models', fullName: 'acme-corp/ml-models', language: 'Python', stars: 312 },
        { name: 'cli-tools', fullName: 'acme-corp/cli-tools', language: 'Go', stars: 56 }
    ];

    // DOM Elements
    const progressSteps = document.querySelectorAll('.progress-step');
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const navItems = document.querySelectorAll('.nav-item');
    const wizardSubsteps = document.getElementById('wizard-substeps');

    // Current view: 'wizard' or 'dashboard'
    let currentView = 'wizard';

    // Navigation between main views (Dashboard / Wizard)
    function navigateTo(view) {
        currentView = view;
        
        // Update nav items
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.nav === view) {
                item.classList.add('active');
            }
        });
        
        // Show/hide wizard substeps
        if (view === 'wizard') {
            wizardSubsteps.classList.remove('hidden');
            // Show current wizard step
            wizardSteps.forEach(step => step.classList.remove('active'));
            const currentStepEl = document.getElementById(`step-${state.currentStep}`);
            if (currentStepEl) {
                currentStepEl.classList.add('active');
            }
        } else if (view === 'dashboard') {
            wizardSubsteps.classList.add('hidden');
            // Show dashboard view
            wizardSteps.forEach(step => step.classList.remove('active'));
            document.getElementById('dashboard-view').classList.add('active');
            setupDashboardView();
        }
    }

    // Make navigateTo available globally
    window.navigateTo = navigateTo;

    // Setup dashboard view based on setup state
    function setupDashboardView() {
        const notSetupView = document.getElementById('not-setup-view');
        const cloudView = document.getElementById('cloud-monitoring-view');
        const localView = document.getElementById('local-monitoring-view');
        
        // Check if setup is complete (user has gone through the wizard)
        const isSetupComplete = state.setupComplete || false;
        
        if (!isSetupComplete) {
            // Show "not setup" view
            notSetupView.style.display = 'block';
            cloudView.style.display = 'none';
            if (localView) localView.style.display = 'none';
        } else {
            // Always show sample dashboard metrics (Runtime step removed per PRD)
            notSetupView.style.display = 'none';
            cloudView.style.display = 'block';
            if (localView) localView.style.display = 'none';
            populateMonitoringData();
        }
    }

    // Navigation functions for wizard steps
    function goToStep(stepNumber) {
        // Handle going to setup complete page
        if (stepNumber === 'complete' || stepNumber > 5) {
            showSetupComplete();
            return;
        }
        
        if (stepNumber < 1 || stepNumber > 5) return;
        
        // Make sure we're in wizard view
        if (currentView !== 'wizard') {
            navigateTo('wizard');
        }
        
        state.currentStep = stepNumber;
        
        // Update progress nav
        progressSteps.forEach(step => {
            const num = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (num === stepNumber) {
                step.classList.add('active');
            } else if (num < stepNumber) {
                step.classList.add('completed');
            }
        });
        
        // Update visible step
        wizardSteps.forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        
        // Special handling for step 4 (Use Cases) - populate repo dropdowns
        if (stepNumber === 4) {
            populateRepoDropdowns();
        }
    }
    
    // Show the Setup Complete page
    function showSetupComplete() {
        state.setupComplete = true;
        
        // Mark all steps as completed
        progressSteps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
        
        // Hide all wizard steps and show setup complete
        wizardSteps.forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('setup-complete').classList.add('active');
        
        // Populate the tutorial cards with selected use cases
        populateTutorialCards();
    }
    
    // Populate tutorial cards with selected use cases
    function populateTutorialCards() {
        const tutorialCards = document.getElementById('tutorial-cards');
        tutorialCards.innerHTML = '';
        
        // Add built-in use cases
        state.selectedUseCases.forEach(usecaseId => {
            const data = useCaseData[usecaseId];
            if (!data) return;
            
            const card = document.createElement('div');
            card.className = 'tutorial-card';
            card.innerHTML = `
                <h3><span>${data.emoji}</span> ${data.name}</h3>
                <p class="tutorial-description">${data.description}</p>
                <div class="doc-link-container">
                    <div class="doc-link-label">📚 Documentation Link (share with your team)</div>
                    <div class="doc-link-box">
                        <a href="${data.docUrl}" target="_blank" class="doc-link">${data.docUrl}</a>
                        <button class="copy-btn" onclick="copyToClipboard('${data.docUrl}', this)">Copy</button>
                    </div>
                </div>
                <div class="trigger-info">
                    <strong>Slash Command:</strong> <code>${data.slashCommand}</code>
                </div>
            `;
            tutorialCards.appendChild(card);
        });
        
        // Add custom use cases
        if (window.customUseCases) {
            window.customUseCases.forEach(useCase => {
                // Check if this custom use case is selected
                const useCaseEl = document.querySelector(`.use-case-item[data-usecase="${useCase.id}"]`);
                if (!useCaseEl || !useCaseEl.classList.contains('selected')) return;
                
                let triggerInfo = '';
                if (useCase.triggerType === 'schedule') {
                    const dayLabel = useCase.scheduleDay === 'daily' ? 'Daily' : `Every ${useCase.scheduleDay}`;
                    triggerInfo = `<strong>Schedule:</strong> ${dayLabel} at ${useCase.scheduleTime}`;
                } else {
                    const platformLabel = useCase.triggerPlatform.charAt(0).toUpperCase() + useCase.triggerPlatform.slice(1);
                    const eventLabel = useCase.triggerEvent.replace(/-/g, ' ');
                    triggerInfo = `<strong>Trigger:</strong> ${platformLabel} - ${eventLabel}`;
                    if (useCase.triggerLabel) {
                        triggerInfo += ` '${useCase.triggerLabel}'`;
                    }
                }
                
                const card = document.createElement('div');
                card.className = 'tutorial-card custom';
                card.innerHTML = `
                    <h3><span>🔧</span> ${useCase.name}</h3>
                    <p class="tutorial-description">${useCase.actionType === 'plugin' ? 'Plugin: ' + useCase.pluginPath : 'Custom prompt automation'}</p>
                    <div class="trigger-info">
                        ${triggerInfo}
                    </div>
                `;
                tutorialCards.appendChild(card);
            });
        }
    }

    // Make goToStep available globally for onclick handlers
    window.goToStep = goToStep;

    function validateStep(stepNumber) {
        switch (stepNumber) {
            case 2:
                return state.profile.role && state.profile.purpose && state.profile.orgSize;
            case 3:
                // Integrations step - always valid (user can skip connecting Slack/Jira)
                return true;
            case 4:
                return state.selectedUseCases.length > 0;
            case 5:
                if (state.modelOption === 'byok') {
                    const provider = document.getElementById('provider-select').value;
                    const apiKey = document.getElementById('api-key-input').value;
                    return provider && apiKey;
                }
                if (state.modelOption === 'credits') {
                    const email = document.getElementById('business-email').value;
                    return email && isBusinessEmail(email);
                }
                return state.modelOption !== null;
            default:
                return true;
        }
    }

    function isBusinessEmail(email) {
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        return domain && !personalDomains.includes(domain);
    }

    function updateNextButton(stepNumber) {
        const step = document.getElementById(`step-${stepNumber}`);
        const nextBtn = step.querySelector('[data-action="next"]');
        if (nextBtn) {
            nextBtn.disabled = !validateStep(stepNumber);
        }
    }

    // Step 1: Login handlers
    const providerBtns = document.querySelectorAll('.provider-btn');
    providerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.provider = btn.dataset.provider;
            // Simulate login animation
            btn.innerHTML = '<span class="emoji-icon">⏳</span> Connecting...';
            setTimeout(() => {
                goToStep(2);
            }, 1000);
        });
    });

    // Step 2: Profile questions handlers
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;
            
            // Deselect siblings
            const siblings = document.querySelectorAll(`.option-btn[data-field="${field}"]`);
            siblings.forEach(s => s.classList.remove('selected'));
            
            // Select this one
            btn.classList.add('selected');
            state.profile[field] = value;
            
            updateNextButton(2);
        });
    });

    // Step 4: Use case selection handlers
    const useCaseItems = document.querySelectorAll('.use-case-item');
    const detailsPlaceholder = document.querySelector('.details-placeholder');
    const detailsContents = document.querySelectorAll('.details-content');
    
    useCaseItems.forEach(item => {
        item.addEventListener('click', () => {
            const usecase = item.dataset.usecase;
            
            // Toggle selection
            item.classList.toggle('selected');
            
            if (item.classList.contains('selected')) {
                if (!state.selectedUseCases.includes(usecase)) {
                    state.selectedUseCases.push(usecase);
                }
            } else {
                state.selectedUseCases = state.selectedUseCases.filter(u => u !== usecase);
            }
            
            // Show details
            showUseCaseDetails(usecase);
            
            // Mark as viewing
            useCaseItems.forEach(i => i.classList.remove('viewing'));
            item.classList.add('viewing');
            
            updateNextButton(4);
        });
    });

    function showUseCaseDetails(usecase) {
        detailsPlaceholder.style.display = 'none';
        detailsContents.forEach(d => d.style.display = 'none');
        
        const detailEl = document.getElementById(`details-${usecase}`);
        if (detailEl) {
            detailEl.style.display = 'block';
        }
    }

    // Step 5: Repo selection
    function populateRepoList() {
        const repoList = document.getElementById('available-repos');
        repoList.innerHTML = '';
        
        sampleRepos.forEach(repo => {
            const isSelected = state.selectedRepos.includes(repo.fullName);
            const div = document.createElement('div');
            div.className = `repo-item${isSelected ? ' selected' : ''}`;
            div.dataset.repo = repo.fullName;
            div.innerHTML = `
                <span class="repo-icon">📁</span>
                <div class="repo-info">
                    <div class="repo-name">${repo.fullName}</div>
                    <div class="repo-meta">${repo.language} · ⭐ ${repo.stars}</div>
                </div>
            `;
            div.addEventListener('click', () => toggleRepoSelection(repo.fullName, div));
            repoList.appendChild(div);
        });
        
        updateSelectedReposDisplay();
    }

    function toggleRepoSelection(repoFullName, element) {
        if (state.selectedRepos.includes(repoFullName)) {
            state.selectedRepos = state.selectedRepos.filter(r => r !== repoFullName);
            element.classList.remove('selected');
        } else {
            state.selectedRepos.push(repoFullName);
            element.classList.add('selected');
        }
        
        updateSelectedReposDisplay();
        updateNextButton(5);
    }

    function updateSelectedReposDisplay() {
        const container = document.getElementById('selected-repos');
        
        if (state.selectedRepos.length === 0) {
            container.innerHTML = `
                <div class="empty-selection">
                    <span class="emoji-icon">📂</span>
                    <p>Click repositories on the left to add them</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = state.selectedRepos.map(repo => `
            <div class="selected-repo-item" data-repo="${repo}">
                <span class="repo-name">${repo}</span>
                <button class="remove-btn" onclick="removeRepo('${repo}')">×</button>
            </div>
        `).join('');
    }

    // Make removeRepo global for onclick
    window.removeRepo = function(repoFullName) {
        state.selectedRepos = state.selectedRepos.filter(r => r !== repoFullName);
        
        // Update repo list item
        const repoItem = document.querySelector(`.repo-item[data-repo="${repoFullName}"]`);
        if (repoItem) {
            repoItem.classList.remove('selected');
        }
        
        updateSelectedReposDisplay();
        updateNextButton(5);
    };

    // Populate repo dropdowns in use case details panels
    function populateRepoDropdowns() {
        const repoSelects = document.querySelectorAll('.repo-select');
        repoSelects.forEach(select => {
            // Keep the first option (placeholder)
            const placeholder = select.querySelector('option');
            select.innerHTML = '';
            select.appendChild(placeholder);
            
            // Add all sample repos
            sampleRepos.forEach(repo => {
                const option = document.createElement('option');
                option.value = repo.fullName;
                option.textContent = `${repo.fullName} (${repo.language})`;
                select.appendChild(option);
            });
        });
        
        // Initialize trigger options for all use cases
        ['prd-refinement', 'task-decomposition', 'pr-summary', 'code-review'].forEach(useCaseId => {
            updateTriggerOptionsForUseCase(useCaseId);
        });
    }
    
    // Make populateRepoDropdowns globally accessible
    window.populateRepoDropdowns = populateRepoDropdowns;

    // Step 5: Model selection
    const modelCards = document.querySelectorAll('.model-card');
    modelCards.forEach(card => {
        card.addEventListener('click', () => {
            modelCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.modelOption = card.dataset.model;
            
            // Show/hide input fields
            document.querySelector('.byok-input').style.display = 
                state.modelOption === 'byok' ? 'flex' : 'none';
            document.querySelector('.credits-input').style.display = 
                state.modelOption === 'credits' ? 'flex' : 'none';
            
            updateNextButton(5);
        });
    });

    // BYOK inputs
    const providerSelect = document.getElementById('provider-select');
    const apiKeyInput = document.getElementById('api-key-input');
    if (providerSelect) {
        providerSelect.addEventListener('change', () => updateNextButton(5));
    }
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', () => updateNextButton(5));
    }

    // Business email input
    const businessEmail = document.getElementById('business-email');
    if (businessEmail) {
        businessEmail.addEventListener('input', () => {
            state.businessEmail = businessEmail.value;
            updateNextButton(5);
        });
    }

    // Step 7: Installation
    // Copy to clipboard function
    window.copyToClipboard = function(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    // Populate monitoring dashboard with sample data
    function populateMonitoringData() {
        // Populate repo rankings
        const repoRankings = document.getElementById('repo-rankings');
        const repoData = state.selectedRepos.slice(0, 5).map((repo, i) => ({
            name: repo,
            count: Math.floor(Math.random() * 50) + 10,
            percentage: 100 - (i * 15)
        })).sort((a, b) => b.count - a.count);
        
        repoRankings.innerHTML = repoData.map((repo, i) => `
            <div class="ranking-item">
                <div class="ranking-position">${i + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${repo.name}</div>
                    <div class="ranking-count">${repo.count} conversations</div>
                </div>
                <div class="ranking-bar">
                    <div class="ranking-bar-fill" style="width: ${repo.percentage}%"></div>
                </div>
            </div>
        `).join('');
        
        // Populate use case rankings
        const usecaseRankings = document.getElementById('usecase-rankings');
        const usecaseRankData = state.selectedUseCases.slice(0, 5).map((uc, i) => ({
            name: useCaseData[uc]?.name || uc,
            emoji: useCaseData[uc]?.emoji || '🔧',
            count: Math.floor(Math.random() * 80) + 20,
            percentage: 100 - (i * 12)
        })).sort((a, b) => b.count - a.count);
        
        usecaseRankings.innerHTML = usecaseRankData.map((uc, i) => `
            <div class="ranking-item">
                <div class="ranking-position">${i + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${uc.emoji} ${uc.name}</div>
                    <div class="ranking-count">${uc.count} conversations</div>
                </div>
                <div class="ranking-bar">
                    <div class="ranking-bar-fill" style="width: ${uc.percentage}%"></div>
                </div>
            </div>
        `).join('');
        
        // Populate chart
        const chartContainer = document.getElementById('conversation-chart');
        const chartData = [];
        for (let i = 0; i < 30; i++) {
            // Generate realistic looking data with some variance
            const base = 5 + Math.floor(i / 3);
            const variance = Math.floor(Math.random() * 10);
            chartData.push(base + variance);
        }
        const maxValue = Math.max(...chartData);
        
        chartContainer.innerHTML = chartData.map(value => {
            const height = (value / maxValue) * 100;
            return `<div class="chart-bar" style="height: ${height}%" title="${value} conversations"></div>`;
        }).join('');
    }

    // Navigation button handlers
    document.querySelectorAll('[data-action="next"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(state.currentStep)) {
                goToStep(state.currentStep + 1);
            }
        });
    });

    document.querySelectorAll('[data-action="back"]').forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(state.currentStep - 1);
        });
    });

    // Progress step clicks (allow going back to completed steps)
    progressSteps.forEach(step => {
        step.addEventListener('click', () => {
            const targetStep = parseInt(step.dataset.step);
            if (targetStep < state.currentStep) {
                goToStep(targetStep);
            }
        });
    });

    console.log('OpenHands PLG Wizard initialized');
});

// Enterprise Configuration Modal Functions
function openEnterpriseModal() {
    const modal = document.getElementById('enterprise-modal');
    modal.style.display = 'flex';
    
    // Load saved values if any
    const savedHostname = localStorage.getItem('enterpriseHostname');
    const savedApiKey = localStorage.getItem('enterpriseApiKey');
    
    if (savedHostname) {
        document.getElementById('enterprise-hostname').value = savedHostname;
    }
    if (savedApiKey) {
        document.getElementById('enterprise-api-key').value = savedApiKey;
    }
}

function closeEnterpriseModal() {
    const modal = document.getElementById('enterprise-modal');
    modal.style.display = 'none';
}

function saveEnterpriseConfig() {
    const hostname = document.getElementById('enterprise-hostname').value;
    const apiKey = document.getElementById('enterprise-api-key').value;
    
    // Save to localStorage
    localStorage.setItem('enterpriseHostname', hostname);
    localStorage.setItem('enterpriseApiKey', apiKey);
    
    console.log('Enterprise configuration saved:', { hostname, apiKey: '***' });
    closeEnterpriseModal();
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('enterprise-modal');
    if (e.target === modal) {
        closeEnterpriseModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('enterprise-modal');
        if (modal && modal.style.display === 'flex') {
            closeEnterpriseModal();
        }
        const newUseCaseModal = document.getElementById('new-usecase-modal');
        if (newUseCaseModal && newUseCaseModal.style.display === 'flex') {
            closeNewUseCaseModal();
        }
    }
});

// Integration OAuth flow simulation
function connectIntegration(integration) {
    const card = document.querySelector(`.integration-card[data-integration="${integration}"]`);
    const btn = card.querySelector('.btn-connect');
    const status = card.querySelector('.integration-status');
    
    // Simulate OAuth redirect
    btn.textContent = 'Connecting...';
    btn.disabled = true;
    
    // Show a simple modal simulating OAuth
    const overlay = document.createElement('div');
    overlay.className = 'oauth-overlay';
    overlay.innerHTML = `
        <div class="oauth-modal">
            <div class="oauth-header">
                <h3>Connect to ${integration.charAt(0).toUpperCase() + integration.slice(1)}</h3>
            </div>
            <div class="oauth-body">
                <p>Redirecting to ${integration.charAt(0).toUpperCase() + integration.slice(1)} for authorization...</p>
                <div class="oauth-loader"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Simulate OAuth callback after a delay
    setTimeout(() => {
        overlay.querySelector('.oauth-body').innerHTML = `
            <p>✅ Authorization successful!</p>
            <p>Returning to OpenHands...</p>
        `;
        
        setTimeout(() => {
            overlay.remove();
            card.classList.add('connected');
            status.textContent = '✓ Connected';
            status.classList.add('connected');
            btn.remove();
        }, 1000);
    }, 2000);
}

// New Use Case Modal Functions
function openNewUseCaseModal() {
    const modal = document.getElementById('new-usecase-modal');
    modal.style.display = 'flex';
}

function closeNewUseCaseModal() {
    const modal = document.getElementById('new-usecase-modal');
    modal.style.display = 'none';
    
    // Reset editing state
    window.editingUseCaseId = null;
    
    // Reset modal title
    modal.querySelector('.modal-header h2').textContent = 'Create Custom Use Case';
    modal.querySelector('.modal-footer .btn-primary').textContent = 'Create Use Case';
    
    // Reset form
    document.getElementById('custom-usecase-name').value = '';
    document.getElementById('plugin-path').value = 'github.com/OpenHands/extensions/plugins/vulnerability-remediation';
    document.getElementById('custom-prompt').value = '';
    document.getElementById('plugin-status').innerHTML = '';
    document.getElementById('trigger-label').value = '';
    
    // Reset radio buttons to defaults
    document.querySelector('input[name="action-type"][value="plugin"]').checked = true;
    document.querySelector('input[name="trigger-type"][value="event"]').checked = true;
    toggleActionType();
    toggleTriggerType();
}

function toggleActionType() {
    const actionType = document.querySelector('input[name="action-type"]:checked').value;
    document.getElementById('plugin-input-group').style.display = actionType === 'plugin' ? 'block' : 'none';
    document.getElementById('prompt-input-group').style.display = actionType === 'prompt' ? 'block' : 'none';
}

function toggleTriggerType() {
    const triggerType = document.querySelector('input[name="trigger-type"]:checked').value;
    document.getElementById('event-trigger-group').style.display = triggerType === 'event' ? 'block' : 'none';
    document.getElementById('schedule-trigger-group').style.display = triggerType === 'schedule' ? 'block' : 'none';
}

function updateTriggerEvents() {
    const platform = document.getElementById('trigger-platform').value;
    const eventSelect = document.getElementById('trigger-event');
    
    if (platform === 'jira') {
        eventSelect.innerHTML = `
            <option value="new-issue">New Issue</option>
            <option value="issue-comment">Issue Comment</option>
            <option value="issue-updated">Issue Updated</option>
            <option value="label-added">Label Added</option>
        `;
    } else {
        eventSelect.innerHTML = `
            <option value="new-issue">New Issue</option>
            <option value="new-pr">New PR</option>
            <option value="issue-comment">Issue Comment</option>
            <option value="pr-comment">PR Comment</option>
            <option value="issue-updated">Issue Updated</option>
            <option value="pr-updated">PR Updated</option>
            <option value="label-added">Label Added</option>
        `;
    }
    
    // Show label input when needed
    eventSelect.addEventListener('change', () => {
        document.getElementById('label-input-group').style.display = 
            eventSelect.value === 'label-added' ? 'block' : 'none';
    });
}

// Update trigger options for a specific use case based on selected integration
function updateTriggerOptionsForUseCase(useCaseId) {
    const integrationSelect = document.querySelector(`.integration-select[data-usecase="${useCaseId}"]`);
    const triggersContainer = document.getElementById(`triggers-${useCaseId}`);
    
    if (!integrationSelect || !triggersContainer) return;
    
    const integration = integrationSelect.value;
    
    // GitHub triggers
    const githubTriggers = [
        { id: 'manual', label: 'Manual', requiresInput: false },
        { id: 'on-pr', label: 'On Pull Request', requiresInput: false },
        { id: 'on-issue-creation', label: 'On Issue Creation', requiresInput: false },
        { id: 'on-issue-label-added', label: 'On Issue Label Added', requiresInput: true, inputLabel: 'Label', inputPlaceholder: 'Enter label name (required)' },
        { id: 'on-pr-label-added', label: 'On PR Label Added', requiresInput: true, inputLabel: 'Label', inputPlaceholder: 'Enter label name (required)' },
        { id: 'on-failed-workflow-job', label: 'On Failed GitHub Workflow Job', requiresInput: true, inputLabel: 'Workflow Job Name', inputPlaceholder: 'Enter workflow job name (required)' }
    ];
    
    // Jira triggers
    const jiraTriggers = [
        { id: 'manual', label: 'Manual', requiresInput: false },
        { id: 'on-issue-creation', label: 'On Issue Creation', requiresInput: false },
        { id: 'on-issue-label-added', label: 'On Issue Label Added', requiresInput: true, inputLabel: 'Label', inputPlaceholder: 'Enter label name (required)' }
    ];
    
    const triggers = integration === 'github' ? githubTriggers : jiraTriggers;
    
    triggersContainer.innerHTML = triggers.map(trigger => `
        <label class="trigger-checkbox">
            <input type="radio" name="trigger-${useCaseId}" data-usecase="${useCaseId}" data-trigger="${trigger.id}" 
                   onchange="handleTriggerSelection('${useCaseId}', '${trigger.id}', ${trigger.requiresInput})">
            <span>${trigger.label}</span>
        </label>
        ${trigger.requiresInput ? `
            <div class="trigger-input-group" id="input-${useCaseId}-${trigger.id}" style="display: none;">
                <label>${trigger.inputLabel}</label>
                <input type="text" class="trigger-input" placeholder="${trigger.inputPlaceholder}" data-usecase="${useCaseId}" data-trigger="${trigger.id}">
            </div>
        ` : ''}
    `).join('');
}

// Handle trigger selection and show/hide input fields
function handleTriggerSelection(useCaseId, triggerId, requiresInput) {
    // Hide all input groups for this use case
    const container = document.getElementById(`triggers-${useCaseId}`);
    container.querySelectorAll('.trigger-input-group').forEach(group => {
        group.style.display = 'none';
    });
    
    // Show the input group for the selected trigger if needed
    if (requiresInput) {
        const inputGroup = document.getElementById(`input-${useCaseId}-${triggerId}`);
        if (inputGroup) {
            inputGroup.style.display = 'block';
        }
    }
}

// Make these functions globally accessible
window.updateTriggerOptionsForUseCase = updateTriggerOptionsForUseCase;
window.handleTriggerSelection = handleTriggerSelection;

// Set run mode (trigger or schedule) for a use case
function setRunMode(useCaseId, mode) {
    // Update button states
    const buttons = document.querySelectorAll(`.run-mode-btn[data-usecase="${useCaseId}"]`);
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Show/hide appropriate config sections
    const triggerConfig = document.getElementById(`trigger-config-${useCaseId}`);
    const scheduleConfig = document.getElementById(`schedule-config-${useCaseId}`);
    
    if (mode === 'trigger') {
        triggerConfig.style.display = 'block';
        scheduleConfig.style.display = 'none';
    } else {
        triggerConfig.style.display = 'none';
        scheduleConfig.style.display = 'block';
        // Initialize schedule picker if not already done
        initSchedulePicker(useCaseId);
    }
}

// Initialize schedule picker for a use case
function initSchedulePicker(useCaseId) {
    const container = document.getElementById(`schedule-picker-${useCaseId}`);
    if (!container || container.dataset.initialized) return;
    
    container.dataset.initialized = 'true';
    container.innerHTML = `
        <div class="schedule-frequency">
            <label>Run every</label>
            <div class="frequency-selector">
                <select class="schedule-frequency-select" data-usecase="${useCaseId}" onchange="updateScheduleOptions('${useCaseId}')">
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                </select>
            </div>
        </div>
        
        <div class="schedule-options" id="schedule-options-${useCaseId}">
            <!-- Options populated by updateScheduleOptions -->
        </div>
    `;
    
    // Initialize with daily options
    updateScheduleOptions(useCaseId);
}

// Update schedule options based on frequency selection
function updateScheduleOptions(useCaseId) {
    const frequencySelect = document.querySelector(`.schedule-frequency-select[data-usecase="${useCaseId}"]`);
    const optionsContainer = document.getElementById(`schedule-options-${useCaseId}`);
    const frequency = frequencySelect.value;
    
    if (frequency === 'day') {
        // Daily: just time picker
        optionsContainer.innerHTML = `
            <div class="schedule-time-section">
                <label>Time of day</label>
                <input type="time" class="schedule-time-input" value="09:00" data-usecase="${useCaseId}">
            </div>
            <div class="schedule-summary">
                <span class="schedule-summary-icon">🔄</span>
                <span class="schedule-summary-text">Runs every day at <strong>9:00 AM</strong></span>
            </div>
        `;
        // Add event listener for time change
        const timeInput = optionsContainer.querySelector('.schedule-time-input');
        timeInput.addEventListener('change', () => updateScheduleSummary(useCaseId, 'day'));
    } else if (frequency === 'week') {
        // Weekly: day selection + time picker
        optionsContainer.innerHTML = `
            <div class="schedule-days-section">
                <label>Days of the week</label>
                <div class="day-checkboxes">
                    <label class="day-checkbox">
                        <input type="checkbox" value="mon" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'week')">
                        <span>Mon</span>
                    </label>
                    <label class="day-checkbox">
                        <input type="checkbox" value="tue" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'week')">
                        <span>Tue</span>
                    </label>
                    <label class="day-checkbox">
                        <input type="checkbox" value="wed" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'week')">
                        <span>Wed</span>
                    </label>
                    <label class="day-checkbox">
                        <input type="checkbox" value="thu" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'week')">
                        <span>Thu</span>
                    </label>
                    <label class="day-checkbox">
                        <input type="checkbox" value="fri" data-usecase="${useCaseId}" checked onchange="updateScheduleSummary('${useCaseId}', 'week')">
                        <span>Fri</span>
                    </label>
                    <label class="day-checkbox">
                        <input type="checkbox" value="sat" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'week')">
                        <span>Sat</span>
                    </label>
                    <label class="day-checkbox">
                        <input type="checkbox" value="sun" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'week')">
                        <span>Sun</span>
                    </label>
                </div>
            </div>
            <div class="schedule-time-section">
                <label>Time of day</label>
                <input type="time" class="schedule-time-input" value="09:00" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'week')">
            </div>
            <div class="schedule-summary">
                <span class="schedule-summary-icon">🔄</span>
                <span class="schedule-summary-text" id="summary-text-${useCaseId}">Runs every Friday at <strong>9:00 AM</strong></span>
            </div>
        `;
        updateScheduleSummary(useCaseId, 'week');
    } else if (frequency === 'month') {
        // Monthly: day of month + time picker
        optionsContainer.innerHTML = `
            <div class="schedule-day-of-month-section">
                <label>Day of month</label>
                <select class="schedule-day-of-month" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'month')">
                    <option value="1">1st</option>
                    <option value="2">2nd</option>
                    <option value="3">3rd</option>
                    <option value="4">4th</option>
                    <option value="5">5th</option>
                    <option value="6">6th</option>
                    <option value="7">7th</option>
                    <option value="8">8th</option>
                    <option value="9">9th</option>
                    <option value="10">10th</option>
                    <option value="11">11th</option>
                    <option value="12">12th</option>
                    <option value="13">13th</option>
                    <option value="14">14th</option>
                    <option value="15" selected>15th</option>
                    <option value="16">16th</option>
                    <option value="17">17th</option>
                    <option value="18">18th</option>
                    <option value="19">19th</option>
                    <option value="20">20th</option>
                    <option value="21">21st</option>
                    <option value="22">22nd</option>
                    <option value="23">23rd</option>
                    <option value="24">24th</option>
                    <option value="25">25th</option>
                    <option value="26">26th</option>
                    <option value="27">27th</option>
                    <option value="28">28th</option>
                    <option value="last">Last day</option>
                </select>
            </div>
            <div class="schedule-time-section">
                <label>Time of day</label>
                <input type="time" class="schedule-time-input" value="09:00" data-usecase="${useCaseId}" onchange="updateScheduleSummary('${useCaseId}', 'month')">
            </div>
            <div class="schedule-summary">
                <span class="schedule-summary-icon">🔄</span>
                <span class="schedule-summary-text" id="summary-text-${useCaseId}">Runs on the 15th of every month at <strong>9:00 AM</strong></span>
            </div>
        `;
        updateScheduleSummary(useCaseId, 'month');
    }
}

// Update schedule summary text
function updateScheduleSummary(useCaseId, frequency) {
    const summaryEl = document.getElementById(`summary-text-${useCaseId}`) || 
                      document.querySelector(`#schedule-options-${useCaseId} .schedule-summary-text`);
    if (!summaryEl) return;
    
    const timeInput = document.querySelector(`.schedule-time-input[data-usecase="${useCaseId}"]`);
    const time = timeInput ? formatTime(timeInput.value) : '9:00 AM';
    
    if (frequency === 'day') {
        summaryEl.innerHTML = `Runs every day at <strong>${time}</strong>`;
    } else if (frequency === 'week') {
        const checkedDays = document.querySelectorAll(`.day-checkbox input[data-usecase="${useCaseId}"]:checked`);
        const dayNames = {
            mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
            fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
        };
        const days = Array.from(checkedDays).map(cb => dayNames[cb.value]);
        
        if (days.length === 0) {
            summaryEl.innerHTML = `Select at least one day`;
        } else if (days.length === 7) {
            summaryEl.innerHTML = `Runs every day at <strong>${time}</strong>`;
        } else if (days.length === 1) {
            summaryEl.innerHTML = `Runs every ${days[0]} at <strong>${time}</strong>`;
        } else {
            const lastDay = days.pop();
            summaryEl.innerHTML = `Runs every ${days.join(', ')} and ${lastDay} at <strong>${time}</strong>`;
        }
    } else if (frequency === 'month') {
        const daySelect = document.querySelector(`.schedule-day-of-month[data-usecase="${useCaseId}"]`);
        const day = daySelect ? daySelect.options[daySelect.selectedIndex].text : '15th';
        summaryEl.innerHTML = `Runs on the ${day} of every month at <strong>${time}</strong>`;
    }
}

// Format time from 24h to 12h format
function formatTime(time24) {
    if (!time24) return '9:00 AM';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

// Make schedule functions globally accessible
window.setRunMode = setRunMode;
window.initSchedulePicker = initSchedulePicker;
window.updateScheduleOptions = updateScheduleOptions;
window.updateScheduleSummary = updateScheduleSummary;

function loadPlugin() {
    const pluginPath = document.getElementById('plugin-path').value;
    const statusEl = document.getElementById('plugin-status');
    
    statusEl.innerHTML = '<span class="loading">Verifying plugin...</span>';
    
    // Simulate loading the plugin
    setTimeout(() => {
        statusEl.innerHTML = `
            <span class="success">✅ Plugin loaded successfully</span>
            <div class="plugin-info">
                <strong>Name:</strong> Vulnerability Remediation<br>
                <strong>Version:</strong> 1.2.3<br>
                <strong>Description:</strong> Automatically fix security vulnerabilities
            </div>
        `;
    }, 1500);
}

function saveCustomUseCase() {
    const name = document.getElementById('custom-usecase-name').value;
    if (!name) {
        alert('Please enter a use case name');
        return;
    }
    
    // Gather all the form data
    const actionType = document.querySelector('input[name="action-type"]:checked').value;
    const pluginPath = document.getElementById('plugin-path').value;
    const customPrompt = document.getElementById('custom-prompt').value;
    const triggerType = document.querySelector('input[name="trigger-type"]:checked').value;
    const triggerPlatform = document.getElementById('trigger-platform').value;
    const triggerEvent = document.getElementById('trigger-event').value;
    const triggerLabel = document.getElementById('trigger-label').value;
    const scheduleDay = document.getElementById('schedule-day').value;
    const scheduleTime = document.getElementById('schedule-time').value;
    
    // Create unique ID for the custom use case
    const useCaseId = 'custom-' + name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    
    // Store the custom use case data
    const customUseCase = {
        id: useCaseId,
        name: name,
        actionType: actionType,
        pluginPath: actionType === 'plugin' ? pluginPath : null,
        customPrompt: actionType === 'prompt' ? customPrompt : null,
        triggerType: triggerType,
        triggerPlatform: triggerType === 'event' ? triggerPlatform : null,
        triggerEvent: triggerType === 'event' ? triggerEvent : null,
        triggerLabel: triggerEvent === 'label-added' ? triggerLabel : null,
        scheduleDay: triggerType === 'schedule' ? scheduleDay : null,
        scheduleTime: triggerType === 'schedule' ? scheduleTime : null
    };
    
    // Store in a global array for reference
    if (!window.customUseCases) {
        window.customUseCases = [];
    }
    window.customUseCases.push(customUseCase);
    
    console.log('Custom use case saved:', customUseCase);
    closeNewUseCaseModal();
    
    // Add the custom use case to the list
    const useCasesList = document.querySelector('.use-cases-list');
    const newUseCaseEl = document.createElement('div');
    newUseCaseEl.className = 'use-case-item custom';
    newUseCaseEl.dataset.usecase = useCaseId;
    
    // Determine trigger summary for display
    let triggerSummary = '';
    if (triggerType === 'schedule') {
        triggerSummary = `Schedule: ${scheduleDay} at ${scheduleTime}`;
    } else {
        const platformLabel = triggerPlatform.charAt(0).toUpperCase() + triggerPlatform.slice(1);
        const eventLabel = triggerEvent.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        triggerSummary = `${platformLabel} - ${eventLabel}`;
        if (triggerEvent === 'label-added' && triggerLabel) {
            triggerSummary += ` '${triggerLabel}'`;
        }
    }
    
    newUseCaseEl.innerHTML = `
        <div class="use-case-checkbox">
            <span class="checkbox-icon">✓</span>
        </div>
        <div class="use-case-info">
            <h3>🔧 ${name}</h3>
            <p class="use-case-trigger">${triggerSummary}</p>
        </div>
        <div class="use-case-actions">
            <button class="btn-icon edit" onclick="event.stopPropagation(); editCustomUseCase('${useCaseId}')" title="Edit">✏️</button>
            <button class="btn-icon delete" onclick="event.stopPropagation(); deleteCustomUseCase('${useCaseId}')" title="Delete">🗑️</button>
        </div>
    `;
    useCasesList.appendChild(newUseCaseEl);
    
    // Create the details panel for this custom use case
    createCustomUseCaseDetailsPanel(customUseCase);
    
    // Add click handler for the new use case item
    newUseCaseEl.addEventListener('click', (e) => {
        // Don't trigger if clicking on action buttons
        if (e.target.closest('.use-case-actions')) return;
        handleUseCaseClick(newUseCaseEl, useCaseId);
    });
}

function createCustomUseCaseDetailsPanel(useCase) {
    const detailsContainer = document.querySelector('.use-case-details');
    
    // Build the action section
    let actionSection = '';
    if (useCase.actionType === 'plugin') {
        actionSection = `
            <div class="detail-section">
                <h4>Plugin:</h4>
                <code class="plugin-display">${useCase.pluginPath}</code>
            </div>
        `;
    } else {
        actionSection = `
            <div class="detail-section">
                <h4>Custom Prompt:</h4>
                <div class="prompt-display">${useCase.customPrompt || '(No prompt specified)'}</div>
            </div>
        `;
    }
    
    // Build the trigger section
    let triggerSection = '';
    if (useCase.triggerType === 'schedule') {
        const dayLabel = useCase.scheduleDay === 'daily' ? 'Daily' : `Every ${useCase.scheduleDay.charAt(0).toUpperCase() + useCase.scheduleDay.slice(1)}`;
        triggerSection = `
            <div class="detail-section">
                <h4>Schedule:</h4>
                <div class="schedule-display">
                    <span class="schedule-badge">🗓️ ${dayLabel} at ${useCase.scheduleTime}</span>
                </div>
            </div>
        `;
    } else {
        const platformLabel = useCase.triggerPlatform.charAt(0).toUpperCase() + useCase.triggerPlatform.slice(1);
        const eventLabel = useCase.triggerEvent.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        let triggerText = `${platformLabel} - ${eventLabel}`;
        if (useCase.triggerEvent === 'label-added' && useCase.triggerLabel) {
            triggerText += ` '${useCase.triggerLabel}'`;
        }
        triggerSection = `
            <div class="detail-section">
                <h4>Event Trigger:</h4>
                <div class="trigger-display">
                    <span class="trigger-badge">${triggerText}</span>
                </div>
            </div>
        `;
    }
    
    // Create the details panel
    const detailsPanel = document.createElement('div');
    detailsPanel.className = 'details-content custom-details';
    detailsPanel.id = `details-${useCase.id}`;
    detailsPanel.style.display = 'none';
    detailsPanel.innerHTML = `
        <h2>🔧 ${useCase.name}</h2>
        <p class="detail-description">Custom use case created by you.</p>
        
        <div class="detail-section">
            <h4>Type:</h4>
            <span class="type-badge ${useCase.actionType}">${useCase.actionType === 'plugin' ? '🔌 Plugin' : '📝 Custom Prompt'}</span>
        </div>
        
        ${actionSection}
        ${triggerSection}
    `;
    
    detailsContainer.appendChild(detailsPanel);
}

function handleUseCaseClick(element, useCaseId) {
    const useCaseItems = document.querySelectorAll('.use-case-item');
    const detailsPlaceholder = document.querySelector('.details-placeholder');
    const detailsContents = document.querySelectorAll('.details-content');
    
    // Toggle selection
    element.classList.toggle('selected');
    
    // Update state (we need to access it from the main scope)
    // For now, we'll handle this via a custom event or global
    if (element.classList.contains('selected')) {
        if (!window.selectedUseCases) window.selectedUseCases = [];
        if (!window.selectedUseCases.includes(useCaseId)) {
            window.selectedUseCases.push(useCaseId);
        }
    } else {
        if (window.selectedUseCases) {
            window.selectedUseCases = window.selectedUseCases.filter(u => u !== useCaseId);
        }
    }
    
    // Show details
    detailsPlaceholder.style.display = 'none';
    detailsContents.forEach(d => d.style.display = 'none');
    
    const detailEl = document.getElementById(`details-${useCaseId}`);
    if (detailEl) {
        detailEl.style.display = 'block';
    }
    
    // Mark as viewing
    useCaseItems.forEach(i => i.classList.remove('viewing'));
    element.classList.add('viewing');
    
    // Update next button
    updateUseCaseNextButton();
}

function updateUseCaseNextButton() {
    const step4 = document.getElementById('step-4');
    const nextBtn = step4.querySelector('[data-action="next"]');
    const selectedItems = document.querySelectorAll('.use-case-item.selected');
    if (nextBtn) {
        nextBtn.disabled = selectedItems.length === 0;
    }
}

// Edit custom use case
function editCustomUseCase(useCaseId) {
    if (!window.customUseCases) return;
    
    const useCase = window.customUseCases.find(uc => uc.id === useCaseId);
    if (!useCase) return;
    
    // Store the ID being edited
    window.editingUseCaseId = useCaseId;
    
    // Open the modal and populate with existing values
    const modal = document.getElementById('new-usecase-modal');
    modal.style.display = 'flex';
    
    // Update modal title
    modal.querySelector('.modal-header h2').textContent = 'Edit Use Case';
    modal.querySelector('.modal-footer .btn-primary').textContent = 'Save Changes';
    
    // Populate form fields
    document.getElementById('custom-usecase-name').value = useCase.name;
    
    // Set action type
    const actionRadio = document.querySelector(`input[name="action-type"][value="${useCase.actionType}"]`);
    if (actionRadio) {
        actionRadio.checked = true;
        toggleActionType();
    }
    
    if (useCase.actionType === 'plugin') {
        document.getElementById('plugin-path').value = useCase.pluginPath || '';
    } else {
        document.getElementById('custom-prompt').value = useCase.customPrompt || '';
    }
    
    // Set trigger type
    const triggerRadio = document.querySelector(`input[name="trigger-type"][value="${useCase.triggerType}"]`);
    if (triggerRadio) {
        triggerRadio.checked = true;
        toggleTriggerType();
    }
    
    if (useCase.triggerType === 'event') {
        document.getElementById('trigger-platform').value = useCase.triggerPlatform || 'jira';
        updateTriggerEvents();
        document.getElementById('trigger-event').value = useCase.triggerEvent || 'new-issue';
        if (useCase.triggerEvent === 'label-added') {
            document.getElementById('label-input-group').style.display = 'block';
            document.getElementById('trigger-label').value = useCase.triggerLabel || '';
        }
    } else {
        document.getElementById('schedule-day').value = useCase.scheduleDay || 'daily';
        document.getElementById('schedule-time').value = useCase.scheduleTime || '09:00';
    }
}

// Delete custom use case
function deleteCustomUseCase(useCaseId) {
    if (!confirm('Are you sure you want to delete this use case?')) return;
    
    // Remove from customUseCases array
    if (window.customUseCases) {
        window.customUseCases = window.customUseCases.filter(uc => uc.id !== useCaseId);
    }
    
    // Remove the list item
    const listItem = document.querySelector(`.use-case-item[data-usecase="${useCaseId}"]`);
    if (listItem) {
        listItem.remove();
    }
    
    // Remove the details panel
    const detailsPanel = document.getElementById(`details-${useCaseId}`);
    if (detailsPanel) {
        detailsPanel.remove();
    }
    
    // Show placeholder if no use case is being viewed
    const visibleDetails = document.querySelector('.details-content[style*="block"]');
    if (!visibleDetails) {
        document.querySelector('.details-placeholder').style.display = 'flex';
    }
    
    // Update next button state
    updateUseCaseNextButton();
}

// Update saveCustomUseCase to handle edits
const originalSaveCustomUseCase = saveCustomUseCase;
saveCustomUseCase = function() {
    const name = document.getElementById('custom-usecase-name').value;
    if (!name) {
        alert('Please enter a use case name');
        return;
    }
    
    // Check if we're editing an existing use case
    if (window.editingUseCaseId) {
        updateExistingUseCase(window.editingUseCaseId);
        return;
    }
    
    // Otherwise, call the original function to create a new one
    originalSaveCustomUseCase();
};

function updateExistingUseCase(useCaseId) {
    // Gather form data
    const name = document.getElementById('custom-usecase-name').value;
    const actionType = document.querySelector('input[name="action-type"]:checked').value;
    const pluginPath = document.getElementById('plugin-path').value;
    const customPrompt = document.getElementById('custom-prompt').value;
    const triggerType = document.querySelector('input[name="trigger-type"]:checked').value;
    const triggerPlatform = document.getElementById('trigger-platform').value;
    const triggerEvent = document.getElementById('trigger-event').value;
    const triggerLabel = document.getElementById('trigger-label').value;
    const scheduleDay = document.getElementById('schedule-day').value;
    const scheduleTime = document.getElementById('schedule-time').value;
    
    // Update the use case in the array
    const useCase = window.customUseCases.find(uc => uc.id === useCaseId);
    if (useCase) {
        useCase.name = name;
        useCase.actionType = actionType;
        useCase.pluginPath = actionType === 'plugin' ? pluginPath : null;
        useCase.customPrompt = actionType === 'prompt' ? customPrompt : null;
        useCase.triggerType = triggerType;
        useCase.triggerPlatform = triggerType === 'event' ? triggerPlatform : null;
        useCase.triggerEvent = triggerType === 'event' ? triggerEvent : null;
        useCase.triggerLabel = triggerEvent === 'label-added' ? triggerLabel : null;
        useCase.scheduleDay = triggerType === 'schedule' ? scheduleDay : null;
        useCase.scheduleTime = triggerType === 'schedule' ? scheduleTime : null;
    }
    
    // Update the list item
    const listItem = document.querySelector(`.use-case-item[data-usecase="${useCaseId}"]`);
    if (listItem) {
        let triggerSummary = '';
        if (triggerType === 'schedule') {
            triggerSummary = `Schedule: ${scheduleDay} at ${scheduleTime}`;
        } else {
            const platformLabel = triggerPlatform.charAt(0).toUpperCase() + triggerPlatform.slice(1);
            const eventLabel = triggerEvent.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            triggerSummary = `${platformLabel} - ${eventLabel}`;
            if (triggerEvent === 'label-added' && triggerLabel) {
                triggerSummary += ` '${triggerLabel}'`;
            }
        }
        
        listItem.querySelector('h3').textContent = `🔧 ${name}`;
        listItem.querySelector('.use-case-trigger').textContent = triggerSummary;
    }
    
    // Update the details panel
    const detailsPanel = document.getElementById(`details-${useCaseId}`);
    if (detailsPanel) {
        detailsPanel.remove();
    }
    createCustomUseCaseDetailsPanel(useCase);
    
    // Clean up and close modal
    window.editingUseCaseId = null;
    closeNewUseCaseModal();
    
    // Reset modal title
    const modal = document.getElementById('new-usecase-modal');
    modal.querySelector('.modal-header h2').textContent = 'Create Custom Use Case';
    modal.querySelector('.modal-footer .btn-primary').textContent = 'Create Use Case';
}

// Export functions to window for inline HTML event handlers
window.openEnterpriseModal = openEnterpriseModal;
window.closeEnterpriseModal = closeEnterpriseModal;
window.saveEnterpriseConfig = saveEnterpriseConfig;
window.connectIntegration = connectIntegration;
window.openNewUseCaseModal = openNewUseCaseModal;
window.closeNewUseCaseModal = closeNewUseCaseModal;
window.toggleActionType = toggleActionType;
window.toggleTriggerType = toggleTriggerType;
window.updateTriggerEvents = updateTriggerEvents;
window.loadPlugin = loadPlugin;
window.saveCustomUseCase = saveCustomUseCase;
window.handleUseCaseClick = handleUseCaseClick;
window.editCustomUseCase = editCustomUseCase;
window.deleteCustomUseCase = deleteCustomUseCase;
