import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
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
      quality: 1, // Keeps the original high-res quality
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
            saveToLocalByLongPress={false}
            enableSwipeDown={false}
            
            // --- THE ZOOM OVERDRIVE SETTINGS ---
            maxScale={100}           // Allows 100x magnification
            doubleClickConfigs={{
              zoomFactor: 10,        // Double tap jumps to 10x instantly
            }}
            enableDoubleClickZoom={true}
            // ----------------------------------
          />
        ) : (
          <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
            <Text style={styles.placeholderText}>+ TAP TO LOAD IMAGE</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>{image ? "CHANGE IMAGE" : "OPEN GALLERY"}</Text>
        </TouchableOpacity>
        {image && (
          <TouchableOpacity onPress={() => setImage(null)}>
            <Text style={styles.clearText}>RESET</Text>
          </TouchableOpacity>
        )}
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
    borderColor: '#222'
  },
  title: { color: '#00ffcc', fontSize: 18, fontWeight: 'bold', letterSpacing: 3 },
  canvas: { flex: 1 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#00ffcc', fontSize: 16, opacity: 0.6 },
  footer: { backgroundColor: '#111', paddingBottom: 40, alignItems: 'center', paddingTop: 10 },
  button: { 
    backgroundColor: '#00ffcc', 
    paddingVertical: 15, 
    paddingHorizontal: 50, 
    borderRadius: 30, 
  },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  clearText: { color: '#ff4444', marginTop: 15, fontWeight: '900', letterSpacing: 1 }
});
