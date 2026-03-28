import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need access to your photos to zoom into them!");
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
            maximumZoomScale={50} 
            minimumZoomScale={1} 
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image source={{ uri: image }} style={styles.fullImage} resizeMode="contain" />
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
  canvas: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: 400, height: 400 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#666', fontSize: 16 },
  button: { backgroundColor: '#00ffcc', padding: 20, marginHorizontal: 40, marginBottom: 40, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
