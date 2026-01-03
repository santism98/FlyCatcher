import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// ⚠️ REEMPLAZA ESTO CON TU 'WEB CLIENT ID' DE FIREBASE/GOOGLE CLOUD
// Lo encontrarás en Firebase Console -> Authentication -> Sign-in method -> Google -> Web SDK configuration
const GOOGLE_WEB_CLIENT_ID = '1020208098882-9hck9ahstjmioabeln7015qpsrjig0sl.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    // Configuración de Google Auth
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        // Si usas Expo Go en Android/iOS, a veces ayuda poner el mismo ID aquí por si acaso,
        // aunque lo ideal es tener IDs nativos específicos.
        androidClientId: GOOGLE_WEB_CLIENT_ID,
        iosClientId: GOOGLE_WEB_CLIENT_ID,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            setLoading(true);
            signInWithCredential(auth, credential)
                .catch((error) => {
                    console.error("Error Google Auth:", error);
                    Alert.alert("Error Google", error.message);
                })
                .finally(() => setLoading(false));
        }
    }, [response]);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa email y contraseña');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error: any) {
            console.error("Auth Error Detailed:", error.code, error.message);
            let msg = error.message;
            if (error.code === 'auth/invalid-credential') msg = 'Credenciales inválidas. Verifica tu email y contraseña.';
            if (error.code === 'auth/invalid-email') msg = 'El email no es válido.';
            if (error.code === 'auth/user-not-found') msg = 'Usuario no encontrado.';
            if (error.code === 'auth/wrong-password') msg = 'Contraseña incorrecta.';
            if (error.code === 'auth/email-already-in-use') msg = 'Este email ya está registrado.';
            if (error.code === 'auth/weak-password') msg = 'La contraseña debe tener al menos 6 caracteres.';

            Alert.alert('Error de Autenticación', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>FlyCatcher 🎣</Text>
                    <Text style={styles.subtitle}>Tu compañero de pesca inteligente</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.headerText}>{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#aaa"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#aaa"
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAuth}
                        disabled={loading || !request}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Botón de Google */}
                    <TouchableOpacity
                        style={[styles.button, styles.googleButton]}
                        onPress={() => promptAsync()}
                        disabled={!request || loading}
                    >
                        <Text style={[styles.buttonText, styles.googleButtonText]}>Iniciar sesión con Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={styles.switchText}>
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 40,
        fontWeight: '900',
        color: '#2e7d32',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    formContainer: {
        width: '100%',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#333',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    button: {
        backgroundColor: '#2e7d32',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 16,
        shadowColor: '#000',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    googleButtonText: {
        color: '#333',
    },
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: '#2e7d32',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default LoginScreen;
