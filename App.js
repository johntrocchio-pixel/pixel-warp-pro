import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // This part asks the phone for permission explicitly
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
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
          <ScrollView maximumZoomScale={20} minimumZoomScale={1} centerContent={true}>
            <Image source={{ uri: image }} style={styles.fullImage} resizeMode="contain" />
          </ScrollView>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>TAP BELOW TO LOAD IMAGE</Text>
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
  header: { paddingTop: 40, alignItems: 'center', backgroundColor: '#111', paddingBottom: 15 },
  title: { color: '#00ffcc', fontSize: 20, fontWeight: 'bold' },
  canvas: { flex: 1 },
  fullImage: { width: 400, height: 400 }, // Initial size before zoom
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#444', fontWeight: 'bold' },
  button: { backgroundColor: '#00ffcc', padding: 20, margin: 30, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '900' },
});
