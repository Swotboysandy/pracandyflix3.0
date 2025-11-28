import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { X, Check, Settings as SettingsIcon, Type, Gauge, Layers, Music } from 'lucide-react-native';
import { StreamSource, StreamTrack } from '../../services/api';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    sources?: StreamSource[];
    tracks?: StreamTrack[]; // All tracks
    selectedSource?: StreamSource;
    selectedTextTrack?: StreamTrack | null;
    selectedAudioTrack?: StreamTrack | null;
    playbackSpeed: number;
    onSelectSource: (source: StreamSource) => void;
    onSelectTextTrack: (track: StreamTrack | null) => void;
    onSelectAudioTrack: (track: StreamTrack | null) => void;
    onSelectSpeed: (speed: number) => void;
}

type Tab = 'quality' | 'audio' | 'subtitles' | 'speed';

const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    onClose,
    sources = [],
    tracks = [],
    selectedSource,
    selectedTextTrack,
    selectedAudioTrack,
    playbackSpeed,
    onSelectSource,
    onSelectTextTrack,
    onSelectAudioTrack,
    onSelectSpeed,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('quality');

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

    // Filter tracks
    const subtitleTracks = tracks.filter(t => t.kind !== 'audio'); // Assuming non-audio are subs/captions
    const audioTracks = tracks.filter(t => t.kind === 'audio');

    const renderTabButton = (id: Tab, icon: React.ReactNode, label: string) => (
        <TouchableOpacity
            style={[styles.tabButton, activeTab === id && styles.activeTabButton]}
            onPress={() => setActiveTab(id)}
        >
            {icon}
            <Text style={[styles.tabLabel, activeTab === id && styles.activeTabLabel]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderQualityOptions = () => (
        <ScrollView style={styles.optionsList}>
            {sources.map((source, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => onSelectSource(source)}
                >
                    <Text style={[styles.optionText, selectedSource?.file === source.file && styles.selectedOptionText]}>
                        {source.label || 'Auto'}
                    </Text>
                    {selectedSource?.file === source.file && <Check color="#E50914" size={20} />}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderSubtitleOptions = () => (
        <ScrollView style={styles.optionsList}>
            <TouchableOpacity
                style={styles.optionItem}
                onPress={() => onSelectTextTrack(null)}
            >
                <Text style={[styles.optionText, selectedTextTrack === null && styles.selectedOptionText]}>Off</Text>
                {selectedTextTrack === null && <Check color="#E50914" size={20} />}
            </TouchableOpacity>
            {subtitleTracks.map((track, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => onSelectTextTrack(track)}
                >
                    <Text style={[styles.optionText, selectedTextTrack?.file === track.file && styles.selectedOptionText]}>
                        {track.label || 'Unknown'}
                    </Text>
                    {selectedTextTrack?.file === track.file && <Check color="#E50914" size={20} />}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderAudioOptions = () => (
        <ScrollView style={styles.optionsList}>
            {/* If no explicit audio tracks, maybe show 'Default' or similar? 
                 Usually video has at least one audio track. 
                 If tracks array is empty, we might not show this tab or show 'Default'.
             */}
            {audioTracks.length === 0 && (
                <View style={styles.optionItem}>
                    <Text style={styles.optionText}>Default Audio</Text>
                    <Check color="#E50914" size={20} />
                </View>
            )}
            {audioTracks.map((track, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => onSelectAudioTrack(track)}
                >
                    <Text style={[styles.optionText, selectedAudioTrack?.file === track.file && styles.selectedOptionText]}>
                        {track.label || 'Unknown'}
                    </Text>
                    {selectedAudioTrack?.file === track.file && <Check color="#E50914" size={20} />}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderSpeedOptions = () => (
        <ScrollView style={styles.optionsList}>
            {speeds.map((speed) => (
                <TouchableOpacity
                    key={speed}
                    style={styles.optionItem}
                    onPress={() => onSelectSpeed(speed)}
                >
                    <Text style={[styles.optionText, playbackSpeed === speed && styles.selectedOptionText]}>
                        {speed}x
                    </Text>
                    {playbackSpeed === speed && <Check color="#E50914" size={20} />}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    if (!visible) return null;

    return (
        <View style={styles.modalContainer} onTouchEnd={(e) => e.stopPropagation()}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.sidePanel}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Settings</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <X color="#fff" size={24} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.tabsContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
                                    {renderTabButton('quality', <Layers color={activeTab === 'quality' ? '#000' : '#fff'} size={18} />, 'Quality')}
                                    {renderTabButton('audio', <Music color={activeTab === 'audio' ? '#000' : '#fff'} size={18} />, 'Audio')}
                                    {renderTabButton('subtitles', <Type color={activeTab === 'subtitles' ? '#000' : '#fff'} size={18} />, 'Subtitles')}
                                    {renderTabButton('speed', <Gauge color={activeTab === 'speed' ? '#000' : '#fff'} size={18} />, 'Speed')}
                                </ScrollView>
                            </View>

                            <View style={styles.content}>
                                {activeTab === 'quality' && renderQualityOptions()}
                                {activeTab === 'audio' && renderAudioOptions()}
                                {activeTab === 'subtitles' && renderSubtitleOptions()}
                                {activeTab === 'speed' && renderSpeedOptions()}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        elevation: 100,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align to right
    },
    sidePanel: {
        width: 350, // Increased width
        height: '100%',
        backgroundColor: '#1a1a1a',
        padding: 20,
        paddingTop: 40, // Add top padding for status bar
        shadowColor: "#000",
        shadowOffset: {
            width: -2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabsContainer: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    tabsContent: {
        flexDirection: 'row',
        gap: 10,
        paddingBottom: 10,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#333',
        gap: 6,
    },
    activeTabButton: {
        backgroundColor: '#fff',
    },
    tabLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    activeTabLabel: {
        color: '#000',
    },
    content: {
        flex: 1,
    },
    optionsList: {
        flex: 1,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    optionText: {
        color: '#ccc',
        fontSize: 14,
    },
    selectedOptionText: {
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default SettingsModal;
