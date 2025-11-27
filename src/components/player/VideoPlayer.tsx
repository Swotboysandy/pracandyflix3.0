import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, BackHandler } from 'react-native';
import Video from 'react-native-media-console';
import { enterFullscreen, exitFullscreen } from './FullscreenHandler';

interface VideoPlayerProps {
    videoUrl: string;
    title: string;
    cookies: string;
    referer?: string;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, cookies, referer, onClose }) => {

    useEffect(() => {
        // Enter fullscreen on mount
        enterFullscreen();

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });

        return () => {
            // Exit fullscreen on unmount
            exitFullscreen();
            backHandler.remove();
        };
    }, [onClose]);

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <Video
                style={styles.video}
                source={{
                    uri: videoUrl,
                    headers: {
                        Cookie: cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        ...(referer ? { 'Referer': referer } : {}),
                    }
                }}
                title={title}
                onBack={onClose}
                onEnd={onClose}
                resizeMode="contain"
                showOnStart={true}
                controlTimeout={4000}
                navigator={undefined}
                disableVolume={false}
                disableBack={false}
                disableFullscreen={true} // We handle fullscreen manually via orientation
                disableTimer={false}
                disableSeekbar={false}
                disablePlayPause={false}
                seekColor="#E50914"
                toggleResizeModeOnFullscreen={false}
                tapAnywhereToPause={true}
                rewindTime={10}
                forwardTime={10}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default VideoPlayer;
