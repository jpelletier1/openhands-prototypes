# Integrations step

In the Wizard, after a user completes their profile, have a step called "Integrations" for a user to connect to different integrations:
- Slack
- Jira
- GitHub - this should show as already connected

When a user clicks Slack or Jira, create a hypothical OAauth flow that takes them to Slack/Jira to connect, and then back to the Integrations step.

Once a user is done setting up integrations, they should have be able to click a "COntinue" button that brings them to the Use Cases page

# Use Cases step

On the Use Cases step, after a user selects an integration, the right side panel should display these use cases, with these options:
PRD Refinement
- Triggers: user should be able to multi-select one of the following: Jira/GitHub - New Issue, Jira/GitHub Add Issue Label 'openhands:refine'
- Slash command: `/prd-refinement'

Task Decomposition
- Triggers: user should be able to multi-select one of the following: Jira/GitHub Add Issue Label 'openhands:decompose'
- Slash command: `/decompose`

Spec Generator
- Weekly PR Summary
- Trigger: Users should be able to customize a schedule. Default: Fridays at 9am
- Slash command: `/pr-summary`

Code Review
- Triggers: GitHub - New PR, GitHub - add PR label 'openhands:review-this'
- Slash command: `/pr-review`

Each use case should have some descriptive content like:
- Description
- How it works 

The Use Case page should also allow the creation of a custom Use Case. There should be a "New Use Case" button above the list of use cases that lets a user:
- Define a prompt or select an existing Plugin to run.
    - If a user selects a Plugin, then pre-populate an example path: `github.com/OpenHands/extensions/plugins/vulnerability-remediation`. When the user clicks "Load Plugin", system should verify it can read the plugin contents.
    - If a user decides to enter a prompt, then show a free-text field.
- Define a schedule to run this on, or a trigger. Available triggers:
    - Jira: New Issue, Issue Comment, Issue Updated, Label Added (text field for label)
    - GitHub: New Issue, New PR, Issue Comment, PR Comment, Issue Updated, PR Updated, Label Added (text field for label)

# Runtime
- Remove Runtime step. As a result, the "Dashboard" page should always display sample dashboard metrics.



