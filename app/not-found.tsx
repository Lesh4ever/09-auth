import css from "./Home.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your NoteHub not found",
  description: "Sorry, but you are come to the wrong place!",
  openGraph: {
    title: "Your NoteHub not found",
    description: "Sorry, but you are come to the wrong place!",
    url: "https://08-zustand-ten-tau.vercel.app/notes",
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

const NotFound = () => {
  return (
    <div>
      <h1 className={css.title}>Oh no, not that! 404 - Page not found</h1>
      <p className={css.description}>
        Sorry, but you are come to the wrong place!
      </p>
    </div>
  );
};

export default NotFound;
