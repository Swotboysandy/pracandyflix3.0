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
import { TapGestureHandler } from 'react-native-gesture-handler';



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
    const [activeTab, setActiveTab] = useState<'audio' | 'subtitle'>('audio');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track states
    const [audioTracks, setAudioTracks] = useState<any[]>([]);
    const [textTracks, setTextTracks] = useState<any[]>([]);
    const [selectedAudioTrackIndex, setSelectedAudioTrackIndex] = useState(0);
    const [selectedTextTrackIndex, setSelectedTextTrackIndex] = useState(1000);

    const [selectedAudioTrack, setSelectedAudioTrack] = useState<SelectedTrack>({
        type: SelectedTrackType.INDEX,
        value: 0,
    });

    const [selectedTextTrack, setSelectedTextTrack] = useState<SelectedTrack>({
        type: SelectedTrackType.DISABLED,
    });

    // Animated values
    const controlsTranslateY = useRef(new Animated.Value(150)).current;
    const controlsOpacity = useRef(new Animated.Value(0)).current;
    const settingsTranslateY = useRef(new Animated.Value(1000)).current;
    const settingsOpacity = useRef(new Animated.Value(0)).current;
    const seekOpacity = useRef(new Animated.Value(0)).current;

    const [seekFeedback, setSeekFeedback] = useState<'forward' | 'backward' | null>(null);

    const doubleTapLeftRef = useRef(null);
    const doubleTapRightRef = useRef(null);
    const singleTapRef = useRef(null);

    useEffect(() => {
        console.log('VideoPlayer MOUNTED');
        console.log('URL:', videoUrl);
        console.log('Title:', title);
        console.log('Cookies:', cookies);
        return () => console.log('VideoPlayer UNMOUNTED');
    }, [videoUrl, title, cookies]);

    const handleLoadStart = () => {
        console.log('Video load started');
        setLoading(true);
    };

    const handleBuffer = (meta: any) => {
        console.log('Video buffering:', meta);
        // Ensure loading is shown while buffering if needed, though usually handled by onProgress/onLoad
    };

    const handleLoad = (data: any) => {
        console.log('Video loaded successfully');
        setDuration(data.duration);
        setLoading(false);
    };

    const handleError = (err: any) => {
        console.error('Video error:', err);
        console.error('Video error details:', JSON.stringify(err, null, 2));
        setError('Failed to load video');
        setLoading(false);
    };

    const handleAudioTracks = (data: any) => {
        console.log('Audio tracks received:', data);
        if (data && data.audioTracks) {
            console.log('Setting audio tracks:', data.audioTracks);
            setAudioTracks(data.audioTracks);
        }
    };

    const handleTextTracks = (data: any) => {
        console.log('Text tracks received:', data);
        if (data && data.textTracks) {
            console.log('Setting text tracks:', data.textTracks);
            setTextTracks(data.textTracks);
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
                    <TouchableOpacity style={styles.retryButton} onPress={onClose}>
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
                    onLoadStart={handleLoadStart}
                    onBuffer={handleBuffer}
                    onLoad={handleLoad}
                    onError={handleError}
                    onProgress={handleProgress}
                    onAudioTracks={handleAudioTracks}
                    onTextTracks={handleTextTracks}
                    selectedAudioTrack={selectedAudioTrack}
                    selectedTextTrack={selectedTextTrack}
                    resizeMode="contain"
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

            {/* Bottom controls for audio/subtitle */}
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
                            console.log('Audio button pressed, audioTracks:', audioTracks);
                            setActiveTab('audio');
                            setShowSettings(!showSettings);
                            showControlsTemporarily();
                        }}
                        style={styles.controlButton}
                    >
                        <Text style={styles.iconText}>🔊</Text>
                        <Text style={styles.controlText}>
                            {audioTracks[selectedAudioTrackIndex]?.language || 'auto'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            console.log('Subtitle button pressed, textTracks:', textTracks);
                            setActiveTab('subtitle');
                            setShowSettings(!showSettings);
                            showControlsTemporarily();
                        }}
                        style={styles.controlButton}
                    >
                        <Text style={styles.iconText}>CC</Text>
                        <Text style={styles.controlText}>
                            {selectedTextTrackIndex === 1000 ? 'none' : textTracks[selectedTextTrackIndex]?.language}
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
                        {/* Audio Tab */}
                        {activeTab === 'audio' && (
                            <View style={styles.settingsContent}>
                                <Text style={styles.settingsTitle}>Audio</Text>
                                {audioTracks.length === 0 ? (
                                    <Text style={styles.noTracksText}>Loading audio tracks...</Text>
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
                                            {track.title && (
                                                <Text style={[
                                                    styles.trackSubtext,
                                                    selectedAudioTrackIndex === i && styles.selectedTrackText
                                                ]}>
                                                    {track.title}
                                                </Text>
                                            )}
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
                                        None
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
                                        {track.title && (
                                            <Text style={[
                                                styles.trackSubtext,
                                                selectedTextTrackIndex === i && styles.selectedTrackText
                                            ]}>
                                                {track.title}
                                            </Text>
                                        )}
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
