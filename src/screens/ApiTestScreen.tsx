import React from 'react';
import { View } from 'react-native';
import NetflixApiTest from '../components/NetflixApiTest';

const ApiTestScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            <NetflixApiTest onClose={() => {
                // This is inside a tab, so we don't need to close
                // But you could navigate back if this was a modal
                console.log('Test screen close requested');
            }} />
        </View>
    );
};

export default ApiTestScreen;
