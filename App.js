import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function App() {
  const [warpLevel, setWarpLevel] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PIXEL WARP PRO</Text>
        <Text style={styles.subtitle}>WARP ENGINE: {warpLevel}%</Text>
      </View>

      <View style={styles.canvas}>
        {/* This represents our future pixel workspace */}
        <View style={[styles.pixelBox, { opacity: 0.5 + warpLevel / 200 }]} />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setWarpLevel((prev) => (prev >= 100 ? 0 : prev + 10))}
      >
        <Text style={styles.buttonText}>INITIATE WARP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
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
