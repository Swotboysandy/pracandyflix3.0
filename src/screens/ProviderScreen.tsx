import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import { Check } from 'lucide-react-native';

import { useProvider } from '../context/ProviderContext';

const { width } = Dimensions.get('window');

const ProviderScreen = () => {
    const navigation = useNavigation();
    const { provider, setProvider } = useProvider();
    const [selectedProvider, setSelectedProvider] = React.useState<'Netflix' | 'Prime'>(provider);

    const handleProviderSelect = (newProvider: 'Netflix' | 'Prime') => {
        setSelectedProvider(newProvider);
        setProvider(newProvider);

        // Navigate to the HomeTab which will now render the correct screen based on context
        navigation.navigate('HomeTab' as never);
    };

    return (
        <GradientBackground colors={['#39101E', '#080204']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <Text style={styles.title}>Who's Watching?</Text>

            <View style={styles.providersContainer}>
                <TouchableOpacity
                    style={[styles.providerCard, selectedProvider === 'Netflix' && styles.selectedCard]}
                    onPress={() => handleProviderSelect('Netflix')}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{ uri: 'https://images.ctfassets.net/y2ske730sjqp/5QQ9SVIdc1tmkqrtFnG9U1/de758bba0f65dcc1c6bc1f31f161003d/BrandAssets_Logos_02-NSymbol.jpg?w=940' }}
                        style={[styles.logo, { width: '100%', height: '100%', borderRadius: 12 }]}
                        resizeMode="cover"
                    />
                    {selectedProvider === 'Netflix' && (
                        <View style={styles.checkBadge}>
                            <Check color="#fff" size={16} strokeWidth={3} />
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.providerCard, selectedProvider === 'Prime' && styles.selectedCard]}
                    onPress={() => handleProviderSelect('Prime')}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{ uri: 'https://m.media-amazon.com/images/G/01/AdProductsWebsite/images/campaigns/primeVideo/pv-tile-white-on-blue_500x._TTW_.png' }}
                        style={[styles.logo, { width: '100%', height: '100%', borderRadius: 12 }]}
                        resizeMode="cover"
                    />
                    {selectedProvider === 'Prime' && (
                        <View style={styles.checkBadge}>
                            <Check color="#fff" size={16} strokeWidth={3} />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Select your content provider</Text>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    providersContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 30,
    },
    providerCard: {
        width: width * 0.35,
        height: width * 0.35,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: '#E50914',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    logo: {
        width: '80%',
        height: '80%',
    },
    checkBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#E50914',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    subtitle: {
        color: '#999',
        fontSize: 14,
        marginTop: 20,
    },
});

export default ProviderScreen;
