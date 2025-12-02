import React from 'react';
import { useProvider } from '../context/ProviderContext';
import HomeScreen from '../screens/HomeScreen';
import PrimeScreen from '../screens/PrimeScreen';

const HomeWrapper = () => {
    const { provider } = useProvider();

    if (provider === 'Prime') {
        return <PrimeScreen />;
    }

    return <HomeScreen />;
};

export default HomeWrapper;
