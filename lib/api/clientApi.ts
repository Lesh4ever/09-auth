import { api } from './api';
import type { Note, NoteFormData } from '../../types/note';
import type { User } from '@/types/user';

export type GetNotesRequest = {
  params: {
    search?: string;
    tag?: string;
    page: number;
    perPage: number;
    sortBy?: string;
  };
};

export type GetNotesResponse = {
  notes: Note[];
  totalPages: number;
};

export type ServerBoolResponse = {
  success: boolean;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  email?: string;
  password?: string;
  message?: string;
};

export const register = async (data: RegisterRequest) => {
  const res = await api.post<RegisterResponse>('/auth/register', data);
  return res.data;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  username?: string;
  email?: string;
  avatar?: string;
  message?: string;
};

export const login = async (data: LoginRequest) => {
  const res = await api.post<LoginResponse>('/auth/login', data);
  return res.data;
};

export type LogoutResponse = {
  message?: string;
};

export const logout = async () => {
  const res = await api.post<LogoutResponse>('/auth/logout');
  return res.data;
};

export const getMe = async () => {
  const res = await api.get<User>('/users/me');
  return res.data;
};

export const checkSession = async () => {
  const res = await api.get<ServerBoolResponse>('/auth/session');
  return res.data;
};

export async function fetchNotes(
  query: string,
  page: number,
  tag?: string
): Promise<GetNotesResponse> {
  const noteSearchParams: GetNotesRequest = {
    params: {
      page,
      perPage: 12,
      tag,
    },
  };

  if (query.trim() !== '') {
    noteSearchParams.params.search = query.trim();
  }

  const response = await api.get<GetNotesResponse>('/notes', noteSearchParams);

  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
}

export async function createNote(note: NoteFormData): Promise<Note> {
  const response = await api.post<Note>('/notes', note);
  return response.data;
}

export async function removeNote(id: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${id}`);
  return response.data;
}

export type NewUserData = {
  email: string;
  username: string;
};

export type NewUserDataResponse = {
  username: string;
  email: string;
  avatar: string;
};

export async function editUser(newData: NewUserData): Promise<NewUserDataResponse> {
  const response = await api.patch<NewUserDataResponse>('/users/me', newData);

  return response.data;
}
