import { fetchNoteById } from "@/lib/api";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";
import NoteDetailsClient from "./NoteDetails.client";
import { Metadata } from "next";

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { id } = await params;
  const note = await fetchNoteById(parseInt(id));
  return {
    title: `Notehub - ${note.title}`,
    description: `${note.content}`,
    openGraph: {
      title: `Notehub - ${note.title}`,
      description: `${note.content}`,
      url: `https://08-zustand-ten-tau.vercel.app/notes/${note.id}`,
      siteName: "NoteHub",
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt: "NoteHub",
        },
      ],
      type: "article",
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const numericId = Number(id);

  await queryClient.prefetchQuery({
    queryKey: ["note", numericId],
    queryFn: () => fetchNoteById(numericId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient id={numericId} />
    </HydrationBoundary>
  );
}
