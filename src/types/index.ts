// =============================================================================
// NEXORA Core Types
// =============================================================================

export type UserRole = "user" | "admin" | "moderator";
export type Theme = "light" | "dark" | "system";
export type SubscriptionPlan = "free" | "pro" | "team" | "enterprise";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export type ToolCategory =
  | "Artificial Intelligence"
  | "Productivity"
  | "Developer Tools"
  | "Utilities"
  | "Business"
  | "Finance"
  | "Management";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  theme: Theme;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sidebar_collapsed: boolean;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: ToolCategory | string;
  icon: string | null;
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export interface RecentActivity {
  id: string;
  user_id: string;
  tool_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ShortenedUrl {
  id: string;
  user_id: string;
  original_url: string;
  short_code: string;
  custom_alias: string | null;
  title: string | null;
  is_active: boolean;
  expires_at: string | null;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  content_html: string | null;
  category: string | null;
  tags: string[];
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  status: "active" | "archived" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  title: string;
  model: string | null;
  tool_context: string | null;
  document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: "info" | "success" | "warning" | "error";
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template: string;
  data: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
