import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { RootStackParamList } from '../types/navigation';
import { View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2e7d32" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            {user ? (
                // Stack para usuarios logueados
                <>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: true, title: 'Análisis' }} />
                    <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat GPT' }} />
                    <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: true, title: 'Historial' }} />
                </>
            ) : (
                // Stack para usuarios NO logueados (Auth)
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
