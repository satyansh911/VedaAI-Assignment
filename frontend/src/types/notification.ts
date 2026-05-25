export type NotificationType =
  | 'assignment_completed'
  | 'assignment_failed'
  | 'group_created'
  | 'library_saved'
  | 'system';

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  unreadCount: number;
}
