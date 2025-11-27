import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Film, Tv, Search } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#000',
                    borderTopColor: '#333',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60, // Keep height but ensure content fits
                    elevation: 0, // Remove shadow on Android to avoid artifacts
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
                component={HomeScreen}
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
                name="SearchTab"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Search',
                    tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
