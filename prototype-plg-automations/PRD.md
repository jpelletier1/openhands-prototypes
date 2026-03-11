We are going to generate an example PLG user journey prototype. This is a prototype so we are looking to communicate a hypothetical workflow, not an actual app implementation. Code this in HTML, CSS, and Javascript. You may decide to create multiple HTML pages that link together to help with the flow.

The look and feel should be similar to the color scheme found in index.html.

Here is the user journey we need to implement - each of these are a step in the wizard:

1. Login page
User lands on a login page with buttons for the following Git providers: GitHub, Bitbucket, GitLab

2. Post-login
After logging into the app, a few questions are presented to the user - this is so we can profile who they are
- What's your role?
- Are you evaluating this for personal reasons, or related to an organizational initiative?
- What size org do you work for?


3. Use case selection
The user is presented with a series of use cases they can install into the Git provider they logged in with. This is multi-selectable. There should be good descriptions of each. Maybe a lsit of use acses on the left, and detailed description with examples of how to trigger that appear on right-size of screen. These use cases are:
- PRD refinement: triggers on GitHub issues with the tag: `openhands:refine`
- Spec generator: triggers on GitHub issues with label 'openhands:spec'
- Refactor: triggers on PRs when tagged with `openhands:refactor`
- Dependency upgrades: triggers on issues that indicate certain dependencis need upgraading - `openhands:upgrade`
- Bug fixer: triggers on issues labeled `bug`
- PR review: triggers on issues marked `openhands:review`
- Vulnerability remediation: Triggers on issues marked `openhands:remediate`
- CI failure fixer: triggers automatically on CI failures

4. Repo selection
The system should fetch repos the user has access to, and ask which repos they would like to install these use cases into. The system should list the repos on the left-side of teh page, with the ability to typeahead and filter the list automatically. The user should then select the repos and they will be added to a list on the right side of the page for confirmation.

5. Runtime environment
The user is then presented with a question on where they want to run the agents: Local or in OpenHands Cloud. This should display a table that explains the feature differences. What you don't get with local, but do get with openHands Cloud
- Monitor live conversation progress. _Enables real-time human-in-the-loop control and visibility into conversation logs._
- Centralized access to all conversation data. _Important for auditability and any troubleshooting._
- Multi-user RBAC. _Important for granting developers access to conversation logs._
- Read-only conversation sharing. _Share links to previous conversation logs._
- Scalable and secure agent runtimes. _Agent runtimes designed for scale and secure agent execution outside of your devloper machines._

6. Model selection 
The user should then decide if they want to use OpenHands LLM provider (at cost), or provide their own provider and key. There should also be a third option of "Get $50 in credits if you provide a valid business email" to encourage OpenHands LLM provider usage.

6. Installation process
Based on the user decions in step 3-6, the system should automatically create github workflows that install themselves in a .github directory in the repo. This page should give a progress bar for monitoring install. Make sure its 5 seconds.

7. Tutorial page
COnfirm to the user that the github workflows have been installed. Then provide them with a personalized set of instructions that explain how to interact with each use case. 

8. Monitor progress
If the user selected "OpenHands Cloud" in step 5, the monitoring page should display some stats about usage
- Top of page, high level cards: Total Convos, Convos last 24h, OpenHands-assisted PRs, Cost per Task
- Middle of page - rankings: Convos by repo, Top Use cases by # of COnvos
- Bottom of page: Graph - daily conversation count last 30 days

If the user selected "Local" on step 5, this page should be blurred with a banner that says "No visibility into convesation metrics. [Configure Workflows to use OpenHands CLoud](link to step 5)

Additiona Guidance:

The left-hand Nav should say:
- Dashboard (this is the "Monitoring" page described in Step 8. If the user hasn't setup OpenHands yet, the Dashboard page should direct the user to the Wizard)
- Install Use Cases (this is a link to the wiard)

When the wizard is in-use, the steps shoudl appear as sub-steps under the "Install Use Cases" nav item