import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import DetailsPage from '../components/DetailsPage';

type Props = StackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { movieId, providerId } = route.params;

    const handleClose = () => {
        navigation.goBack();
    };

    const handleMoviePress = (movie: any) => { // Assuming 'Movie' type is defined elsewhere or 'any' for now
        navigation.push('Details', {
            movieId: movie.id,
            providerId: movie.provider || providerId,
        });
    };

    return (
        <DetailsPage
            movieId={movieId}
            providerId={providerId}
            onClose={handleClose}
            onMoviePress={handleMoviePress}
        />
    );
};

export default DetailsScreen;
