import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';

const screen = Dimensions.get('window');

export default function App() {
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setZoom(1); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PIXEL MICROSCOPE PRO</Text>
        {image && <Text style={styles.zoomText}>{zoom.toFixed(0)}x MAGNIFICATION</Text>}
      </View>

      <View style={styles.canvas}>
        {image ? (
          <ScrollView horizontal={true} contentContainerStyle={styles.centerer}>
            <ScrollView contentContainerStyle={styles.centerer}>
              <Image 
                source={{ uri: image }} 
                style={{
                  width: screen.width * zoom,
                  height: undefined,
                  aspectRatio: 1, // Change this to match your typical photo ratio if needed
                }} 
                resizeMode="contain"
                renderToHardwareTextureAndroid={true} 
              />
            </ScrollView>
          </ScrollView>
        ) : (
          <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
            <Text style={styles.placeholderText}>+ LOAD IMAGE</Text>
          </TouchableOpacity>
        )}
      </View>

      {image && (
        <View style={styles.controls}>
          <Slider
            style={{width: '100%', height: 60}}
            minimumValue={1}
            maximumValue={100} // Boosted to 100x
            minimumTrackTintColor="#00ffcc"
            maximumTrackTintColor="#222"
            thumbTintColor="#00ffcc"
            value={zoom}
            onValueChange={(val) => setZoom(val)}
          />
          <TouchableOpacity style={styles.miniButton} onPress={() => setImage(null)}>
            <Text style={styles.miniButtonText}>CLEAR</Text>
          </TouchableOpacity>
        </View>
      )}

      {!image && (
        <TouchableOpacity style={styles.mainButton} onPress={pickImage}>
          <Text style={styles.buttonText}>OPEN GALLERY</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: 50, alignItems: 'center', backgroundColor: '#111', paddingBottom: 15 },
  title: { color: '#00ffcc', fontSize: 18, fontWeight: 'bold', letterSpacing: 3 },
  zoomText: { color: '#00ffcc', fontSize: 12, marginTop: 5, fontWeight: 'bold' },
  canvas: { flex: 1 },
  centerer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#00ffcc', fontSize: 16, opacity: 0.5 },
  controls: { padding: 20, backgroundColor: '#111', borderTopWidth: 1, borderColor: '#222', alignItems: 'center' },
  miniButton: { marginTop: 5 },
  miniButtonText: { color: '#ff4444', fontSize: 12, fontWeight: 'bold' },
  mainButton: { backgroundColor: '#00ffcc', padding: 20, margin: 40, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold' },
});
