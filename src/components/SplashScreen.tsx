import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const animationRef = useRef<LottieView>(null);

    useEffect(() => {
        // Play the animation
        animationRef.current?.play();
    }, []);

    return (
        <View style={styles.container}>
            <LottieView
                ref={animationRef}
                source={require('../assets/splash.json')}
                autoPlay
                loop={false}
                resizeMode="contain"
                style={styles.animation}
                onAnimationFinish={onFinish}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Match Netflix background
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        width: width * 0.8,
        height: height * 0.8,
    },
});

export default SplashScreen;
