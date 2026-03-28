import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>PIXEL WARP PRO</Text>
        <View style={styles.separator} />
        <Text style={styles.subtitle}>SYSTEM ONLINE</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#00ffcc',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 255, 204, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  separator: {
    height: 2,
    width: 100,
    backgroundColor: '#00ffcc',
    marginVertical: 20,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    letterSpacing: 2,
    opacity: 0.8,
  },
});
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  canvas: { flex: 1 },
});
