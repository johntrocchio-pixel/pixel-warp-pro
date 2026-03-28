import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function App() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Gallery access is required.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1, 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const images = image ? [{ url: image }] : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PIXEL MICROSCOPE PRO</Text>
      </View>

      <View style={styles.canvas}>
        {image ? (
          <ImageViewer 
            imageUrls={images}
            renderIndicator={() => null} 
            backgroundColor="#000"
            
            // --- FIXING THE PINCH-TO-ZOOM ---
            enablePinchZoom={true}       // Force enable the gesture
            maxScale={500}               // Extreme zoom depth
            minScale={1}
            useNativeDriver={true}       // Uses hardware for smoother response
            maxOverflow={0}              // Prevents the "sliding away" feel
            
            doubleClickConfigs={{
              zoomFactor: 20,           // Fast jump to pixels
            }}
            
            // KEEPING IT SHARP (NO BLUR)
            renderImage={(props) => (
              <Image 
                {...props} 
                style={[props.style, { 
                    resizeMode: 'contain',
                }]} 
                // Hardware-level sharpness for Android
                textureConfig={{
                  minFilter: 'nearest',
                  magFilter: 'nearest',
                }}
              />
            )}
          />
        ) : (
          <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
            <Text style={styles.placeholderText}>+ LOAD IMAGE</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>{image ? "CHANGE IMAGE" : "OPEN GALLERY"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: 50, alignItems: 'center', backgroundColor: '#111', paddingBottom: 20 },
  title: { color: '#00ffcc', fontSize: 18, fontWeight: 'bold', letterSpacing: 4 },
  canvas: { flex: 1 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#00ffcc', fontSize: 16, opacity: 0.6 },
  footer: { backgroundColor: '#111', paddingBottom: 40, alignItems: 'center', paddingTop: 10 },
  button: { backgroundColor: '#00ffcc', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 5 },
  buttonText: { color: '#000', fontWeight: 'bold' },
});
