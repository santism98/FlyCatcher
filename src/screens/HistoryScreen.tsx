import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlyAnalysisResult } from '../services/FlyIdService';

interface CatchItem extends FlyAnalysisResult {
    id: string;
    localImageUri: string;
    imageUrl?: string;
}

const HistoryScreen = () => {
    const [catches, setCatches] = useState<CatchItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) return;

        // Requiere un índice compuesto en Firestore: userId + createdAt
        // Si falla, revisa la consola para el link de creación automática
        const q = query(
            collection(db, "datosMoscas"),
            where("userId", "==", auth.currentUser.uid),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newCatches: CatchItem[] = [];
            snapshot.forEach((doc) => {
                newCatches.push({ id: doc.id, ...doc.data() } as CatchItem);
            });
            setCatches(newCatches);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching catches: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }: { item: CatchItem }) => {
        // Formatear la identificación para mostrar: Orden > Familia (o Género)
        const insect = item.flyIdentification.imitatedInsect;
        const mainTitle = item.flyIdentification.commonName || "Mosca Desconocida";
        const subtitle = `${insect.order} > ${insect.family}`;

        // Calcular confianza para mostrar (ej: 90%)
        const confidencePct = Math.round(item.flyIdentification.confidence * 100);

        return (
            <View style={styles.card}>
                <Image
                    source={{ uri: item.imageUrl || item.localImageUri }}
                    style={styles.thumbnail}
                    // Fallback visual si la imagen local ya no existe
                    defaultSource={require('../../assets/adaptive-icon.png')}
                />
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{mainTitle}</Text>
                    <Text style={styles.cardSubtitle}>{subtitle}</Text>
                    <Text style={[styles.confidence, { color: confidencePct > 80 ? '#2e7d32' : 'orange' }]}>
                        {confidencePct}% Confianza
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text>Cargando capturas...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Historial de Capturas 📜</Text>
            </View>
            <FlatList
                data={catches}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay capturas guardadas aún.</Text>
                        <Text style={styles.emptySubText}>Identifica moscas para verlas aquí.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 15,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        alignItems: 'center',
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    confidence: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
    }
});

export default HistoryScreen;
