-- Investigation casework is server-only. The browser never talks to these tables.
-- Defence in depth:
-- 1) Revoke default Data API grants on public so new tables are not auto-exposed.
-- 2) Store cases in schema `private` (not in the default PostgREST exposure list).
-- 3) RLS enabled and FORCED, with no client policies that allow access.
-- 4) Privileges granted only to service_role (used by the Next.js server).
-- 5) Personally identifiable form fields live only inside application-level AES-256-GCM ciphertext.
-- 6) Uploads go to a private Storage bucket as ciphertext; clients have no policies that allow access.

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated;

create schema if not exists private;

comment on schema private is
  'Server-only investigation casework. Do not add this schema to Exposed schemas, and do not grant it to anon or authenticated.';

revoke all on schema private from public, anon, authenticated;
revoke all on schema public from public;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema private to postgres, service_role;

alter default privileges for role postgres in schema private
  revoke all on tables from public, anon, authenticated;

alter default privileges for role postgres in schema private
  grant select, insert, update, delete on tables to service_role;

alter default privileges for role postgres in schema private
  grant usage, select on sequences to service_role;

create table private.investigation_cases (
  id uuid primary key default gen_random_uuid(),
  case_number text not null,
  status text not null,
  created_at timestamptz not null default now(),
  timezone text not null default 'Asia/Kolkata',
  review_due_by timestamptz not null,
  senior_review_required boolean not null default false,
  declaration_version text not null,
  declaration_agreed_at timestamptz not null,
  subject_location text not null default 'IN',
  client_country text not null,
  category text not null,
  subcategory text not null,
  india_state text not null,
  urgency text not null,
  money_at_risk text not null,
  client_type text not null,
  adverse_decision text not null,
  payload_ciphertext text not null,
  submitter_ip_hash text,
  constraint investigation_cases_case_number_format
    check (case_number ~ '^CD-[0-9]{4}-[0-9A-Z]{4}$'),
  constraint investigation_cases_case_number_key unique (case_number),
  constraint investigation_cases_status_chk
    check (status in ('Awaiting review', 'Awaiting senior review')),
  constraint investigation_cases_subject_india_chk
    check (subject_location = 'IN'),
  constraint investigation_cases_urgency_chk
    check (urgency in ('standard', 'urgent', 'emergency')),
  constraint investigation_cases_money_chk
    check (money_at_risk in ('yes', 'no')),
  constraint investigation_cases_client_type_chk
    check (client_type in ('individual', 'organisation')),
  constraint investigation_cases_adverse_chk
    check (adverse_decision in ('yes', 'no')),
  constraint investigation_cases_timezone_chk
    check (timezone = 'Asia/Kolkata'),
  constraint investigation_cases_payload_size_chk
    check (char_length(payload_ciphertext) > 0 and char_length(payload_ciphertext) <= 524288),
  constraint investigation_cases_ip_hash_chk
    check (submitter_ip_hash is null or submitter_ip_hash ~ '^[0-9a-f]{64}$'),
  constraint investigation_cases_country_len_chk
    check (char_length(client_country) between 2 and 8),
  constraint investigation_cases_category_len_chk
    check (char_length(category) between 1 and 64),
  constraint investigation_cases_subcategory_len_chk
    check (char_length(subcategory) between 1 and 200),
  constraint investigation_cases_state_len_chk
    check (char_length(india_state) between 1 and 80)
);

create table private.investigation_files (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references private.investigation_cases (id) on delete cascade,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  constraint investigation_files_size_chk
    check (size_bytes > 0 and size_bytes <= 26214400),
  constraint investigation_files_name_chk
    check (char_length(original_name) between 1 and 255),
  constraint investigation_files_mime_chk
    check (mime_type in (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )),
  constraint investigation_files_path_chk
    check (storage_path ~ '^cases/CD-[0-9]{4}-[0-9A-Z]{4}/[0-9a-f-]{36}\.enc$'),
  constraint investigation_files_storage_path_key unique (storage_path)
);

create index investigation_cases_created_at_idx
  on private.investigation_cases (created_at desc);

create index investigation_cases_status_idx
  on private.investigation_cases (status);

create index investigation_files_case_id_idx
  on private.investigation_files (case_id);

comment on table private.investigation_cases is
  'Filed investigation enquiries. PII is in payload_ciphertext (AES-256-GCM). Only service_role from the Next.js server may access rows.';

comment on column private.investigation_cases.payload_ciphertext is
  'Base64 of AES-256-GCM sealed JSON for the full form payload. Never store names, emails or phones in plaintext columns.';

comment on column private.investigation_cases.submitter_ip_hash is
  'SHA-256 hex of the submitter IP. Raw IPs are never stored.';

comment on table private.investigation_files is
  'Metadata for encrypted supporting files in the private investigation-uploads bucket.';

alter table private.investigation_cases enable row level security;
alter table private.investigation_cases force row level security;
alter table private.investigation_files enable row level security;
alter table private.investigation_files force row level security;

revoke all on table private.investigation_cases from public, anon, authenticated;
revoke all on table private.investigation_files from public, anon, authenticated;

grant select, insert, update, delete on table private.investigation_cases to service_role;
grant select, insert, update, delete on table private.investigation_files to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types, type)
values (
  'investigation-uploads',
  'investigation-uploads',
  false,
  27262976,
  array['application/octet-stream']::text[],
  'STANDARD'
);

create policy investigation_uploads_deny_clients
  on storage.objects
  as restrictive
  for all
  to anon, authenticated
  using (bucket_id <> 'investigation-uploads')
  with check (bucket_id <> 'investigation-uploads');
