import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import SearchScreen from '../screens/SearchScreen';
import PlayerScreen from '../screens/PlayerScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                presentation: 'card',
            }}
        >
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'transparentModal' }} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
