# Branching Strategy & Workflow Rules

- **Phase Integration Branch**: `feat/phase3-imports-reports-sync` is designated as the parent Phase 3 integration branch.
- **Feature Branches**: Every new feature for Phase 3 MUST be developed in a separate dedicated feature branch (e.g., `feat/<feature-name>` or `feature/<feature-name>`) branched off `feat/phase3-imports-reports-sync`.
- **Merging & PR Protocol**: Once a feature branch is completed and verified, push it to remote (`origin`) and create a Pull Request (PR) to merge into `feat/phase3-imports-reports-sync`. Direct local merges into the phase branch are prohibited to ensure local testing and review.
