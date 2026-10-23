export interface HomePageProps {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    type?: string;
    window?: string;
  }>;
}

export interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export interface ShowPageProps extends MoviePageProps {
  searchParams?: Promise<{ season?: string }>;
}

export type PersonPageProps = MoviePageProps;
