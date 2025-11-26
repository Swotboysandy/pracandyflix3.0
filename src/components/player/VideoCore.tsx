import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Video, { VideoRef, VideoProperties } from 'react-native-video';

interface VideoCoreProps extends VideoProperties {
    videoUrl: string;
    cookies: string;
}

const VideoCore = forwardRef<VideoRef, VideoCoreProps>(({ videoUrl, cookies, style, ...props }, ref) => {
    return (
        <Video
            ref={ref}
            source={{
                uri: videoUrl,
                type: 'm3u8',
                headers: {
                    'Cookie': cookies,
                    'Referer': 'https://net51.cc/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            }}
            style={[styles.video, style]}
            resizeMode="contain"
            progressUpdateInterval={1000}
            {...props}
        />
    );
});

const styles = StyleSheet.create({
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
    },
});

export default VideoCore;
