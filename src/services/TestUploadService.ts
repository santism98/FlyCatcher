import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const runTestUpload = async () => {
    console.log("🚀 Iniciando prueba de subida a Firestore...");

    if (!auth.currentUser) {
        alert("ERROR: No hay usuario logueado. Inicia sesión primero.");
        return;
    }

    console.log("Usuario actual (UID):", auth.currentUser.uid);

    try {
        const testData = {
            userId: auth.currentUser.uid,
            flyIdentification: {
                commonName: "Mosca de Prueba (TEST)",
                imitatedInsect: {
                    order: "Ephemeroptera",
                    family: "Baetidae",
                    genus: "Baetis",
                    species: "Baetis Rhodani"
                },
                similarSpeciesDiscarded: ["Ninguna"],
                confidence: 0.99
            },
            description: "Esta es una entrada de prueba insertada manualmente para verificar la conexión.",
            mountingInstructions: ["Paso 1: Test", "Paso 2: Verificar Firebase"],
            localImageUri: "https://via.placeholder.com/150",
            imageUrl: "https://via.placeholder.com/150", // URL dummy
            createdAt: serverTimestamp(),
            searchTags: ["Test", "Debug"]
        };

        const docRef = await addDoc(collection(db, "datosMoscas"), testData);
        console.log("✅ ÉXITO: Documento de prueba guardado con ID:", docRef.id);
        alert(`Prueba exitosa. ID: ${docRef.id}`);
    } catch (error: any) {
        console.error("❌ ERROR CRÍTICO en subida de prueba:", error);
        console.error("Código de error:", error.code);
        console.error("Mensaje:", error.message);
        alert(`Error en prueba: ${error.message}`);
    }
};
