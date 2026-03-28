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
        <Text style={styles.title}>PIXEL MICROSCOPE SHARP</Text>
      </View>

      <View style={styles.canvas}>
        {image ? (
          <ImageViewer 
            imageUrls={images}
            renderIndicator={() => null} 
            backgroundColor="#000"
            enablePinchZoom={true}
            maxScale={500} // Extreme depth
            minScale={1}
            doubleClickConfigs={{
              zoomFactor: 25, // Jump deep into pixels on double tap
            }}
            // THIS SECTION KILLS THE BLUR
            renderImage={(props) => (
              <Image 
                {...props} 
                style={[props.style, { 
                    // This is the specific Android fix for pixelated scaling
                    renderToHardwareTextureAndroid: true,
                }]} 
                // Forces the OS to not smooth the image
                resizeMethod="scale" 
                fadeDuration={0}
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
          <Text style={styles.buttonText}>{image ? "NEW IMAGE" : "OPEN GALLERY"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    paddingTop: 50, 
    alignItems: 'center', 
    backgroundColor: '#111', 
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#00ffcc33' 
  },
  title: { color: '#00ffcc', fontSize: 18, fontWeight: 'bold', letterSpacing: 4 },
  canvas: { flex: 1 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#00ffcc', fontSize: 14, opacity: 0.5 },
  footer: { backgroundColor: '#111', paddingBottom: 40, alignItems: 'center', paddingTop: 15 },
  button: { 
    backgroundColor: '#00ffcc', 
    paddingVertical: 15, 
    paddingHorizontal: 50, 
    borderRadius: 2 
  },
  buttonText: { color: '#000', fontWeight: 'bold', letterSpacing: 1 },
});
