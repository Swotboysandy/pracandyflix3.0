import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Search from '../components/Search';

const SearchScreen = ({ route }: any) => {
    const navigation = useNavigation<any>();
    const { initialProvider } = route.params || {};

    return (
        <Search
            initialProvider={initialProvider}
            onClose={navigation.canGoBack() ? () => navigation.goBack() : undefined}
            onMoviePress={(movie) => {
                navigation.navigate('Details', {
                    movieId: movie.id,
                    providerId: movie.provider,
                });
            }}
        />
    );
};

export default SearchScreen;
