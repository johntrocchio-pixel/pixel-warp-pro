import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PIXEL WARP PRO</Text>
      </View>

      <View style={styles.canvas}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>NO IMAGE LOADED</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>UPLOAD IMAGE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    color: '#00ffcc',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ffcc',
  },
  placeholder: {
    width: 300,
    height: 300,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#444',
  },
  placeholderText: {
    color: '#444',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00ffcc',
    padding: 20,
    margin: 40,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
    marginBottom: 40,
  },
  title: {
    color: '#00ffcc',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    opacity: 0.6,
  },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pixelBox: {
    width: 200,
    height: 200,
    backgroundColor: '#00ffcc',
    borderWidth: 2,
    borderColor: '#fff',
  },
  button: {
    backgroundColor: '#00ffcc',
    padding: 20,
    margin: 40,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
