# Forum and Chat Integration Architecture

Forum and chat are separate services but connected by identity and membership semantics.

## Forum Service Role

Owns:

- forums
- memberships
- threads
- posts
- reactions

## Chat Service Role

Owns:

- message persistence
- real-time Socket.IO flow

## Integration Contract

Before exposing or accepting group messages, chat validates user identity and forum/group membership.

## Why Split These Services

- Forum data model and moderation workflows evolve independently.
- Chat throughput and real-time concerns can scale separately.
- Clear boundary reduces accidental coupling between async chat and structured discussion features.

## Design Outcome

Users get coherent social features while the platform keeps clean operational domains.
