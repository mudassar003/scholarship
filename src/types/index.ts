// src/types/index.ts
export interface Professor {
  id?: string;
  name: string;
  email: string;
  university_id?: string;
  university_name?: string;
  country?: string;
  lab?: string;
  department?: string;
  research?: string;
  status?: string;
  email_date?: string | null;
  reply_date?: string | null;
  notes?: string | null;
  proposal?: {
    url: string;
  } | null;
  email_screenshot?: {
    url: string;
  } | null;
  reminder_date?: string | null;
  next_reminder?: string | null;
  notification_enabled?: boolean;
  last_notification_sent_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
  scholarships?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface University {
  id: string;
  name: string;
  country_id?: string;
  country?: string;
  city?: string;
  website?: string;
  scholarships?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  country?: string;
  description?: string;
  deadline?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  phone_number?: string;
  phone_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationHistory {
  id: string;
  user_id: string;
  professor_id?: string;
  notification_type: string;
  message: string;
  status: string;
  twilio_sid?: string;
  error_message?: string;
  sent_at: string;
}