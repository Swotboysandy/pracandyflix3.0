export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  Details: { movieId: string; providerId?: string; title?: string };
  Search: { initialProvider?: 'Netflix' | 'Prime' | 'Hotstar' } | undefined;
  Player: { videoUrl: string; title: string; cookies: string };
  Prime: undefined;
};
