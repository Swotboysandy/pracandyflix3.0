import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PrimeHeader = () => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.activePill}>
                <Text style={styles.activeText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pill}>
                <Text style={styles.text}>Movies</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pill}>
                <Text style={styles.text}>Series</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
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
});

export default PrimeHeader;
