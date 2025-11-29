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

const VideoCore = forwardRef<VideoRef, VideoCoreProps>(({ videoUrl, cookies, referer, style, volume, ...props }, ref) => {
    return (
        <Video
            ref={ref}
            source={{
                uri: videoUrl,
                type: 'm3u8',
                headers: {
                    'Cookie': cookies,
                    'Referer': referer || 'https://net51.cc/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            }}
            style={[styles.video, style]}
            resizeMode={props.resizeMode || "contain"}
            progressUpdateInterval={1000}
            minLoadRetryCount={5}
            bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 1000, // Reduced for faster start
                bufferForPlaybackAfterRebufferMs: 5000,
            }}
            volume={volume ?? 1.0}
            preventsDisplaySleepDuringVideoPlayback
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
