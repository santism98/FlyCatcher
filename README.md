# FlyCatcher 🎣

Aplicación móvil de identificación de moscas de pesca mediante IA, especializada en la **Escuela Española de Montaje** y entomología aplicada a ríos ibéricos.

## 📱 Características

- **Identificación de Moscas**: Analiza fotos de moscas artificiales o insectos naturales usando OpenAI Vision API
- **Entomología Detallada**: Clasificación científica completa (Orden → Familia → Género → Especie)
- **Recetas de Montaje**: Instrucciones paso a paso con terminología española tradicional
- **Chat con IA**: Asistente experto en pesca a mosca para consultas
- **Detección de Confianza**: Avisos automáticos cuando la calidad de imagen es baja

## 🛠️ Tecnologías

- **React Native** con Expo
- **TypeScript**
- **React Navigation**
- **OpenAI GPT-4o** (Vision API)
- **Expo Image Picker**

## 🚀 Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Expo Go app en tu dispositivo móvil ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Pasos

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/FlyCatcher.git
   cd FlyCatcher
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` y añade tu clave de OpenAI:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=tu_clave_api_aqui
   ```
   
   > Obtén tu API key en: https://platform.openai.com/api-keys

4. **Inicia el servidor de desarrollo**
   ```bash
   npm start
   ```

5. **Escanea el QR** con Expo Go desde tu dispositivo móvil

## 📖 Uso

1. **Identificar Mosca**: Toma una foto o selecciona una imagen de tu galería
2. **Ver Resultados**: Obtén la clasificación entomológica, descripción y receta de montaje
3. **Chat**: Pregunta al asistente sobre técnicas, materiales o especies

## 🔒 Seguridad

- El archivo `.env` está incluido en `.gitignore` para proteger tu API key
- Nunca compartas tu clave de OpenAI públicamente
- Revisa los límites de uso de tu cuenta de OpenAI

## 📝 Estructura del Proyecto

```
FlyCatcher/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── navigation/      # Configuración de navegación
│   ├── screens/         # Pantallas de la app
│   ├── services/        # Servicios (OpenAI API)
│   ├── styles/          # Estilos globales
│   └── types/           # Definiciones TypeScript
├── .env                 # Variables de entorno (no incluido en git)
├── .env.example         # Plantilla de variables de entorno
├── App.tsx              # Punto de entrada
└── package.json         # Dependencias
```

## 🐛 Solución de Problemas

### Error "Invalid MIME type"
- Asegúrate de que estás usando una imagen en formato JPEG o PNG
- Verifica que la imagen no esté corrupta

### Error de API Key
- Confirma que tu `.env` contiene la clave correcta
- Reinicia el servidor de Expo después de modificar `.env`

### Baja confianza en resultados
- Usa fotos con buena iluminación
- Enfoca bien la mosca o insecto
- El sistema está optimizado para moscas y ninfas, no otros objetos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 👨‍💻 Autor

Desarrollado con ❤️ para la comunidad de pesca a mosca española.
