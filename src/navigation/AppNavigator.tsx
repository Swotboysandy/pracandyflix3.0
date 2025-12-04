import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import SearchScreen from '../screens/SearchScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PrimeScreen from '../screens/PrimeScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
            }}
        >
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'transparentModal' }} />
            <Stack.Screen name="Prime" component={PrimeScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
