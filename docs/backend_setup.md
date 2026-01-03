# Configuración del Backend (Firebase)

## Estado Actual
- **Framework**: Firebase SDK v11.7.0
- **Persistencia**: `@react-native-async-storage/async-storage` configurado para Auth.
- **Base de Datos**: Cloud Firestore.

## Configuración
El archivo `src/config/firebase.ts` inicializa la app con:
- Persistencia nativa (Login no se pierde al cerrar app).
- Singleton pattern para evitar múltiples inicializaciones.

## Variables de Entorno
Configuradas en `.env`:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Siguientes Pasos
1. **Guardar Capturas**: Crear función en `FlyIdService` para guardar `FlyAnalysisResult` en Firestore.
2. **Historial de Usuario**: Crear pantalla para listar moscas guardadas.
