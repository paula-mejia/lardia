-- Add WhatsApp notification fields to notification_preferences

alter table public.notification_preferences
  add column whatsapp_number text,
  add column whatsapp_reminders boolean not null default false;
