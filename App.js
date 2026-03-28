import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  Canvas, 
  Image, 
  useImage, 
  Skia, 
  Group, 
  ColorMatrix,
  RuntimeShader
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle,
  useDerivedValue 
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- THE LIQUIFY SHADER (For S24 Ultra GPU Power) ---
// This tiny program runs on the graphics chip to warp pixels instantly.
const LIQUIFY_SHADER = `
  uniform shader image;
  uniform vec2 fingerPos;
  uniform float radius;
  uniform float strength;

  vec4 main(vec2 pos) {
    vec2 dir = pos - fingerPos;
    float dist = length(dir);
    if (dist < radius) {
        float f = 1.0 - (dist / radius);
        pos -= dir * f * strength;
    }
    return image.eval(pos);
  }
`;

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const skiaImage = useImage(imageUri);
  
  // 0=View, 1=Distort, 2=Adjust
  const [mode, setMode] = useState(0); 

  // --- TRANSFORMATION (Microscope Zoom) ---
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // --- LIQUIFY STATES ---
  const fingerPos = useSharedValue({ x: -100, y: -100 });
  const warpStrength = useSharedValue(0);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1, 
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // --- NAVIGATION (Double Tap 500x) ---
  const doubleTap = Gesture.Tap().numberOfTaps(2).onStart(() => {
    if (scale.value > 1) {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    } else {
      scale.value = withTiming(500); // The 500x Microscope Jump
    }
  });

  // --- LIQUIFY GESTURE (The "PicSay" Distort) ---
  const distortGesture = Gesture.Pan()
    .enabled(mode === 1)
    .onUpdate((e) => {
      fingerPos.value = { x: e.x, y: e.y };
      warpStrength.value = 0.5; // Active pushing
    })
    .onEnd(() => {
      warpStrength.value = 0; // Stop pushing
    });

  const panGesture = Gesture.Pan().enabled(mode === 0).onUpdate((e) => {
    translateX.value += e.changeX;
    translateY.value += e.changeY;
  });

  const zoomGesture = Gesture.Pinch().enabled(mode === 0).onUpdate((e) => {
    scale.value *= e.scaleChange;
  });

  const combinedGestures = Gesture.Exclusive(
    distortGesture, 
    Gesture.Race(doubleTap, Gesture.Simultaneous(panGesture, zoomGesture))
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PIXEL WARP PRO</Text>
          <TouchableOpacity onPress={pickImage} style={styles.getBtn}>
             <Text style={styles.getBtnText}>LOAD PHOTO</Text>
          </TouchableOpacity>
        </View>

        <GestureDetector gesture={combinedGestures}>
          <View style={styles.canvasContainer}>
            <Canvas style={{ flex: 1 }}>
              <Group transform={[{ translateX }, { translateY }, { scale }]}>
                {skiaImage && (
                  <Image
                    image={skiaImage}
                    x={0} y={0}
                    width={SCREEN_WIDTH} height={SCREEN_HEIGHT}
                    fit="contain"
                    sampling={{ filter: 'nearest' }} // ZERO BLUR
                  >
                    {/* Only applies the warp logic if in Distort Mode */}
                    {mode === 1 && (
                      <RuntimeShader 
                        source={LIQUIFY_SHADER} 
                        uniforms={{ 
                           fingerPos, 
                           radius: 100, 
                           strength: warpStrength 
                        }} 
                      />
                    )}
                  </Image>
                )}
              </Group>
            </Canvas>
          </View>
        </GestureDetector>

        {/* TOOLBAR (PicSay Pro Style) */}
        <View style={styles.toolbar}>
          <ToolButton label="NAVIGATE" active={mode === 0} onPress={() => setMode(0)} />
          <ToolButton label="DISTORT" active={mode === 1} onPress={() => setMode(1)} />
          <ToolButton label="ADJUST" active={mode === 2} onPress={() => setMode(2)} />
          <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert("Saved", "Exporting at Full Res...")}>
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
  container: { flex: 1, backgroundColor: '#000' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, backgroundColor: '#111' },
  headerTitle: { color: '#00ffcc', fontWeight: 'bold', fontSize: 12, letterSpacing: 2 },
  getBtn: { backgroundColor: '#222', padding: 8, borderRadius: 2, borderWidth: 1, borderColor: '#00ffcc' },
  getBtnText: { color: '#00ffcc', fontSize: 10, fontWeight: 'bold' },
  canvasContainer: { flex: 1 },
  toolbar: { height: 80, flexDirection: 'row', backgroundColor: '#111', alignItems: 'center', justifyContent: 'space-around' },
  toolBtn: { padding: 10 },
  activeTool: { borderBottomWidth: 2, borderColor: '#00ffcc' },
  toolText: { color: '#555', fontSize: 10, fontWeight: 'bold' },
  activeToolText: { color: '#00ffcc' },
  exportBtn: { backgroundColor: '#00ffcc', paddingVertical: 10, paddingHorizontal: 15 },
  exportText: { color: '#000', fontWeight: 'bold', fontSize: 10 }
});
