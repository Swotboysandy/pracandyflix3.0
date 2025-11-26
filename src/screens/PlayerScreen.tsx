import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import CustomVideoPlayer from '../components/VideoPlayer';

type Props = StackScreenProps<RootStackParamList, 'Player'>;

const PlayerScreen: React.FC<Props> = ({ route, navigation }) => {
    const { videoUrl, title, cookies } = route.params;

    return (
        <CustomVideoPlayer
            videoUrl={videoUrl}
            title={title}
            cookies={cookies}
            onClose={() => navigation.goBack()}
        />
    );
};

export default PlayerScreen;
