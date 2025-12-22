import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import ChatScreen from '../screens/ChatScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: true, title: 'Análisis' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat GPT' }} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
