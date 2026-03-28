import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';

const screen = Dimensions.get('window');

export default function App() {
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);

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
      setZoom(1); // Reset zoom for new image
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PIXEL MICROSCOPE</Text>
        {image && <Text style={styles.zoomText}>MAGNIFICATION: {zoom.toFixed(1)}x</Text>}
      </View>

      <View style={styles.canvas}>
        {image ? (
          <ScrollView horizontal={true} contentContainerStyle={styles.centerer}>
            <ScrollView contentContainerStyle={styles.centerer}>
              <Image 
                source={{ uri: image }} 
                style={{
                  width: screen.width * zoom,
                  height: screen.width * zoom,
                }} 
                resizeMode="contain" 
              />
            </ScrollView>
          </ScrollView>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>OPEN GALLERY TO START</Text>
          </View>
        )}
      </View>

      {image && (
        <View style={styles.controls}>
          <Slider
            style={{width: '100%', height: 40}}
            minimumValue={1}
            maximumValue={50}
            minimumTrackTintColor="#00ffcc"
            maximumTrackTintColor="#444"
            thumbTintColor="#00ffcc"
            value={zoom}
            onValueChange={(val) => setZoom(val)}
          />
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>{image ? "CHANGE IMAGE" : "OPEN GALLERY"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: 50, alignItems: 'center', backgroundColor: '#111', paddingBottom: 15 },
  title: { color: '#00ffcc', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  zoomText: { color: '#fff', fontSize: 12, marginTop: 5, opacity: 0.7 },
  canvas: { flex: 1, backgroundColor: '#050505' },
  centerer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#333', fontWeight: 'bold' },
  controls: { paddingHorizontal: 30, paddingVertical: 10, backgroundColor: '#111' },
  button: { backgroundColor: '#00ffcc', padding: 20, margin: 30, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
