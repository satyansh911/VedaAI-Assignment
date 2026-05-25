import { Assignment, AssignmentSummary } from '@/types/assignment';
import { Group, GroupDetail } from '@/types/group';
import { Notification, NotificationsResponse } from '@/types/notification';
import { User } from '@/types/user';
import { tokenStore } from './authStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function authHeader(): Record<string, string> {
  const t = tokenStore.get();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error ?? body?.message ?? JSON.stringify(body);
    } catch {
      detail = res.statusText;
    }
    if (res.status === 401) {
      tokenStore.clear();
    }
    throw new Error(detail || `Request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function jsonRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return jsonRequest('POST', '/api/auth/login', { email, password });
  },
  async signup(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    return jsonRequest('POST', '/api/auth/signup', { name, email, password });
  },
  async googleLogin(idToken: string): Promise<{ token: string; user: User }> {
    return jsonRequest('POST', '/api/auth/google', { idToken });
  },
  async getMe(): Promise<User> {
    return jsonRequest('GET', '/api/auth/me');
  },
  async updateProfile(patch: Partial<User>): Promise<User> {
    return jsonRequest('PATCH', '/api/auth/me', patch);
  },

  // Assignments
  async createAssignment(formData: FormData): Promise<{ id: string; status: string }> {
    const res = await fetch(`${API_URL}/api/assignments`, {
      method: 'POST',
      headers: { ...authHeader() },
      body: formData,
    });
    return handle(res);
  },
  async getAssignment(id: string): Promise<Assignment> {
    const res = await fetch(`${API_URL}/api/assignments/${id}`, {
      cache: 'no-store',
      headers: { ...authHeader() },
    });
    return handle(res);
  },
  async listAssignments(params?: { groupId?: string; savedToLibrary?: boolean }): Promise<AssignmentSummary[]> {
    const search = new URLSearchParams();
    if (params?.groupId) search.set('groupId', params.groupId);
    if (params?.savedToLibrary) search.set('savedToLibrary', 'true');
    const qs = search.toString();
    const res = await fetch(`${API_URL}/api/assignments${qs ? `?${qs}` : ''}`, {
      cache: 'no-store',
      headers: { ...authHeader() },
    });
    return handle(res);
  },
  async regenerate(id: string): Promise<{ id: string; status: string }> {
    return jsonRequest('POST', `/api/assignments/${id}/regenerate`);
  },
  async toggleLibrary(id: string, saved: boolean): Promise<{ id: string; savedToLibrary: boolean }> {
    return jsonRequest('POST', `/api/assignments/${id}/library`, { saved });
  },
  async deleteAssignment(id: string): Promise<{ success: boolean }> {
    return jsonRequest('DELETE', `/api/assignments/${id}`);
  },

  // Groups
  async listGroups(): Promise<Group[]> {
    return jsonRequest('GET', '/api/groups');
  },
  async getGroup(id: string): Promise<GroupDetail> {
    return jsonRequest('GET', `/api/groups/${id}`);
  },
  async createGroup(input: Partial<Group>): Promise<Group> {
    return jsonRequest('POST', '/api/groups', input);
  },
  async updateGroup(id: string, input: Partial<Group>): Promise<Group> {
    return jsonRequest('PATCH', `/api/groups/${id}`, input);
  },
  async deleteGroup(id: string): Promise<{ success: boolean }> {
    return jsonRequest('DELETE', `/api/groups/${id}`);
  },

  // Notifications
  async listNotifications(): Promise<NotificationsResponse> {
    return jsonRequest('GET', '/api/notifications');
  },
  async markAllRead(): Promise<{ success: boolean }> {
    return jsonRequest('POST', '/api/notifications/read-all');
  },
  async markRead(id: string): Promise<Notification> {
    return jsonRequest('POST', `/api/notifications/${id}/read`);
  },
  async deleteNotification(id: string): Promise<{ success: boolean }> {
    return jsonRequest('DELETE', `/api/notifications/${id}`);
  },

  // AI Toolkit
  async generateToolkit(input: {
    tool: 'lesson_plan' | 'rubric' | 'study_notes';
    topic: string;
    gradeLevel?: string;
    subject?: string;
    duration?: number;
    notes?: string;
  }): Promise<{ content: string }> {
    return jsonRequest('POST', '/api/toolkit/generate', input);
  },
};

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';
