export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  Details: { movieId: string; providerId?: string };
  Search: undefined;
  Player: { videoUrl: string; title: string; cookies: string };
};
