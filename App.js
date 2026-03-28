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
        <Text style={styles.title}>PIXEL TOGGLE PRO</Text>
      </View>

      <View style={styles.canvas}>
        {image ? (
          <ImageViewer 
            imageUrls={images}
            renderIndicator={() => null} 
            backgroundColor="#000"
            enablePinchZoom={true}
            maxScale={500} 
            minScale={1}
            
            // --- THE INSTANT TOGGLE CONFIG ---
            enableDoubleClickZoom={true}
            doubleClickConfigs={{
              zoomFactor: 500, // This forces it to the limit instantly
              doubleClickInterval: 300, 
            }}
            // ---------------------------------

            renderImage={(props) => (
              <Image 
                {...props} 
                style={[props.style, { 
                    interpolationMode: 'none',
                    renderToHardwareTextureAndroid: true,
                }]} 
                resizeMethod="scale"
                fadeDuration={0}
              />
            )}
          />
        ) : (
          <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
            <Text style={styles.placeholderText}>+ SELECT ARTWORK</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>{image ? "RELOAD" : "OPEN GALLERY"}</Text>
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
    backgroundColor: '#050505', 
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#00ffcc' 
  },
  title: { color: '#00ffcc', fontSize: 16, fontWeight: 'bold', letterSpacing: 5 },
  canvas: { flex: 1 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#00ffcc', fontSize: 14, opacity: 0.4 },
  footer: { backgroundColor: '#050505', paddingBottom: 40, alignItems: 'center', paddingTop: 15 },
  button: { 
    backgroundColor: '#00ffcc', 
    paddingVertical: 15, 
    paddingHorizontal: 60, 
    borderRadius: 0 
  },
  buttonText: { color: '#000', fontWeight: 'bold', letterSpacing: 2 },
});
