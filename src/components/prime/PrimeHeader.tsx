import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface PrimeHeaderProps {
    activeCategory: string;
    onCategoryPress: (category: string) => void;
    onSearchPress: () => void;
}

const PrimeHeader = ({ activeCategory, onCategoryPress, onSearchPress }: PrimeHeaderProps) => {
    const categories = ['All', 'Movies', 'Series'];

    return (
        <View style={styles.container}>
            <View style={styles.pillsContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={activeCategory === category ? styles.activePill : styles.pill}
                        onPress={() => onCategoryPress(category)}
                    >
                        <Text style={activeCategory === category ? styles.activeText : styles.text}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity onPress={onSearchPress} style={styles.searchButton}>
                <Image
                    source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/search--v1.png' }}
                    style={styles.searchIcon}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    pillsContainer: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
    },
    activePill: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    activeText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 14,
    },
    text: {
        color: '#aaa',
        fontWeight: 'bold',
        fontSize: 14,
    },
    searchButton: {
        padding: 5,
    },
    searchIcon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
});

export default PrimeHeader;
