# Animate UI source attribution

Source: https://github.com/imskyleen/animate-ui
Upstream commit: efeb96ffd7a3b7a4868667e4ac3c346620fb3044
Registry fetched 2026-10-04:
- https://animate-ui.com/r/primitives-buttons-button.json
- https://animate-ui.com/r/primitives-animate-slot.json

Original paths: apps/www/registry/primitives/buttons/button/index.tsx and apps/www/registry/primitives/animate/slot/index.tsx.
License: MIT + Commons Clause License Condition (not plain MIT); full original text in LICENSE.txt. These components are incorporated only as part of this website, not distributed as a standalone component library.
Changes: local import path; class name join utility replacing the upstream Tailwind class merge helper (this app passes no conflicting Tailwind classes).
Actual reused code: Animate UI Button and its Slot primitive. Result changes, collection indicator, cards and native dialog transitions use Motion directly. Website-only dependencies do not enter the SDK runtime or exported package.
