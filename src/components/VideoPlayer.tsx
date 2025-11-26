import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Animated,
} from 'react-native';
import Video, { VideoRef, SelectedTrack, SelectedTrackType } from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TapGestureHandler, State } from 'react-native-gesture-handler';

interface CustomVideoPlayerProps {
    videoUrl: string;
    title: string;
    cookies: string;
    onClose: () => void;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
    videoUrl,
    title,
    cookies,
    onClose
}) => {
    const playerRef = useRef<VideoRef | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paused, setPaused] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [activeTab, setActiveTab] = useState<'audio' | 'subtitle' | 'quality' | 'speed'>('audio');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [resizeMode, setResizeMode] = useState<'contain' | 'cover' | 'stretch'>('contain');
    const [retryKey, setRetryKey] = useState(0);
    const [isLandscape, setIsLandscape] = useState(false);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track states
    const [audioTracks, setAudioTracks] = useState<any[]>([]);
    const [textTracks, setTextTracks] = useState<any[]>([]);
    const [videoTracks, setVideoTracks] = useState<any[]>([]);
    const [selectedAudioTrackIndex, setSelectedAudioTrackIndex] = useState(0);
    const [selectedTextTrackIndex, setSelectedTextTrackIndex] = useState(1000);
    const [selectedVideoTrackIndex, setSelectedVideoTrackIndex] = useState(-1); // -1 for auto

    const [selectedAudioTrack, setSelectedAudioTrack] = useState<SelectedTrack>({
        type: SelectedTrackType.INDEX,
        value: 0,
    });

    const [selectedTextTrack, setSelectedTextTrack] = useState<SelectedTrack>({
        type: SelectedTrackType.DISABLED,
    });

    const [selectedVideoTrack, setSelectedVideoTrack] = useState<any>({
        type: 'auto',
    });

    // Animated values
    const controlsTranslateY = useRef(new Animated.Value(0)).current;
    const controlsOpacity = useRef(new Animated.Value(1)).current;
    const settingsTranslateY = useRef(new Animated.Value(1000)).current;
    const settingsOpacity = useRef(new Animated.Value(0)).current;
    const seekOpacity = useRef(new Animated.Value(0)).current;

    const [seekFeedback, setSeekFeedback] = useState<'forward' | 'backward' | null>(null);

    const doubleTapLeftRef = useRef(null);
    const doubleTapRightRef = useRef(null);
    const singleTapRef = useRef(null);

    useEffect(() => {
        console.log('VideoPlayer MOUNTED');
        console.log('Video URL:', videoUrl);
        console.log('Cookies:', cookies);
        return () => console.log('VideoPlayer UNMOUNTED');
    }, [videoUrl, cookies]);

    const handleLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    const handleBuffer = (meta: any) => {
        // console.log('Video buffering:', meta);
    };

    const handleLoad = (data: any) => {
        setDuration(data.duration);
        setLoading(false);
    };

    const handleError = (err: any) => {
        console.error('Video error details:', JSON.stringify(err, null, 2));
        console.error('Video URL that failed:', videoUrl);
        console.error('Cookies used:', cookies);
        setError(`Failed to load video: ${err?.error?.errorString || 'Unknown error'}`);
        setLoading(false);
    };

    const handleRetry = () => {
        setRetryKey(prev => prev + 1);
        setError(null);
        setLoading(true);
    };

    const handleAudioTracks = (data: any) => {
        if (data && data.audioTracks) {
            setAudioTracks(data.audioTracks);
        }
    };

    const handleTextTracks = (data: any) => {
        if (data && data.textTracks) {
            setTextTracks(data.textTracks);
        }
    };

    const handleVideoTracks = (data: any) => {
        if (data && data.videoTracks) {
            const sortedTracks = data.videoTracks.sort((a: any, b: any) => b.height - a.height);
            setVideoTracks(sortedTracks);
        }
    };

    const handleProgress = (data: any) => {
        setCurrentTime(data.currentTime);
    };

    const togglePlayPause = () => {
        setPaused(!paused);
        showControlsTemporarily();
    };

    const showControlsTemporarily = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    const handleDoubleTap = (direction: 'forward' | 'backward') => {
        const seekTime = direction === 'forward' ? 10 : -10;
        const newTime = currentTime + seekTime;
        if (playerRef.current) {
            playerRef.current.seek(newTime);
        }

        setSeekFeedback(direction);
        seekOpacity.setValue(1);
        Animated.sequence([
            Animated.timing(seekOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(500),
            Animated.timing(seekOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setSeekFeedback(null));
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(controlsTranslateY, {
                toValue: showControls ? 0 : 150,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(controlsOpacity, {
                toValue: showControls ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, [showControls, controlsTranslateY, controlsOpacity]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(settingsTranslateY, {
                toValue: showSettings ? 0 : 1000,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(settingsOpacity, {
                toValue: showSettings ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, [showSettings, settingsTranslateY, settingsOpacity]);

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
                <StatusBar hidden />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.retryButton, { marginTop: 10, backgroundColor: '#333' }]} onPress={onClose}>
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <StatusBar hidden />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E50914" />
                    <Text style={styles.loadingText}>Loading video...</Text>
                </View>
            )}

            <View style={styles.videoContainer}>
                <Video
                    key={retryKey}
                    ref={playerRef}
                    source={{
                        uri: videoUrl,
                        type: 'm3u8',
                        headers: {
                            'Cookie': cookies,
                            'Referer': 'https://net51.cc/',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        },
                    }}
                    style={styles.video}
                    paused={paused}
                    rate={playbackRate}
                    onLoadStart={handleLoadStart}
                    onBuffer={handleBuffer}
                    onLoad={handleLoad}
                    onError={handleError}
                    onProgress={handleProgress}
                    onAudioTracks={handleAudioTracks}
                    onTextTracks={handleTextTracks}
                    onVideoTracks={handleVideoTracks}
                    selectedAudioTrack={selectedAudioTrack}
                    selectedTextTrack={selectedTextTrack}
                    selectedVideoTrack={selectedVideoTrack}
                    resizeMode={resizeMode}
                    progressUpdateInterval={1000}
                />

                {/* Gestures Layer */}
                <TapGestureHandler
                    ref={singleTapRef}
                    onActivated={showControlsTemporarily}
                    waitFor={[doubleTapLeftRef, doubleTapRightRef]}
                >
                    <View style={styles.gestureContainer}>
                        <TapGestureHandler
                            ref={doubleTapLeftRef}
                            numberOfTaps={2}
                            onActivated={() => handleDoubleTap('backward')}
                        >
                            <View style={styles.gestureSide} />
                        </TapGestureHandler>

                        <View style={styles.gestureCenter} />

                        <TapGestureHandler
                            ref={doubleTapRightRef}
                            numberOfTaps={2}
                            onActivated={() => handleDoubleTap('forward')}
                        >
                            <View style={styles.gestureSide} />
                        </TapGestureHandler>
                    </View>
                </TapGestureHandler>

                {/* Seek Feedback */}
                {seekFeedback && (
                    <View style={[
                        styles.feedbackContainer,
                        seekFeedback === 'forward' ? styles.feedbackRight : styles.feedbackLeft
                    ]}>
                        <Animated.View style={{ opacity: seekOpacity }}>
                            <Text style={styles.feedbackText}>
                                {seekFeedback === 'forward' ? '▶▶ +10s' : '◀◀ -10s'}
                            </Text>
                        </Animated.View>
                    </View>
                )}

                {/* Play/Pause Button */}
                {showControls && (
                    <TouchableOpacity
                        style={styles.playPauseButton}
                        onPress={togglePlayPause}
                    >
                        <Text style={styles.playPauseText}>{paused ? '▶' : '❚❚'}</Text>
                    </TouchableOpacity>
                )}

                {/* Top Bar */}
                {showControls && (
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    </View>
                )}

                {/* Progress Bar */}
                {showControls && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFilled,
                                    { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                                ]}
                            />
                        </View>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                            <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Bottom controls */}
            {showControls && (
                <Animated.View
                    style={[
                        styles.bottomControls,
                        {
                            transform: [{ translateY: controlsTranslateY }],
                            opacity: controlsOpacity,
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => {
                            setIsLandscape(!isLandscape);
                            showControlsTemporarily();
                        }}
                        style={styles.controlButton}
                    >
                        <Text style={styles.iconText}>🔄</Text>
                        <Text style={styles.controlText}>
                            {isLandscape ? 'Portrait' : 'Landscape'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setResizeMode(prev =>
                                prev === 'contain' ? 'cover' :
                                    prev === 'cover' ? 'stretch' : 'contain'
                            );
                            showControlsTemporarily();
                        }}
                        style={styles.controlButton}
                    >
                        <Text style={styles.iconText}>⛶</Text>
                        <Text style={styles.controlText}>
                            {resizeMode}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setActiveTab('speed');
                            setShowSettings(!showSettings);
                            showControlsTemporarily();
                        }}
                        style={styles.controlButton}
                    >
                        <Text style={styles.iconText}>⚡</Text>
                        <Text style={styles.controlText}>
                            {playbackRate}x
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setActiveTab('quality');
                            setShowSettings(!showSettings);
                            showControlsTemporarily();
                        }}
                        style={styles.controlButton}
                    >
                        <Text style={styles.iconText}>ᴴᴰ</Text>
                        <Text style={styles.controlText}>
                            {selectedVideoTrackIndex === -1 ? 'Auto' : `${videoTracks[selectedVideoTrackIndex]?.height}p`}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setActiveTab('audio');
                            setShowSettings(!showSettings);
                            showControlsTemporarily();
                        }}
                        style={styles.controlButton}
                    >
                        <Text style={styles.iconText}>🔊</Text>
                        <Text style={styles.controlText}>
                            {audioTracks[selectedAudioTrackIndex]?.language || 'Audio'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setActiveTab('subtitle');
                            setShowSettings(!showSettings);
                            showControlsTemporarily();
                        }}
                        style={styles.controlButton}
                    >
                        <Text style={styles.iconText}>CC</Text>
                        <Text style={styles.controlText}>
                            {selectedTextTrackIndex === 1000 ? 'Off' : textTracks[selectedTextTrackIndex]?.language || 'Sub'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <Animated.View
                    style={[
                        styles.settingsOverlay,
                        {
                            transform: [{ translateY: settingsTranslateY }],
                            opacity: settingsOpacity,
                        },
                    ]}
                    onTouchEnd={() => setShowSettings(false)}
                >
                    <View
                        style={styles.settingsContainer}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        {/* Speed Tab */}
                        {activeTab === 'speed' && (
                            <View style={styles.settingsContent}>
                                <Text style={styles.settingsTitle}>Playback Speed</Text>
                                {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                                    <TouchableOpacity
                                        key={rate}
                                        style={styles.trackItem}
                                        onPress={() => {
                                            setPlaybackRate(rate);
                                            setShowSettings(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.trackText,
                                            playbackRate === rate && styles.selectedTrackText
                                        ]}>
                                            {rate}x
                                        </Text>
                                        {playbackRate === rate && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Quality Tab */}
                        {activeTab === 'quality' && (
                            <View style={styles.settingsContent}>
                                <Text style={styles.settingsTitle}>Quality</Text>
                                <TouchableOpacity
                                    style={styles.trackItem}
                                    onPress={() => {
                                        setSelectedVideoTrack({
                                            type: 'auto',
                                        });
                                        setSelectedVideoTrackIndex(-1);
                                        setShowSettings(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.trackText,
                                        selectedVideoTrackIndex === -1 && styles.selectedTrackText
                                    ]}>
                                        Auto
                                    </Text>
                                    {selectedVideoTrackIndex === -1 && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                                {videoTracks.map((track, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.trackItem}
                                        onPress={() => {
                                            setSelectedVideoTrack({
                                                type: 'index',
                                                value: i,
                                            });
                                            setSelectedVideoTrackIndex(i);
                                            setShowSettings(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.trackText,
                                            selectedVideoTrackIndex === i && styles.selectedTrackText
                                        ]}>
                                            {track.height ? `${track.height}p` : `Quality ${i + 1}`}
                                        </Text>
                                        {track.bitrate && (
                                            <Text style={styles.trackSubtext}>
                                                {Math.round(track.bitrate / 1000)} kbps
                                            </Text>
                                        )}
                                        {selectedVideoTrackIndex === i && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Audio Tab */}
                        {activeTab === 'audio' && (
                            <View style={styles.settingsContent}>
                                <Text style={styles.settingsTitle}>Audio</Text>
                                {audioTracks.length === 0 ? (
                                    <Text style={styles.noTracksText}>No audio tracks available</Text>
                                ) : (
                                    audioTracks.map((track, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.trackItem}
                                            onPress={() => {
                                                setSelectedAudioTrack({
                                                    type: SelectedTrackType.INDEX,
                                                    value: i,
                                                });
                                                setSelectedAudioTrackIndex(i);
                                                setShowSettings(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.trackText,
                                                selectedAudioTrackIndex === i && styles.selectedTrackText
                                            ]}>
                                                {track.language || `Track ${i + 1}`}
                                            </Text>
                                            {selectedAudioTrackIndex === i && (
                                                <Text style={styles.checkmark}>✓</Text>
                                            )}
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        )}

                        {/* Subtitle Tab */}
                        {activeTab === 'subtitle' && (
                            <View style={styles.settingsContent}>
                                <Text style={styles.settingsTitle}>Subtitle</Text>
                                <TouchableOpacity
                                    style={styles.trackItem}
                                    onPress={() => {
                                        setSelectedTextTrack({
                                            type: SelectedTrackType.DISABLED,
                                        });
                                        setSelectedTextTrackIndex(1000);
                                        setShowSettings(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.trackText,
                                        selectedTextTrackIndex === 1000 && styles.selectedTrackText
                                    ]}>
                                        Off
                                    </Text>
                                    {selectedTextTrackIndex === 1000 && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                                {textTracks.map((track, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.trackItem}
                                        onPress={() => {
                                            setSelectedTextTrack({
                                                type: SelectedTrackType.INDEX,
                                                value: i,
                                            });
                                            setSelectedTextTrackIndex(i);
                                            setShowSettings(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.trackText,
                                            selectedTextTrackIndex === i && styles.selectedTrackText
                                        ]}>
                                            {track.language || `Subtitle ${i + 1}`}
                                        </Text>
                                        {selectedTextTrackIndex === i && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    playPauseButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -40 }, { translateY: -40 }],
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    playPauseText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 100,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        zIndex: 100,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFilled: {
        height: '100%',
        backgroundColor: '#E50914',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    timeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 1000,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#E50914',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 4,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 12,
        right: 24,
        flexDirection: 'row',
        gap: 48,
        zIndex: 200,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    controlText: {
        color: '#fff',
        fontSize: 12,
        opacity: 0.7,
        textTransform: 'capitalize',
    },
    settingsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 1000,
    },
    settingsContainer: {
        backgroundColor: '#1a1a1a',
        padding: 12,
        width: '90%',
        maxWidth: 600,
        maxHeight: 400,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    settingsContent: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 16,
    },
    settingsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 8,
    },
    noTracksText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 20,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginVertical: 4,
    },
    trackText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'capitalize',
    },
    trackSubtext: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#fff',
    },
    selectedTrackText: {
        color: '#E50914',
    },
    iconText: {
        color: '#fff',
        fontSize: 18,
        opacity: 0.7,
        fontWeight: 'bold',
    },
    checkmark: {
        color: '#E50914',
        fontSize: 20,
        fontWeight: 'bold',
    },
    gestureContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 10,
    },
    gestureSide: {
        flex: 0.4,
        height: '100%',
    },
    gestureCenter: {
        flex: 0.2,
        height: '100%',
    },
    feedbackContainer: {
        position: 'absolute',
        top: '50%',
        marginTop: -30,
        zIndex: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 15,
        borderRadius: 30,
    },
    feedbackLeft: {
        left: '20%',
    },
    feedbackRight: {
        right: '20%',
    },
    feedbackText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomVideoPlayer;
