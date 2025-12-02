import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import DetailsPage from '../components/DetailsPage';

type Props = StackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { movieId, providerId, title } = route.params;

    const handleClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Main');
        }
    };

    const handleMoviePress = (movie: any) => {
        navigation.push('Details', {
            movieId: movie.id,
            providerId: movie.provider || providerId,
            title: movie.title,
        });
    };

    return (
        <DetailsPage
            movieId={movieId}
            providerId={providerId}
            title={title}
            onClose={handleClose}
            onMoviePress={handleMoviePress}
        />
    );
};

export default DetailsScreen;
