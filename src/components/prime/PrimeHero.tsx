import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Defs, Rect, LinearGradient, Stop } from 'react-native-svg';
import { Plus, Info, Check } from 'lucide-react-native';
import { Movie } from '../../services/api';

const { width, height } = Dimensions.get('window');

interface PrimeHeroProps {
    movie: Movie;
    onPress: (movie: Movie) => void;
}

const PrimeHero = ({ movie, onPress }: PrimeHeroProps) => {
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(movie)} style={styles.container}>
            <Image
                source={{ uri: movie.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.gradient}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="transparent" stopOpacity="0" />
                            <Stop offset="0.5" stopColor="rgba(0,0,0,0.2)" stopOpacity="0.2" />
                            <Stop offset="1" stopColor="#000" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                </Svg>
            </View>

            <View style={styles.contentWrapper}>
                <View style={styles.content}>
                    <Text style={styles.amazonOriginal}>AMAZON ORIGINAL</Text>

                    {/* Title - ideally this would be a logo image */}
                    <Text style={styles.title}>{movie.title}</Text>

                    <View style={styles.primeRow}>
                        <View style={styles.primeBadge}>
                            <View style={styles.checkCircle}>
                                <Check size={10} color="white" strokeWidth={4} />
                            </View>
                            <Text style={styles.primeText}>Included with prime</Text>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Plus size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Info size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        <View style={[styles.dot, styles.activeDot]} />
                        {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                            <View key={i} style={styles.dot} />
                        ))}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        height: height * 0.65, // Occupy significant screen height
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
    },
    contentWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
    },
    content: {
        paddingHorizontal: 20,
    },
    amazonOriginal: {
        color: '#ccc',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    title: {
        color: 'white',
        fontSize: 40,
        fontWeight: '900',
        marginBottom: 15,
        // fontFamily: 'sans-serif-condensed', // Optional if available
    },
    primeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    primeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkCircle: {
        backgroundColor: '#00A8E1',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        gap: 20,
    },
    iconButton: {
        padding: 5,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    activeDot: {
        backgroundColor: '#00A8E1',
    },
});

export default PrimeHero;
