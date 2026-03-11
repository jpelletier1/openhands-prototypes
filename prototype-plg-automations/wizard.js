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
        selectedUseCases: [],
        selectedRepos: [],
        runtime: null,
        modelOption: null,
        apiKey: null,
        businessEmail: null,
        setupComplete: false
    };

    // Use case descriptions data with documentation URLs
    const useCaseData = {
        'prd-refinement': {
            name: 'PRD Refinement',
            trigger: 'openhands:refine',
            emoji: '📝',
            triggerType: 'issue',
            docUrl: 'https://docs.openhands.dev/workflows/prd-refinement',
            description: 'Automatically analyze and refine Product Requirements Documents by identifying gaps, suggesting improvements, and adding technical specifications.'
        },
        'spec-generator': {
            name: 'Spec Generator',
            trigger: 'openhands:spec',
            emoji: '📋',
            triggerType: 'issue',
            docUrl: 'https://docs.openhands.dev/workflows/spec-generator',
            description: 'Generate detailed technical specifications from high-level requirements, including architecture diagrams, API contracts, and implementation plans.'
        },
        'refactor': {
            name: 'Refactor',
            trigger: 'openhands:refactor',
            emoji: '🔄',
            triggerType: 'pr',
            docUrl: 'https://docs.openhands.dev/workflows/refactor',
            description: 'Intelligently refactor code in pull requests to improve code quality, readability, and maintainability while preserving functionality.'
        },
        'dependency-upgrades': {
            name: 'Dependency Upgrades',
            trigger: 'openhands:upgrade',
            emoji: '📦',
            triggerType: 'issue',
            docUrl: 'https://docs.openhands.dev/workflows/dependency-upgrades',
            description: 'Automatically upgrade project dependencies, handle breaking changes, and ensure compatibility across your codebase.'
        },
        'bug-fixer': {
            name: 'Bug Fixer',
            trigger: 'bug',
            emoji: '🐛',
            triggerType: 'issue',
            docUrl: 'https://docs.openhands.dev/workflows/bug-fixer',
            description: 'Automatically investigate and fix bugs based on issue descriptions, error logs, and reproduction steps.'
        },
        'pr-review': {
            name: 'PR Review',
            trigger: 'openhands:review',
            emoji: '👀',
            triggerType: 'pr',
            docUrl: 'https://docs.openhands.dev/workflows/pr-review',
            description: 'Perform comprehensive code reviews on pull requests, identifying issues, suggesting improvements, and ensuring code quality standards.'
        },
        'vulnerability-remediation': {
            name: 'Vulnerability Remediation',
            trigger: 'openhands:remediate',
            emoji: '🔒',
            triggerType: 'issue',
            docUrl: 'https://docs.openhands.dev/workflows/vulnerability-remediation',
            description: 'Automatically fix security vulnerabilities identified by security scanners and dependency audits.'
        },
        'ci-failure-fixer': {
            name: 'CI Failure Fixer',
            trigger: 'automatic',
            emoji: '🔧',
            triggerType: 'ci',
            docUrl: 'https://docs.openhands.dev/workflows/ci-failure-fixer',
            description: 'Automatically analyze and fix CI pipeline failures, including test failures, linting errors, and build issues.'
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
            localView.style.display = 'none';
        } else if (state.runtime === 'cloud') {
            notSetupView.style.display = 'none';
            cloudView.style.display = 'block';
            localView.style.display = 'none';
            populateMonitoringData();
        } else {
            notSetupView.style.display = 'none';
            cloudView.style.display = 'none';
            localView.style.display = 'block';
        }
    }

    // Navigation functions for wizard steps
    function goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > 7) return;
        
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
        
        // Special handling for certain steps
        if (stepNumber === 4) {
            populateRepoList();
        }
        if (stepNumber === 7) {
            startInstallation();
        }
    }

    // Make goToStep available globally for onclick handlers
    window.goToStep = goToStep;

    function validateStep(stepNumber) {
        switch (stepNumber) {
            case 2:
                return state.profile.role && state.profile.purpose && state.profile.orgSize;
            case 3:
                return state.selectedUseCases.length > 0;
            case 4:
                return state.selectedRepos.length > 0;
            case 5:
                return state.runtime !== null;
            case 6:
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

    // Step 3: Use case selection handlers
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
            
            updateNextButton(3);
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

    // Step 4: Repo selection
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
        updateNextButton(4);
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
        updateNextButton(4);
    };

    // Repo search
    const repoSearch = document.getElementById('repo-search');
    if (repoSearch) {
        repoSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const repoItems = document.querySelectorAll('.repo-item');
            
            repoItems.forEach(item => {
                const name = item.dataset.repo.toLowerCase();
                item.style.display = name.includes(query) ? 'flex' : 'none';
            });
        });
    }

    // Step 5: Runtime selection
    const runtimeCards = document.querySelectorAll('.runtime-card');
    runtimeCards.forEach(card => {
        card.addEventListener('click', () => {
            runtimeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.runtime = card.dataset.runtime;
            updateNextButton(5);
        });
    });

    // Step 6: Model selection
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
            
            updateNextButton(6);
        });
    });

    // BYOK inputs
    const providerSelect = document.getElementById('provider-select');
    const apiKeyInput = document.getElementById('api-key-input');
    if (providerSelect) {
        providerSelect.addEventListener('change', () => updateNextButton(6));
    }
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', () => updateNextButton(6));
    }

    // Business email input
    const businessEmail = document.getElementById('business-email');
    if (businessEmail) {
        businessEmail.addEventListener('input', () => {
            state.businessEmail = businessEmail.value;
            updateNextButton(6);
        });
    }

    // Step 7: Installation
    function startInstallation() {
        const progressFill = document.getElementById('install-progress');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');
        const installLog = document.getElementById('install-log');
        
        installLog.innerHTML = '';
        progressFill.style.width = '0%';
        
        const steps = [
            { message: 'Initializing connection...', progress: 5 },
            { message: `Authenticating with ${state.provider}...`, progress: 15 },
            { message: 'Fetching repository information...', progress: 25 },
            ...state.selectedRepos.flatMap((repo, i) => [
                { message: `Creating .github/workflows in ${repo}...`, progress: 30 + (i * 15) },
                { message: `Installing workflows for ${repo}...`, progress: 35 + (i * 15) }
            ]),
            { message: 'Validating workflow configurations...', progress: 85 },
            { message: 'Finalizing installation...', progress: 95 },
            { message: 'Installation complete!', progress: 100, success: true }
        ];
        
        let currentIndex = 0;
        const stepDuration = 5000 / steps.length; // Total 5 seconds
        
        function runStep() {
            if (currentIndex >= steps.length) {
                setTimeout(showTutorial, 500);
                return;
            }
            
            const step = steps[currentIndex];
            
            // Add log entry
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${step.success ? 'success' : 'processing'}`;
            logEntry.textContent = `${step.success ? '✓' : '→'} ${step.message}`;
            installLog.appendChild(logEntry);
            installLog.scrollTop = installLog.scrollHeight;
            
            // Update progress
            progressFill.style.width = `${step.progress}%`;
            progressPercentage.textContent = `${step.progress}%`;
            progressStatus.textContent = step.message;
            
            currentIndex++;
            setTimeout(runStep, stepDuration);
        }
        
        runStep();
    }

    function showTutorial() {
        document.getElementById('installing-view').style.display = 'none';
        document.getElementById('tutorial-view').style.display = 'block';
        
        // Mark setup as complete
        state.setupComplete = true;
        
        const tutorialCards = document.getElementById('tutorial-cards');
        tutorialCards.innerHTML = '';
        
        state.selectedUseCases.forEach(usecase => {
            const data = useCaseData[usecase];
            if (!data) return;
            
            let triggerInfo = '';
            if (data.triggerType === 'issue') {
                triggerInfo = `Add label <code>${data.trigger}</code> to any GitHub issue`;
            } else if (data.triggerType === 'pr') {
                triggerInfo = `Add label <code>${data.trigger}</code> to any Pull Request`;
            } else if (data.triggerType === 'ci') {
                triggerInfo = `Runs <code>automatically</code> when CI fails`;
            }
            
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
                    <strong>How to trigger:</strong> ${triggerInfo}
                </div>
            `;
            tutorialCards.appendChild(card);
        });
    }

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
    }
});
