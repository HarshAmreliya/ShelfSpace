# Frontend Layered Architecture: Components, Hooks, Services, and API Wrappers

The frontend architecture is intentionally layered to avoid transport logic leaking into UI components.

## Layers

1. **Presentation**: `src/app`, `src/components`
2. **Orchestration/State**: `src/hooks`, `src/contexts`
3. **Domain Services**: `src/services`
4. **Transport Wrappers**: `src/lib`

## Flow

`UI Component -> Hook -> Service -> API Wrapper -> Gateway -> Backend`

## Why This Matters

- Components stay focused on rendering and interaction.
- Hooks coordinate state and side effects.
- Services map domain operations.
- API wrappers normalize HTTP concerns and errors.

## Architecture Guardrails

- Avoid direct Axios calls in components.
- Keep endpoint URL knowledge in wrapper layer.
- Keep business transformations in services.

This separation reduces regression risk and improves maintainability.
