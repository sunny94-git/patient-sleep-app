export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: { id: string; registration_number: string; name: string; birth_date: string | null; phone: string | null; created_at: string; updated_at: string; };
        Insert: { registration_number: string; name: string; birth_date?: string | null; phone?: string | null; };
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
        Relationships: never[];
      };
      sleep_disorders: {
        Row: { id: string; patient_id: string; diagnosis: string; severity: "경미" | "중등도" | "심각" | null; onset_date: string | null; notes: string | null; created_at: string; updated_at: string; };
        Insert: { patient_id: string; diagnosis: string; severity?: "경미" | "중등도" | "심각" | null; onset_date?: string | null; notes?: string | null; };
        Update: Partial<Database["public"]["Tables"]["sleep_disorders"]["Insert"]>;
        Relationships: never[];
      };
      sleep_diary: {
        Row: { id: string; patient_id: string; diary_date: string; bedtime: string | null; wake_time: string | null; sleep_onset_latency: string | null; night_awakening_count: string | null; sleep_event_memo: string | null; sleep_quality: number | null; morning_fatigue: number | null; daytime_sleepiness: string | null; nap_taken: boolean; nap_duration_min: number | null; dream: string | null; caffeine: string | null; alcohol: boolean; condition: number | null; memo: string | null; herbal_morning: boolean | null; herbal_lunch: boolean | null; herbal_evening: boolean | null; herbal_bedtime: boolean | null; western_morning: boolean | null; western_lunch: boolean | null; western_evening: boolean | null; western_bedtime: boolean | null; total_sleep_min: number | null; deep_sleep_min: number | null; light_sleep_min: number | null; rem_sleep_min: number | null; admin_note: string | null; created_at: string; updated_by: string | null; updated_at: string | null; };
        Insert: { patient_id: string; diary_date: string; bedtime?: string | null; wake_time?: string | null; sleep_onset_latency?: string | null; night_awakening_count?: string | null; sleep_event_memo?: string | null; sleep_quality?: number | null; morning_fatigue?: number | null; daytime_sleepiness?: string | null; nap_taken?: boolean; nap_duration_min?: number | null; dream?: string | null; caffeine?: string | null; alcohol?: boolean; condition?: number | null; memo?: string | null; herbal_morning?: boolean | null; herbal_lunch?: boolean | null; herbal_evening?: boolean | null; herbal_bedtime?: boolean | null; western_morning?: boolean | null; western_lunch?: boolean | null; western_evening?: boolean | null; western_bedtime?: boolean | null; total_sleep_min?: number | null; deep_sleep_min?: number | null; light_sleep_min?: number | null; rem_sleep_min?: number | null; admin_note?: string | null; updated_by?: string | null; updated_at?: string | null; };
        Update: Partial<Database["public"]["Tables"]["sleep_diary"]["Insert"]>;
        Relationships: never[];
      };
      treatment_records: {
        Row: { id: string; patient_id: string; visit_date: string | null; prescription: string | null; treatment_notes: string | null; next_visit_date: string | null; created_by: string | null; created_at: string; };
        Insert: { patient_id: string; visit_date?: string | null; prescription?: string | null; treatment_notes?: string | null; next_visit_date?: string | null; created_by?: string | null; };
        Update: Partial<Database["public"]["Tables"]["treatment_records"]["Insert"]>;
        Relationships: never[];
      };
      exam_results: {
        Row: { id: string; patient_id: string; exam_date: string; exam_type: "HRV" | "InBody" | "QEEG"; result_data: Json | null; summary: string | null; created_by: string | null; created_at: string; updated_at: string; };
        Insert: { patient_id: string; exam_date: string; exam_type: "HRV" | "InBody" | "QEEG"; result_data?: Json | null; summary?: string | null; created_by?: string | null; };
        Update: Partial<Database["public"]["Tables"]["exam_results"]["Insert"]>;
        Relationships: never[];
      };
      isi_assessments: {
        Row: { id: string; patient_id: string; assessed_at: string; q1: number | null; q2: number | null; q3: number | null; q4: number | null; q5: number | null; q6: number | null; q7: number | null; total_score: number | null; created_at: string; };
        Insert: { patient_id: string; assessed_at: string; q1?: number | null; q2?: number | null; q3?: number | null; q4?: number | null; q5?: number | null; q6?: number | null; q7?: number | null; total_score?: number | null; };
        Update: Partial<Database["public"]["Tables"]["isi_assessments"]["Insert"]>;
        Relationships: never[];
      };
      qna: {
        Row: { id: string; patient_id: string; question: string; answer: string | null; is_answered: boolean; answered_by: string | null; answered_at: string | null; created_at: string; };
        Insert: { patient_id: string; question: string; answer?: string | null; is_answered?: boolean; answered_by?: string | null; answered_at?: string | null; };
        Update: Partial<Database["public"]["Tables"]["qna"]["Insert"]>;
        Relationships: never[];
      };
      settings: {
        Row: { id: string; push_enabled: boolean; diary_remind: boolean; med_alarm: boolean; qna_alarm: boolean; created_at: string; updated_at: string; };
        Insert: { id: string; push_enabled?: boolean; diary_remind?: boolean; med_alarm?: boolean; qna_alarm?: boolean; };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: never[];
      };
      user_roles: {
        Row: { id: string; role: "patient" | "admin"; patient_id: string | null; created_at: string; };
        Insert: { id: string; role: "patient" | "admin"; patient_id?: string | null; };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
