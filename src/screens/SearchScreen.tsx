import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Search from '../components/Search';

const SearchScreen = () => {
    const navigation = useNavigation<any>();

    return (
        <Search
            onClose={navigation.canGoBack() ? () => navigation.goBack() : undefined}
            onMoviePress={(movie) => {
                navigation.navigate('Details', {
                    movieId: movie.id,
                    isPrimeVideo: movie.isPrimeVideo,
                    isHotstar: movie.isHotstar,
                });
            }}
        />
    );
};

export default SearchScreen;
