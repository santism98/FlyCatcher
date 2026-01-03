import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { analyzeFlyImage, FlyAnalysisResult } from '../services/FlyIdService';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const ResultScreen = ({ route, navigation }: Props) => {
    const { imageUri } = route.params;
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<FlyAnalysisResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        analyzeImage();
    }, []);

    const analyzeImage = async () => {
        try {
            setErrorMsg(null);
            const data = await analyzeFlyImage(imageUri);
            setResult(data);
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error.message || 'Error desconocido al analizar la imagen.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Analizando mosca con IA...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: imageUri }} style={styles.image} />

                {errorMsg && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTitle}>Error</Text>
                        <Text style={styles.errorText}>{errorMsg}</Text>
                        <Text style={styles.errorHint}>Verifica tu conexión y clave API.</Text>
                    </View>
                )}

                {result && (
                    <View style={styles.resultContainer}>
                        {/* Identificación Principal */}
                        <Text style={styles.label}>Nombre Común:</Text>
                        <Text style={styles.speciesName}>{result.flyIdentification.commonName}</Text>

                        <View style={styles.confidenceContainer}>
                            <Text style={styles.confidenceLabel}>Confianza:</Text>
                            <Text style={[
                                styles.confidenceValue,
                                { color: result.flyIdentification.confidence > 0.7 ? '#2e7d32' : '#f57c00' }
                            ]}>
                                {(result.flyIdentification.confidence * 100).toFixed(0)}%
                            </Text>
                        </View>

                        {result.flyIdentification.confidence < 0.6 && (
                            <View style={styles.lowConfidenceContainer}>
                                <Text style={styles.lowConfidenceTitle}>⚠️ Atención</Text>
                                <Text style={styles.lowConfidenceText}>
                                    La foto es de baja calidad o no se ha podido detectar correctamente.
                                    Recuerda que el sistema está optimizado solo para moscas y ninfas, no para otros objetos.
                                </Text>
                            </View>
                        )}

                        {/* Datos Entomológicos */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>🧬 Entomología (Insecto Imitado)</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Orden:</Text>
                                <Text style={styles.infoValue}>{result.flyIdentification.imitatedInsect.order || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Familia:</Text>
                                <Text style={styles.infoValue}>{result.flyIdentification.imitatedInsect.family || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Género:</Text>
                                <Text style={styles.infoValue}>{result.flyIdentification.imitatedInsect.genus || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Especie:</Text>
                                <Text style={[styles.infoValue, { fontStyle: 'italic' }]}>
                                    {result.flyIdentification.imitatedInsect.species || '-'}
                                </Text>
                            </View>
                        </View>

                        {/* Descripción */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>📝 Descripción y Uso</Text>
                            <Text style={styles.description}>{result.description}</Text>
                        </View>

                        {/* Receta de Montaje */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>🪶 Pasos de Montaje</Text>
                            <View style={styles.instructionsContainer}>
                                {result.mountingInstructions.map((instruction, index) => (
                                    <View key={index} style={styles.instructionRow}>
                                        <Text style={styles.instructionBullet}>•</Text>
                                        <Text style={styles.instructionText}>{instruction}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.buttonText}>Analizar otra</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    resultContainer: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: '#666',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    speciesName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1b5e20', // Green shade suitable for nature/fly fishing
        marginBottom: 10,
    },
    confidenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f1f8e9',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    confidenceLabel: {
        fontSize: 14,
        color: '#555',
        marginRight: 6,
    },
    confidenceValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionContainer: {
        marginTop: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    infoLabel: {
        width: 80,
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    infoValue: {
        flex: 1,
        fontSize: 15,
        color: '#222',
    },
    description: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
    },
    instructionsContainer: {
        marginTop: 5,
    },
    instructionRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    instructionBullet: {
        fontSize: 18,
        color: '#2e7d32',
        marginRight: 8,
        lineHeight: 22,
    },
    instructionText: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#2196F3',
        margin: 20,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        padding: 20,
        margin: 20,
        backgroundColor: '#ffebee',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#c62828',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#b71c1c',
        marginBottom: 8,
    },
    errorHint: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    lowConfidenceContainer: {
        marginTop: 15,
        marginBottom: 5,
        backgroundColor: '#fff3cd',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    lowConfidenceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 4,
    },
    lowConfidenceText: {
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
    },
});

export default ResultScreen;
