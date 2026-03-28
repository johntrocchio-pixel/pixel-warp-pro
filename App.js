import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Dimensions, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PIXEL MICROSCOPE RAW</Text>
      </View>

      <View style={styles.canvas}>
        {image ? (
          <ScrollView 
            maximumZoomScale={500} // Extreme 500x limit
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent={true}
            // This is the "Speed" setting for Android
            decelerationRate="fast"
          >
            <Image 
              source={{ uri: image }} 
              style={styles.fullImage} 
              resizeMode="contain"
              // Keeps pixels sharp
              renderToHardwareTextureAndroid={true}
            />
          </ScrollView>
        ) : (
          <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
            <Text style={styles.placeholderText}>+ TAP TO LOAD IMAGE</Text>
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
  header: { paddingTop: 50, alignItems: 'center', backgroundColor: '#111', paddingBottom: 20 },
  title: { color: '#00ffcc', fontSize: 18, fontWeight: 'bold', letterSpacing: 4 },
  canvas: { flex: 1 },
  fullImage: { 
    width: SCREEN_WIDTH, 
    height: SCREEN_HEIGHT,
  },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#00ffcc', fontSize: 16, opacity: 0.6 },
  footer: { backgroundColor: '#111', paddingBottom: 40, alignItems: 'center', paddingTop: 10 },
  button: { backgroundColor: '#00ffcc', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 5 },
  buttonText: { color: '#000', fontWeight: 'bold' },
});
