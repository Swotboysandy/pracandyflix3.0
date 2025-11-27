export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  Details: { movieId: string; isPrimeVideo?: boolean; isHotstar?: boolean };
  Search: undefined;
  Player: { videoUrl: string; title: string; cookies: string };
};
