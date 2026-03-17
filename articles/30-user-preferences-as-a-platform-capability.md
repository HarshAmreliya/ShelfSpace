# User Preferences as a Platform Capability

Preferences are more than UI settings; they are a cross-cutting platform capability.

## Ownership

`user-service` owns preference state and update APIs.

## Consumers

Frontend features (dashboard, library, accessibility behavior) can consume preference contracts consistently.

## Pattern

Centralize profile/preferences in one domain to avoid drift across services.
