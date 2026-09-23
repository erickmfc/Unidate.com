-- Security and query-planning hardening for the Supabase group features.
-- Applied to project xrwsmxqxqzrqzqmyjcwt on 2026-09-22.

revoke execute on function public.sync_group_member_count() from anon, authenticated;
revoke execute on function public.create_direct_chat(uuid) from anon;
revoke execute on function public.get_active_people_count() from anon;

create index if not exists group_announcements_group_id_idx on public.group_announcements (group_id);
create index if not exists group_announcements_created_by_idx on public.group_announcements (created_by);
create index if not exists group_materials_group_id_idx on public.group_materials (group_id);
create index if not exists group_materials_shared_by_idx on public.group_materials (shared_by);
create index if not exists group_resources_group_id_idx on public.group_resources (group_id);
create index if not exists group_resources_added_by_idx on public.group_resources (added_by);
create index if not exists group_events_created_by_idx on public.group_events (created_by);
create index if not exists group_event_attendees_user_id_idx on public.group_event_attendees (user_id);
create index if not exists group_messages_sender_id_idx on public.group_messages (sender_id);
create index if not exists group_messages_reply_to_idx on public.group_messages (reply_to);
create index if not exists group_posts_author_id_idx on public.group_posts (author_id);
