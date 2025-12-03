import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Film, Tv, LayoutGrid, TestTube } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import ProviderScreen from '../screens/ProviderScreen';
import HomeWrapper from '../screens/HomeWrapper';
import ApiTestScreen from '../screens/ApiTestScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#000',
                    borderTopColor: '#333',
                    paddingBottom: 20,
                    paddingTop: 10,
                    height: 80,
                    elevation: 0,
                },
                tabBarActiveTintColor: '#E50914',
                tabBarInactiveTintColor: '#999',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: 5,
                },
                tabBarIconStyle: {
                    marginTop: 5,
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeWrapper}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Movies"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Movies',
                    tabBarIcon: ({ color, size }) => <Film color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Series"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Series',
                    tabBarIcon: ({ color, size }) => <Tv color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="ProviderTab"
                component={ProviderScreen}
                options={{
                    tabBarLabel: 'Provider',
                    tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="ApiTest"
                component={ApiTestScreen}
                options={{
                    tabBarLabel: 'API Test',
                    tabBarIcon: ({ color, size }) => <TestTube color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
