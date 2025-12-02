import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import Video, { VideoRef } from 'react-native-video';

interface VideoCoreProps {
    videoUrl: string;
    cookies: string;
    paused?: boolean;
    rate?: number;
    resizeMode?: 'contain' | 'cover' | 'stretch';
    onLoad?: (data: any) => void;
    onProgress?: (data: any) => void;
    onAudioTracks?: (data: any) => void;
    onTextTracks?: (data: any) => void;
    onVideoTracks?: (data: any) => void;
    selectedAudioTrack?: any;
    selectedTextTrack?: any;
    selectedVideoTrack?: any;
    referer?: string;
    volume?: number;
    [key: string]: any;
}

const VideoCore = React.memo(forwardRef<VideoRef, VideoCoreProps>(({ videoUrl, cookies, referer, style, volume, ...props }, ref) => {
    const source = React.useMemo(() => ({
        uri: videoUrl,
        type: 'm3u8',
        headers: {
            'Cookie': cookies,
            'Referer': referer || 'https://net20.cc/',
        },
    }), [videoUrl, cookies, referer]);

    console.log('VideoCore source:', JSON.stringify(source, null, 2));

    return (
        <Video
            ref={ref}
            source={source}
            style={[styles.video, style]}
            resizeMode={props.resizeMode || "contain"}
            progressUpdateInterval={1000}
            minLoadRetryCount={10}
            bufferConfig={{
                minBufferMs: 25000,
                maxBufferMs: 100000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
            }}
            volume={volume ?? 1.0}
            preventsDisplaySleepDuringVideoPlayback
            {...props}
        />
    );
}));

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
