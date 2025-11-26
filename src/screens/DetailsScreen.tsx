import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import DetailsPage from '../components/DetailsPage';

type Props = StackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { movieId, isPrimeVideo, isHotstar } = route.params;

    return (
        <DetailsPage
            movieId={movieId}
            isPrimeVideo={isPrimeVideo}
            isHotstar={isHotstar}
            onClose={() => navigation.goBack()}
            onMoviePress={(id) => navigation.push('Details', { movieId: id })}
            onPlay={(url, title, cookies) => {
                navigation.navigate('Player', {
                    videoUrl: url,
                    title: title,
                    cookies: cookies,
                });
            }}
        />
    );
};

export default DetailsScreen;
