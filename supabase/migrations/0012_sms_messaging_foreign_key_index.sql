-- Cover the staff attribution foreign key used by SMS audit queries.
create index if not exists sms_messages_sent_by_idx
  on public.sms_messages (sent_by);
