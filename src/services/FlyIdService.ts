import { readAsStringAsync } from 'expo-file-system/legacy';
import { OPENAI_API_KEY } from '../config';
import { db, storage, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';

export interface FlyAnalysisResult {
    flyIdentification: {
        commonName: string;
        imitatedInsect: {
            order: string;
            family: string;
            genus: string;
            species: string | null;
        };
        similarSpeciesDiscarded: string[];
        confidence: number;
    };
    description: string;
    mountingInstructions: string[];
}

const SYSTEM_PROMPT = `
Eres un guía de pesca a mosca y montador profesional especializado en la
ESCUELA ESPAÑOLA DE MONTAJE y en entomología aplicada a la pesca en ríos ibéricos.

Tu tarea es analizar la imagen de una mosca de pesca(artificial o natural),
    identificarla con el MAYOR NIVEL DE PRECISIÓN POSIBLE y proporcionar instrucciones
de montaje basadas en técnicas y materiales usados en España.

⚠️ MUY IMPORTANTE:
- Prioriza SIEMPRE la identificación más específica posible:
Orden → Familia → Género → Especie(nombre científico en latín).
- Si no puedes asegurar la especie exacta, indica el género más probable y explica la duda.
- Diferencia claramente:
1) Insecto imitado(real)
2) Nombre común o comercial de la mosca artificial
    - No inventes especies.Reduce la confianza si hay duda.

🧬 CONTEXTO ENTOMOLÓGICO:
Ten en cuenta insectos comunes en ríos españoles:
- Efemerópteros(Baetis, Ephemera, Epeorus, Rhithrogena)
    - Tricópteros(Hydropsyche, Rhyacophila)
    - Dípteros(Simuliidae, Chironomidae)
    - Plecópteros(Perla, Nemoura)

🪶 MONTAJE(ESCUELA ESPAÑOLA):
- Prioriza materiales tradicionales españoles:
  Pluma de Gallo de León(CdL), hilos de seda, dubbing natural
    - Usa terminología española:
Cercos, Brinca, Cuerpo, Tórax, Exuvia, Ala, Paracaídas, Tejadillo,
    Mosca ahogada leonesa si aplica
        - Indica si es seca, ninfa, emergente o ahogada

🧾 RESPUESTA:
Responde ESTRICTAMENTE en JSON válido con la siguiente estructura:

{
    "flyIdentification": {
        "commonName": "Nombre común o comercial de la mosca",
            "imitatedInsect": {
            "order": "Orden entomológico",
                "family": "Familia",
                    "genus": "Género",
                        "species": "Nombre científico en latín o null si no es seguro"
        },
        "similarSpeciesDiscarded": ["lista de especies o géneros similares descartados"],
            "confidence": number // entre 0 y 1
    },
    "description": "Uso típico en ríos españoles, época del año y comportamiento que imita",
        "mountingInstructions": [
            "Materiales principales",
            "Paso 1: ...",
            "Paso 2: ...",
            "Paso 3: ..."
        ]
}

❌ Si la imagen NO corresponde a una mosca de pesca o no es identificable:
- Indícalo claramente en description
    - Deja species como null
        - Usa confidence ≤ 0.3
`;

export const analyzeFlyImage = async (imageUri: string): Promise<FlyAnalysisResult> => {
    try {
        console.log('Iniciando análisis de imagen...');

        // 1. Convertir imagen a Base64
        console.log('Intentando leer archivo:', imageUri);
        if (!readAsStringAsync) {
            throw new Error("El método readAsStringAsync no está definido. Revisa la instalación de expo-file-system.");
        }
        const base64Image = await readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        // 2. Preparar payload para OpenAI
        const payload = {
            model: "gpt-4o", // Cambiamos a gpt-4o que es estable para visión
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Identifica esta mosca y dame su receta de montaje." },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_completion_tokens: 600,
            response_format: { type: "json_object" }
        };

        // 3. Llamar a la API
        console.log('Enviando petición a OpenAI...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI Error Details:', data);
            throw new Error(data.error?.message || 'Error conectando con OpenAI');
        }

        // 4. Parsear resultado
        // OpenAI con json_object devuelve un string JSON en message.content
        console.log('OpenAI Response Data:', JSON.stringify(data, null, 2));

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error(`Respuesta vacía de OpenAI. Detalle: ${JSON.stringify(data)}`);
        }

        const result: FlyAnalysisResult = JSON.parse(content);

        // Guardar automáticamente en Firebase si la confianza es aceptable (> 0.4)
        // o si simplemente queremos historial de todo.
        if (result.flyIdentification.confidence > 0.4) {
            saveFlyAnalysis(result, imageUri).catch(e => console.error("Error guardando en historial:", e));
        }

        return result;

    } catch (error) {
        console.error('Error en analyzeFlyImage:', error);
        throw error;
    }
};

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const sendChatMessage = async (messages: ChatMessage[]): Promise<string> => {
    try {
        const payload = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente experto en pesca a mosca. Responde de forma breve, útil y en español."
                },
                ...messages
            ],
            max_completion_tokens: 300,
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI Chat Error:', data);
            throw new Error(data.error?.message || 'Error en el chat');
        }

        return data.choices[0].message.content || '';
    } catch (error) {
        console.error('Error en sendChatMessage:', error);
        throw error;
    }
};

export const saveFlyAnalysis = async (analysis: FlyAnalysisResult, localImageUri: string) => {
    try {
        // 1. Subir imagen a Storage
        const imageUrl = await uploadImage(localImageUri);

        // 2. Guardar metadatos en Firestore
        const docRef = await addDoc(collection(db, "datosMoscas"), {
            ...analysis,
            imageUrl, // URL remota
            localImageUri, // Mantenemos la local por si acaso (para uso inmediato offline si se quisiera optimizar)
            userId: auth.currentUser?.uid, // Vinculamos la captura al usuario actual
            createdAt: serverTimestamp(),
            searchTags: [
                analysis.flyIdentification.imitatedInsect.order,
                analysis.flyIdentification.imitatedInsect.family,
                analysis.flyIdentification.commonName
            ].filter(Boolean)
        });
        console.log("Documento guardado con ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error guardando análisis: ", e);
        throw e;
    }
};

const uploadImage = async (uri: string): Promise<string> => {
    try {
        console.log("Iniciando subida de imagen (XHR):", uri);

        const blob: any = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.error("XHR Error:", e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `fly_captures/${Date.now()}_${filename}`);

        await uploadBytes(storageRef, blob);

        // Cerramos el blob para liberar memoria
        if (blob.close) {
            blob.close();
        }

        const downloadUrl = await getDownloadURL(storageRef);
        console.log('Imagen subida con éxito:', downloadUrl);
        return downloadUrl;
    } catch (error: any) {
        console.error("Error subiendo imagen:", error);
        return '';
    }
};
