import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PIXEL WARP PRO</Text>
        <Text style={styles.status}>SYSTEM ONLINE</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  status: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.6,
  },
});
