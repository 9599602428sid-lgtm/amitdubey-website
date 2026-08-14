-- Let the Supabase Dashboard Table Editor list and read casework.
-- This does not grant anon/authenticated anything, and does not expose the schema on the Data API.

grant usage on schema private to dashboard_user;

grant select on table private.investigation_cases to dashboard_user;
grant select on table private.investigation_files to dashboard_user;

create policy investigation_cases_dashboard_select
  on private.investigation_cases
  for select
  to dashboard_user
  using (true);

create policy investigation_files_dashboard_select
  on private.investigation_files
  for select
  to dashboard_user
  using (true);
