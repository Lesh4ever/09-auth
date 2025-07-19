import axios from "axios";
import type { Note, NoteFormData } from "../types/note";

const BASE_URL = "https://notehub-public.goit.study/api/notes/";
const myToken = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

interface FetchNotesParams {
  query: string;
  page: number;
  tag?: string;
  perPage?: number;
}

export async function fetchNotes({
  query,
  page,
  tag,
  perPage = 12,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const params: Record<string, string | number> = {
    page,
    perPage,
  };

  if (query.trim() !== "") {
    params.search = query.trim();
  }

  if (tag) {
    params.tag = tag;
  }

  const response = await axios.get<FetchNotesResponse>(BASE_URL, {
    params,
    headers: {
      Authorization: `Bearer ${myToken}`,
    },
  });

  return response.data;
}

export async function fetchNoteById(id: number): Promise<Note> {
  const response = await axios.get<Note>(`${BASE_URL}${id}`, {
    headers: {
      Authorization: `Bearer ${myToken}`,
    },
  });
  return response.data;
}

export async function removeNote(id: number): Promise<Note> {
  const response = await axios.delete<Note>(`${BASE_URL}${id}`, {
    headers: {
      Authorization: `Bearer ${myToken}`,
    },
  });
  return response.data;
}

export async function createNote(note: NoteFormData): Promise<Note> {
  const response = await axios.post<Note>(BASE_URL, note, {
    headers: {
      Authorization: `Bearer ${myToken}`,
    },
  });
  return response.data;
}
