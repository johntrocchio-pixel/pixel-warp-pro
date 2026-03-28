import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const screen = Dimensions.get('window');

export default function App() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need access to your photos!");
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
        <Text style={styles.title}>PIXEL MICROSCOPE</Text>
      </View>

      <View style={styles.canvas}>
        {image ? (
          <ScrollView
            maximumZoomScale={100} // This allows for extreme 100x zoom
            minimumZoomScale={1}
            horizontal={true}
            centerContent={true}
            contentContainerStyle={styles.scrollContent}
          >
            <ScrollView
              maximumZoomScale={100}
              minimumZoomScale={1}
              centerContent={true}
            >
              <Image 
                source={{ uri: image }} 
                style={styles.fullImage} 
                resizeMode="contain" 
              />
            </ScrollView>
          </ScrollView>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>TAP OPEN GALLERY TO BEGIN</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>OPEN GALLERY</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: 50, alignItems: 'center', backgroundColor: '#111', paddingBottom: 20 },
  title: { color: '#00ffcc', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  canvas: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: { 
    width: screen.width, 
    height: screen.width, // Keeps the aspect ratio square for the "slide"
  },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#666', fontSize: 16 },
  button: { backgroundColor: '#00ffcc', padding: 20, marginHorizontal: 40, marginBottom: 40, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
