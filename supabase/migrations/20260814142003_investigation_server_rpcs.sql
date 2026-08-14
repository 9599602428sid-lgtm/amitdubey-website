create policy investigation_cases_deny_clients
  on private.investigation_cases
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy investigation_files_deny_clients
  on private.investigation_files
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create or replace function public.investigation_insert_case(p jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = private, pg_temp
as $$
declare
  new_row investigation_cases;
begin
  if p->>'subject_location' is not null and p->>'subject_location' <> 'IN' then
    raise exception 'subject location must be India' using errcode = '23514';
  end if;

  insert into investigation_cases (
    case_number,
    status,
    created_at,
    timezone,
    review_due_by,
    senior_review_required,
    declaration_version,
    declaration_agreed_at,
    subject_location,
    client_country,
    category,
    subcategory,
    india_state,
    urgency,
    money_at_risk,
    client_type,
    adverse_decision,
    payload_ciphertext,
    submitter_ip_hash
  ) values (
    p->>'case_number',
    p->>'status',
    coalesce((p->>'created_at')::timestamptz, now()),
    coalesce(nullif(p->>'timezone', ''), 'Asia/Kolkata'),
    (p->>'review_due_by')::timestamptz,
    coalesce((p->>'senior_review_required')::boolean, false),
    p->>'declaration_version',
    coalesce((p->>'declaration_agreed_at')::timestamptz, now()),
    coalesce(nullif(p->>'subject_location', ''), 'IN'),
    p->>'client_country',
    p->>'category',
    p->>'subcategory',
    p->>'india_state',
    p->>'urgency',
    p->>'money_at_risk',
    p->>'client_type',
    p->>'adverse_decision',
    p->>'payload_ciphertext',
    nullif(p->>'submitter_ip_hash', '')
  )
  returning * into new_row;

  return to_jsonb(new_row);
end;
$$;

create or replace function public.investigation_insert_file(p jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = private, pg_temp
as $$
declare
  new_row investigation_files;
begin
  insert into investigation_files (
    id,
    case_id,
    original_name,
    mime_type,
    size_bytes,
    storage_path
  ) values (
    coalesce((p->>'id')::uuid, gen_random_uuid()),
    (p->>'case_id')::uuid,
    p->>'original_name',
    p->>'mime_type',
    (p->>'size_bytes')::integer,
    p->>'storage_path'
  )
  returning * into new_row;

  return to_jsonb(new_row);
end;
$$;

create or replace function public.investigation_get_case(p_case_number text)
returns jsonb
language sql
security invoker
set search_path = private, pg_temp
stable
as $$
  select case
    when c.id is null then null
    else jsonb_build_object(
      'id', c.id,
      'case_number', c.case_number,
      'status', c.status,
      'created_at', c.created_at,
      'timezone', c.timezone,
      'review_due_by', c.review_due_by,
      'senior_review_required', c.senior_review_required,
      'declaration_version', c.declaration_version,
      'declaration_agreed_at', c.declaration_agreed_at,
      'subject_location', c.subject_location,
      'client_country', c.client_country,
      'category', c.category,
      'subcategory', c.subcategory,
      'india_state', c.india_state,
      'urgency', c.urgency,
      'money_at_risk', c.money_at_risk,
      'client_type', c.client_type,
      'adverse_decision', c.adverse_decision,
      'payload_ciphertext', c.payload_ciphertext,
      'submitter_ip_hash', c.submitter_ip_hash,
      'files', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', f.id,
          'original_name', f.original_name,
          'mime_type', f.mime_type,
          'size_bytes', f.size_bytes,
          'storage_path', f.storage_path
        ) order by f.created_at)
        from investigation_files f
        where f.case_id = c.id
      ), '[]'::jsonb)
    )
  end
  from investigation_cases c
  where c.case_number = p_case_number;
$$;

create or replace function public.investigation_list_cases()
returns jsonb
language sql
security invoker
set search_path = private, pg_temp
stable
as $$
  select coalesce(jsonb_agg(item order by created_at desc), '[]'::jsonb)
  from (
    select
      c.created_at,
      jsonb_build_object(
        'id', c.id,
        'case_number', c.case_number,
        'status', c.status,
        'created_at', c.created_at,
        'timezone', c.timezone,
        'review_due_by', c.review_due_by,
        'senior_review_required', c.senior_review_required,
        'declaration_version', c.declaration_version,
        'declaration_agreed_at', c.declaration_agreed_at,
        'subject_location', c.subject_location,
        'client_country', c.client_country,
        'category', c.category,
        'subcategory', c.subcategory,
        'india_state', c.india_state,
        'urgency', c.urgency,
        'money_at_risk', c.money_at_risk,
        'client_type', c.client_type,
        'adverse_decision', c.adverse_decision,
        'payload_ciphertext', c.payload_ciphertext,
        'submitter_ip_hash', c.submitter_ip_hash,
        'files', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', f.id,
            'original_name', f.original_name,
            'mime_type', f.mime_type,
            'size_bytes', f.size_bytes,
            'storage_path', f.storage_path
          ) order by f.created_at)
          from investigation_files f
          where f.case_id = c.id
        ), '[]'::jsonb)
      ) as item
    from investigation_cases c
  ) listed;
$$;

revoke all on function public.investigation_insert_case(jsonb) from public, anon, authenticated;
revoke all on function public.investigation_insert_file(jsonb) from public, anon, authenticated;
revoke all on function public.investigation_get_case(text) from public, anon, authenticated;
revoke all on function public.investigation_list_cases() from public, anon, authenticated;

grant execute on function public.investigation_insert_case(jsonb) to service_role;
grant execute on function public.investigation_insert_file(jsonb) to service_role;
grant execute on function public.investigation_get_case(text) to service_role;
grant execute on function public.investigation_list_cases() to service_role;
