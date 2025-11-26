import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import Search from '../components/Search';

type Props = StackScreenProps<RootStackParamList, 'Search'>;

const SearchScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <Search
            onClose={() => navigation.goBack()}
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
