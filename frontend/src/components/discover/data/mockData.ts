import { Book } from "@/types/models";

export interface GenreSection {
  genre: string;
  books: Book[];
}

export interface CarouselData {
  title: string;
  key: string;
  sections: GenreSection[];
}

export const fictionBooks: Book[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "/book-covers/midnight-library.jpg",
    rating: 4.3,
    status: "want-to-read",
    pages: 304,
    genre: "Fiction",
    tags: ["fiction", "contemporary"],
  },
  {
    id: "2",
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    cover: "/book-covers/name-of-the-wind.jpg",
    rating: 5.0,
    status: "want-to-read",
    pages: 662,
    genre: "Fiction",
    tags: ["fantasy", "fiction"],
  },
  {
    id: "3",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    cover: "/book-covers/new-cover.jpg",
    rating: 4.5,
    status: "want-to-read",
    pages: 400,
    genre: "Fiction",
    tags: ["fiction", "historical"],
  },
  {
    id: "4",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    cover: "/book-covers/design-of-everyday-things.jpg",
    rating: 4.2,
    status: "want-to-read",
    pages: 320,
    genre: "Fiction",
    tags: ["fiction", "sci-fi"],
  },
  {
    id: "5",
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    cover: "/book-covers/thinking-fast-slow.jpg",
    rating: 4.1,
    status: "want-to-read",
    pages: 400,
    genre: "Fiction",
    tags: ["fiction", "mystery"],
  },
];

export const sciFiBooks: Book[] = [
  {
    id: "6",
    title: "Dune",
    author: "Frank Herbert",
    cover: "/book-covers/dune.jpg",
    rating: 4.9,
    status: "want-to-read",
    pages: 688,
    genre: "Science Fiction",
    tags: ["sci-fi", "epic"],
  },
  {
    id: "7",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "/book-covers/project-hail-mary.jpg",
    rating: 4.6,
    status: "want-to-read",
    pages: 496,
    genre: "Science Fiction",
    tags: ["sci-fi", "space"],
  },
  {
    id: "8",
    title: "The Martian",
    author: "Andy Weir",
    cover: "/book-covers/atomic-habits.jpg",
    rating: 4.7,
    status: "want-to-read",
    pages: 369,
    genre: "Science Fiction",
    tags: ["sci-fi", "space"],
  },
  {
    id: "9",
    title: "Foundation",
    author: "Isaac Asimov",
    cover: "/book-covers/sapiens.jpg",
    rating: 4.4,
    status: "want-to-read",
    pages: 244,
    genre: "Science Fiction",
    tags: ["sci-fi", "classic"],
  },
  {
    id: "10",
    title: "Neuromancer",
    author: "William Gibson",
    cover: "/book-covers/deep-work.jpg",
    rating: 4.3,
    status: "want-to-read",
    pages: 271,
    genre: "Science Fiction",
    tags: ["sci-fi", "cyberpunk"],
  },
];

export const memoirBooks: Book[] = [
  {
    id: "11",
    title: "Educated",
    author: "Tara Westover",
    cover: "/book-covers/educated.jpg",
    rating: 4.8,
    status: "want-to-read",
    pages: 352,
    genre: "Memoir",
    tags: ["memoir", "education"],
  },
  {
    id: "12",
    title: "The Lean Startup",
    author: "Eric Ries",
    cover: "/book-covers/lean-startup.jpg",
    rating: 4.2,
    status: "want-to-read",
    pages: 336,
    genre: "Memoir",
    tags: ["business", "startup"],
  },
];

export const selfHelpBooks: Book[] = [
  {
    id: "13",
    title: "Atomic Habits",
    author: "James Clear",
    cover: "/book-covers/atomic-habits.jpg",
    rating: 4.5,
    status: "want-to-read",
    pages: 320,
    genre: "Self-Help",
    tags: ["self-help", "habits"],
  },
  {
    id: "14",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    cover: "/book-covers/sapiens.jpg",
    rating: 4.6,
    status: "want-to-read",
    pages: 443,
    genre: "Self-Help",
    tags: ["history", "anthropology"],
  },
  {
    id: "15",
    title: "Deep Work",
    author: "Cal Newport",
    cover: "/book-covers/deep-work.jpg",
    rating: 4.4,
    status: "want-to-read",
    pages: 304,
    genre: "Self-Help",
    tags: ["productivity", "focus"],
  },
];

export const carouselData: CarouselData[] = [
  {
    title: "Genres",
    key: "genres",
    sections: [
      { genre: "Fiction", books: fictionBooks },
      { genre: "Science Fiction", books: sciFiBooks },
      { genre: "Memoir", books: memoirBooks },
      { genre: "Self-Help", books: selfHelpBooks },
    ],
  },
  {
    title: "Trending Now",
    key: "trending",
    sections: [
      { genre: "Popular Fiction", books: fictionBooks.slice(0, 3) },
      { genre: "Bestsellers", books: sciFiBooks.slice(0, 3) },
    ],
  },
  {
    title: "Editor's Choice",
    key: "editors",
    sections: [
      { genre: "Must Reads", books: memoirBooks },
      { genre: "Hidden Gems", books: selfHelpBooks.slice(0, 2) },
    ],
  },
];
