# Initialize this Foundry pack

Prerequisites: Node 24.22 or newer Node 24 with its npm 11, Git, registry access,
and your own configured Git identity (`git config user.name` and `git config user.email`).
Use an empty folder, optionally already a Git repository with README/LICENSE,
.gitignore, .gitattributes or .editorconfig. Drop the complete pack here.

Tell the agent: **Read SETUP.md and initialize.** Run exactly:

```text
node init.mjs
```

The script stages the scaffold, installs the shipped dependency lockfile, places
all files, verifies types, zero-warning lint, app and Storybook builds, checks
DevBar is absent from production, makes the setup commit using your identity,
and starts both servers. It stores the default designer role in local Git config.
Keep this process running; Ctrl-C stops both servers. App: http://localhost:5173;
Storybook: http://localhost:6006. No product UI is created.

**On any error, show the complete error verbatim and stop.** Do not edit files,
change dependencies, switch role or rerun tools to improvise a repair. Failed
staging paths and logs are printed for diagnosis. Do not claim a check passed
if it did not run. Browser rendering tests run in Foundry CI from Phase 4.

After successful initialization, report the checks and both URLs, then ask:
**Are you working as the Designer (UI only) or the Front-end developer
(integration, logic, state, API)?** Until answered, assume Designer. Follow
AGENTS.md: for a designer, next ask 2–3 short questions (product, users, any
rules) and draft `design/app.design.md` (AGENTS.md §2b). A developer records their own role with
`git config --local foundry.role developer`; never commit a role file.

GitLab maintainers: open **Project > Settings > CI/CD > Variables > Add variable**.
Set `FOUNDRY_DEVELOPERS` to comma-separated GitLab usernames (for example
`denys,alice`). Make it available to merge-request and default-branch pipelines,
including unprotected branches; do not mark it protected-only. CI compares
`GITLAB_USER_LOGIN` exactly with the trimmed entries. Missing or unlisted users
get designer scope. Never store the list or a role in the candidate branch.
The v1 check catches mistakes and agent drift; it is a seatbelt, not an approval
lock. Project administrators can replace a pipeline. Protected configuration
and required approvals remain deferred (decisions A/B).
