import { cookies } from 'next/headers';
import { api } from './api';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';

type GetNotesResponse = {
  notes: Note[];
  totalPages: number;
};

export async function fetchNotes(
  query: string,
  page: number,
  tag?: string
): Promise<GetNotesResponse> {
  const cookieStore = await cookies();

  const response = await api.get<GetNotesResponse>('/notes', {
    params: {
      page,
      perPage: 12,
      tag,
      ...(query.trim() && { search: query.trim() }),
    },
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

export const getMe = async (): Promise<User> => {
  const cookieStore = await cookies();

  const response = await api.get<User>('/users/me', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

export const checkServerSession = async () => {
  const cookieStore = await cookies();

  const response = await api.get<User | undefined>('/auth/session', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response;
};
