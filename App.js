import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Canvas, Image, useImage, Skia, Group } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const skiaImage = useImage(imageUri);
  
  // --- PICSAY MODES ---
  // 0 = View/Zoom, 1 = Distort (Liquify), 2 = Adjust (Filters), 3 = Paint (Masks/Layers)
  const [mode, setMode] = useState(0); 

  // --- TRANSFORMATION (Microscope Zoom) ---
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // --- NAVIGATION GESTURES (Double Tap 500x) ---
  const doubleTap = Gesture.Tap().numberOfTaps(2).onStart(() => {
    if (scale.value > 1) {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    } else {
      scale.value = withTiming(500);
    }
  });

  const panGesture = Gesture.Pan().onUpdate((e) => {
    if (mode === 0) { // Only pan if in View Mode
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    }
  });

  const zoomGesture = Gesture.Pinch().onUpdate((e) => {
    if (mode === 0) {
      scale.value *= e.scaleChange;
    }
  });

  const viewGestures = Gesture.Race(doubleTap, Gesture.Simultaneous(panGesture, zoomGesture));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        
        {/* PICSAY TOP BAR */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{imageUri ? "EDITING" : "PICSAY CLONE"}</Text>
          <TouchableOpacity onPress={pickImage} style={styles.getBtn}>
             <Text style={styles.getBtnText}>GET PICTURE</Text>
          </TouchableOpacity>
        </View>

        <GestureDetector gesture={viewGestures}>
          <View style={styles.canvasContainer}>
            <Canvas style={{ flex: 1 }}>
              <Group transform={[{ translateX }, { translateY }, { scale }]}>
                {skiaImage && (
                  <Image
                    image={skiaImage}
                    x={0} y={0}
                    width={SCREEN_WIDTH} height={SCREEN_HEIGHT}
                    fit="contain"
                    sampling={{ filter: 'nearest' }} // Sharp pixels always
                  />
                )}
              </Group>
            </Canvas>
          </View>
        </GestureDetector>

        {/* PICSAY BOTTOM TOOLBAR */}
        <View style={styles.toolbar}>
          <ToolButton label="ADJUST" active={mode === 2} onPress={() => setMode(2)} />
          <ToolButton label="EFFECT" active={mode === 1} onPress={() => setMode(1)} />
          <ToolButton label="LAYERS" active={mode === 3} onPress={() => setMode(3)} />
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>EXPORT</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const ToolButton = ({ label, active, onPress }) => (
  <TouchableOpacity style={[styles.toolBtn, active && styles.activeTool]} onPress={onPress}>
    <Text style={[styles.toolText, active && styles.activeToolText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: { 
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    backgroundColor: '#222',
    borderBottomWidth: 1,
    borderColor: '#333'
  },
  headerTitle: { color: '#ccc', fontWeight: 'bold', fontSize: 14 },
  getBtn: { backgroundColor: '#444', padding: 8, borderRadius: 4 },
  getBtnText: { color: '#fff', fontSize: 12 },
  canvasContainer: { flex: 1 },
  toolbar: { 
    height: 80, 
    flexDirection: 'row', 
    backgroundColor: '#222', 
    alignItems: 'center', 
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#333'
  },
  toolBtn: { padding: 10, alignItems: 'center' },
  activeTool: { borderBottomWidth: 2, borderColor: '#00ffcc' },
  toolText: { color: '#888', fontSize: 11, fontWeight: 'bold' },
  activeToolText: { color: '#00ffcc' },
  exportBtn: { backgroundColor: '#00ffcc', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 4 },
  exportText: { color: '#000', fontWeight: 'bold', fontSize: 12 }
});
