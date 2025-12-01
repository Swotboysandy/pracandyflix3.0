import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const { width } = Dimensions.get('window');

const HomeSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Hero Banner Skeleton */}
            <View style={styles.heroWrapper}>
                <SkeletonLoader
                    width={width - 40}
                    height={(width - 40) * 1.5}
                    borderRadius={12}
                />
            </View>

            {/* Rows Skeletons */}
            {[1, 2, 3].map((_, index) => (
                <View key={index} style={styles.rowContainer}>
                    <SkeletonLoader width={150} height={20} style={styles.title} />
                    <View style={styles.moviesRow}>
                        {[1, 2, 3, 4].map((__, idx) => (
                            <SkeletonLoader
                                key={idx}
                                width={90}
                                height={135}
                                borderRadius={4}
                                style={styles.movie}
                            />
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 100, // Adjust based on header height
    },
    heroWrapper: {
        alignItems: 'center',
        marginBottom: 30,
    },
    rowContainer: {
        marginBottom: 24,
    },
    title: {
        marginLeft: 16,
        marginBottom: 12,
    },
    moviesRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    movie: {
        marginRight: 8,
    },
});

export default HomeSkeleton;
