import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { runTestUpload } from '../services/TestUploadService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Se requiere acceso a la cámara para tomar fotos.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            navigation.navigate('Result', { imageUri: result.assets[0].uri });
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Se requiere acceso a la galería.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            navigation.navigate('Result', { imageUri: result.assets[0].uri });
        }
    }; // Fin de pickImage

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // El listener de AppNavigator redirigirá automáticamente al Login
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>FlyCatcher</Text>
                    <Text style={styles.subtitle}>Identificador de Moscas con IA</Text>
                </View>

                <View style={styles.placeholderContainer}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
                        <Text style={styles.primaryButtonText}>📷 Capturar Mosca</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
                        <Text style={styles.secondaryButtonText}>🖼️ Abrir Galería</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tertiaryButton} onPress={() => navigation.navigate('Chat')}>
                        <Text style={styles.tertiaryButtonText}>💬 Chat con IA</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('History')}>
                        <Text style={styles.historyButtonText}>📜 Historial</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.logoutButton, { marginTop: 20, backgroundColor: '#fff3e0', borderColor: 'orange' }]} onPress={runTestUpload}>
                        <Text style={[styles.logoutButtonText, { color: 'orange' }]}>⚠️ TEST FIREBASE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
    },
    header: {
        marginTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2196F3',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 250,
        height: 250,
    },
    buttonContainer: {
        gap: 16,
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    secondaryButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    tertiaryButton: {
        backgroundColor: '#e3f2fd',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    tertiaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2196F3',
    },
    historyButton: {
        backgroundColor: '#fff3e0',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    historyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f57c00',
    },
    logoutButton: {
        backgroundColor: '#ffebee',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ffcdd2'
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#c62828',
    },
});

export default HomeScreen;
