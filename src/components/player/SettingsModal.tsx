import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { X, Check, Globe, Type, Zap, Monitor } from 'lucide-react-native';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    audioTracks: any[];
    textTracks: any[];
    videoTracks: any[];
    selectedAudioTrack: number;
    selectedTextTrack: number;
    selectedVideoTrack: any;
    playbackRate: number;
    onSelectAudioTrack: (index: number) => void;
    onSelectTextTrack: (index: number) => void;
    onSelectVideoTrack: (track: any) => void;
    onSelectPlaybackRate: (rate: number) => void;
}

type Tab = 'audio' | 'subtitle' | 'speed' | 'quality';

const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    onClose,
    audioTracks,
    textTracks,
    videoTracks,
    selectedAudioTrack,
    selectedTextTrack,
    selectedVideoTrack,
    playbackRate,
    onSelectAudioTrack,
    onSelectTextTrack,
    onSelectVideoTrack,
    onSelectPlaybackRate,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('audio');

    if (!visible) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'audio':
                return (
                    <ScrollView style={styles.contentScroll}>
                        {audioTracks.map((track, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.optionItem}
                                onPress={() => onSelectAudioTrack(i)}
                            >
                                <Text style={[styles.optionText, selectedAudioTrack === i && styles.selectedText]}>
                                    {track.language || `Track ${i + 1}`}
                                </Text>
                                {selectedAudioTrack === i && <Check color="#E50914" size={20} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
            case 'subtitle':
                return (
                    <ScrollView style={styles.contentScroll}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => onSelectTextTrack(1000)} // 1000 for disabled
                        >
                            <Text style={[styles.optionText, selectedTextTrack === 1000 && styles.selectedText]}>
                                None
                            </Text>
                            {selectedTextTrack === 1000 && <Check color="#E50914" size={20} />}
                        </TouchableOpacity>
                        {textTracks.map((track, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.optionItem}
                                onPress={() => onSelectTextTrack(i)}
                            >
                                <Text style={[styles.optionText, selectedTextTrack === i && styles.selectedText]}>
                                    {track.language || `Subtitle ${i + 1}`}
                                </Text>
                                {selectedTextTrack === i && <Check color="#E50914" size={20} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
            case 'speed':
                return (
                    <ScrollView style={styles.contentScroll}>
                        {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                            <TouchableOpacity
                                key={rate}
                                style={styles.optionItem}
                                onPress={() => onSelectPlaybackRate(rate)}
                            >
                                <Text style={[styles.optionText, playbackRate === rate && styles.selectedText]}>
                                    {rate}x
                                </Text>
                                {playbackRate === rate && <Check color="#E50914" size={20} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
            case 'quality':
                return (
                    <ScrollView style={styles.contentScroll}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => onSelectVideoTrack({ type: 'auto' })}
                        >
                            <Text style={[styles.optionText, selectedVideoTrack.type === 'auto' && styles.selectedText]}>
                                Auto
                            </Text>
                            {selectedVideoTrack.type === 'auto' && <Check color="#E50914" size={20} />}
                        </TouchableOpacity>
                        {videoTracks.map((track, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.optionItem}
                                onPress={() => onSelectVideoTrack({ type: 'index', value: i })}
                            >
                                <Text style={[styles.optionText, selectedVideoTrack.value === i && styles.selectedText]}>
                                    {track.height ? `${track.height}p` : `Quality ${i + 1}`}
                                </Text>
                                {selectedVideoTrack.value === i && <Check color="#E50914" size={20} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
        }
    };

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
            <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
            <Animated.View entering={SlideInDown.springify().damping(20)} exiting={SlideOutDown} style={styles.modal}>
                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X color="#fff" size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'audio' && styles.activeTab]}
                        onPress={() => setActiveTab('audio')}
                    >
                        <Globe color={activeTab === 'audio' ? '#fff' : '#aaa'} size={20} />
                        <Text style={[styles.tabText, activeTab === 'audio' && styles.activeTabText]}>Audio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'subtitle' && styles.activeTab]}
                        onPress={() => setActiveTab('subtitle')}
                    >
                        <Type color={activeTab === 'subtitle' ? '#fff' : '#aaa'} size={20} />
                        <Text style={[styles.tabText, activeTab === 'subtitle' && styles.activeTabText]}>Subtitle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'speed' && styles.activeTab]}
                        onPress={() => setActiveTab('speed')}
                    >
                        <Zap color={activeTab === 'speed' ? '#fff' : '#aaa'} size={20} />
                        <Text style={[styles.tabText, activeTab === 'speed' && styles.activeTabText]}>Speed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'quality' && styles.activeTab]}
                        onPress={() => setActiveTab('quality')}
                    >
                        <Monitor color={activeTab === 'quality' ? '#fff' : '#aaa'} size={20} />
                        <Text style={[styles.tabText, activeTab === 'quality' && styles.activeTabText]}>Quality</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {renderContent()}
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modal: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
        maxHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        gap: 4,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#E50914',
    },
    tabText: {
        color: '#aaa',
        fontSize: 12,
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        height: 250,
    },
    contentScroll: {
        padding: 16,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    optionText: {
        color: '#fff',
        fontSize: 16,
    },
    selectedText: {
        color: '#E50914',
        fontWeight: 'bold',
    },
});

export default SettingsModal;
