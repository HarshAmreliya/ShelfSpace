# ShelfSpace Mermaid Diagrams

This folder contains architecture diagrams for the ShelfSpace project.
Each file is a standalone Mermaid diagram (`.mmd`).

## System / HLD
- `00_system_context.mmd`
- `01_container_view.mmd`
- `02_gateway_routing.mmd`
- `03_service_dependency_graph.mmd`
- `04_deployment_runtime.mmd`
- `20_frontend_layered_architecture.mmd`
- `23_end_to_end_request_path.mmd`

## Sequences
- `05_event_flow_analytics.mmd`
- `06_sequence_user_signup_and_bootstrap.mmd`
- `07_sequence_library_add_book.mmd`
- `08_sequence_forum_post_and_react.mmd`
- `09_sequence_chat_message_fetch.mmd`
- `10_sequence_admin_book_validation.mmd`
- `11_sequence_dashboard_load.mmd`

## Service Data Entities
- `12_er_user_service.mmd`
- `13_er_user_library_service.mmd`
- `14_er_forum_service.mmd`
- `15_er_review_service.mmd`
- `16_er_chat_service.mmd`
- `17_er_admin_service.mmd`
- `18_er_book_service_document.mmd`
- `19_er_analytics_read_model.mmd`

## State / Lifecycle
- `21_state_reading_list_lifecycle.mmd`
- `22_state_chat_session_lifecycle.mmd`

## Notes
- ER diagrams for Prisma-backed services are derived from `prisma/schema.prisma`.
- Book and analytics entities are modeled from service code (`book-service` Mongoose model and analytics projection/read model types).

## Additional Deep-Dive Diagrams
- `24_sequence_auth_verify_cross_service.mmd`
- `25_sequence_user_chat_session_message_roundtrip.mmd`
- `26_sequence_reading_list_move_books.mmd`
- `27_sequence_forum_thread_post_lifecycle.mmd`
- `28_sequence_chat_service_group_membership_guard.mmd`
- `29_sequence_admin_user_actions.mmd`
- `30_cqrs_analytics_pipeline.mmd`
- `31_data_ownership_boundaries.mmd`
- `32_security_controls_view.mmd`
- `33_failure_modes_and_recovery.mmd`
- `34_sequence_socketio_realtime_broadcast.mmd`
- `35_component_interaction_frontend_features.mmd`
