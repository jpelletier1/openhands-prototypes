# OpenHands UI Templates

A collection of modern, dark-themed UI templates for the OpenHands platform, built with vanilla HTML, CSS, and JavaScript.

## Templates

### 1. PLG Setup Wizard (`wizard.html`)

A Product-Led Growth (PLG) onboarding experience with two main sections:

#### Navigation
- **Dashboard** - Monitoring and analytics view
- **Install Use Cases** - 7-step setup wizard (expands to show sub-steps)

#### Dashboard
Shows different views based on setup state:
- **Not Set Up**: Welcome screen with "Install Use Cases" CTA
- **Cloud Runtime**: Full analytics dashboard with stats, rankings, and charts
- **Local Runtime**: Blurred preview with upgrade prompt

#### Install Use Cases (7-step wizard)
1. **Login** - Connect with GitHub, Bitbucket, or GitLab
2. **Profile** - User profiling questions (role, purpose, org size)
3. **Use Cases** - Select AI-powered automations to install:
   - PRD Refinement (`openhands:refine`)
   - Spec Generator (`openhands:spec`)
   - Refactor (`openhands:refactor`)
   - Dependency Upgrades (`openhands:upgrade`)
   - Bug Fixer (`bug`)
   - PR Review (`openhands:review`)
   - Vulnerability Remediation (`openhands:remediate`)
   - CI Failure Fixer (automatic)
4. **Repositories** - Select repositories to install workflows
5. **Runtime** - Choose Local or OpenHands Cloud execution
6. **LLM Provider** - Select AI model provider (OpenHands, BYOK, or Free Credits)
7. **Installation & Tutorial** - Automated workflow installation with progress tracking, followed by personalized tutorials with **shareable documentation links** (copy/paste URLs)

**Files:**
- `wizard.html` - Wizard structure
- `wizard.css` - Wizard styles
- `wizard.js` - Wizard logic and interactions

### 2. Conversation Interface (`index.html`)

A modern conversation interface for code repository interactions.

## Features

- **Modern Dark UI**: Clean, professional dark theme with high contrast
- **Repository Controls**: Quick access to repo, branch, pull, push, and pull request actions
- **AI Chat Interface**: Interactive chat input with AI status updates
- **Action Buttons**: Header toolbar with quick access to changes, browser, code editor, terminal, and share functions
- **Canvas Panel**: Right-side panel for displaying code changes and diffs
- **Emoji Icons**: No image dependencies - all icons use emojis for simplicity
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Shortcuts**: Enhanced productivity with keyboard navigation

## File Structure

```
usecase-sdk-plg/
├── wizard.html     # PLG Setup Wizard
├── wizard.css      # Wizard styles
├── wizard.js       # Wizard functionality
├── index.html      # Conversation Interface
├── styles.css      # Conversation styles
├── script.js       # Conversation functionality
├── PRD.md          # Product requirements
└── README.md       # Documentation
```

## Usage

### PLG Wizard
1. **Open the wizard**: Open `wizard.html` in a modern web browser
2. **Follow the steps**: The wizard guides you through the complete setup process
3. **Login**: Click on your preferred Git provider
4. **Profile**: Answer the profiling questions
5. **Use Cases**: Select which automations you want to install
6. **Repos**: Choose repositories from the list
7. **Runtime**: Select Local or Cloud execution
8. **LLM**: Choose your AI model provider
9. **Install**: Watch the progress as workflows are installed

### Conversation Interface
1. **Open the interface**: Simply open `index.html` in a modern web browser
2. **Chat input**: Type your message in the "What do you want to build?" input field
3. **Git controls**: Use the bottom controls for repository operations
4. **Header actions**: Click toolbar buttons to access different views (changes, browser, code editor, terminal, share)
5. **Canvas panel**: View code changes and diffs in the right panel (50% of screen width)
6. **Navigation**: Use the sidebar menu icon for navigation

## Keyboard Shortcuts

- **Cmd/Ctrl + K**: Focus and select chat input
- **Enter**: Send message
- **Escape**: Clear input and unfocus

## Components

### Sidebar
- Logo display (🚀)
- Menu icon (☰)
- User avatar (😊)

### Header
- **Project Title**: Display current project name
- **Action Buttons**: Quick access toolbar (✅ Changes, 🌐 Browser, 💻 Code Editor, ⌨️ Terminal, 🔗 Share, 📂 Drawer)
- Spans full width above both panels

### Main Content Area (Left Panel - 50% width)
- **Chat Controls**: AI chat input (🤖) with send button (⬆️)
- **Status Bar**: Shows tools (🔧), running status (▶️), and agent initialization (🔄)
- **Git Controls**: Repository management buttons (📁 Repo, 🌿 Branch, ⬇️ Pull, ⬆️ Push, 🔀 Pull Request)
- Resizes responsively to maintain 50% width

### Canvas Panel (Right Panel - 50% width)
- Displays code changes, diffs, and output
- Shows empty state (📋) when no changes are available
- Resizes responsively to maintain 50% width
- Stacks vertically on smaller screens (< 1200px)

## Customization

### Colors
The main colors used in the interface:
- Background: `#0d0f11`
- Card background: `#25272d`
- Border: `#525252`
- Text: `#ffffff` (white) and `#a1a1a1` (gray)
- Accent: `#dedfe0`

### Fonts
- Primary: SF Pro, system fonts fallback
- Sizes: 11px - 32px based on hierarchy

### Styling
All styles are in `styles.css`. Key sections:
- `.conversation-container`: Main flex layout
- `.sidebar`: Left navigation (75px fixed width)
- `.content-wrapper`: Wraps header and content areas (flex column)
- `.top-header`: Header spanning full width
- `.content-row`: Flex row container for 50/50 layout
- `.main-content`: Left panel with chat controls (flex: 1, 50% width)
- `.canvas-panel`: Right panel for code display (flex: 1, 50% width)

Both panels resize responsively and maintain equal width ratios.

## JavaScript Functionality

The `script.js` file includes:
- Chat input handling and message sending
- Git control button interactions
- Header action button handlers
- Status message updates (auto-rotating)
- Keyboard shortcuts (Cmd/Ctrl+K, Enter, Escape)
- Auto-focus on chat input

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Notes

- All icons use emojis - no external image dependencies required
- The interface is designed to be a template - add your backend integration as needed
- **Responsive 50/50 Layout**: Main content and canvas panel each occupy 50% of available width
- Both panels resize dynamically when the browser window is resized
- On screens smaller than 1200px, panels stack vertically
- Fully functional without any build process or dependencies

## Development

To modify the interface:

1. **HTML**: Edit `index.html` to change structure
2. **Styling**: Update `styles.css` for visual changes
3. **Functionality**: Modify `script.js` for interactive features

## Integration

To integrate with your application:

1. Connect the send button to your backend API
2. Implement real git operations in the git control handlers
3. Add authentication for user avatar and project data
4. Populate the canvas panel with real code changes/diffs
5. Add real-time status updates from your backend
6. Implement action button handlers (changes view, browser preview, code editor, terminal, share)

## License

This template is provided as-is for use in your projects.
