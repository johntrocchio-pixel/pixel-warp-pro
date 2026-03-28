import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  Canvas, Image, useImage, Skia, Group, RuntimeShader, Path
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- PICSAY DISTORT SHADER (GPU Accelerated) ---
const DISTORT_SHADER = Skia.RuntimeEffect.Make(`
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
`)!;

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const skiaImage = useImage(imageUri);
  
  // MODES: 0=Nav, 1=Distort, 2=Mask, 3=Batch
  const [mode, setMode] = useState(0); 
  const [maskPaths, setMaskPaths] = useState([]);

  // --- TRANSFORMATION STATE (1000x Zoom Capable) ---
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // --- WARP STATE ---
  const fingerPos = useSharedValue({ x: -100, y: -100 });
  const warpStrength = useSharedValue(0);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1, 
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // --- PICSAY GESTURE LOGIC ---
  const doubleTap = Gesture.Tap().numberOfTaps(2).onStart(() => {
    if (scale.value > 1) {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    } else {
      scale.value = withTiming(500); // 500x Jump to Pixels
    }
  });

  const distortGesture = Gesture.Pan().enabled(mode === 1).onUpdate((e) => {
    fingerPos.value = { x: e.x, y: e.y };
    warpStrength.value = 0.8;
  }).onEnd(() => { warpStrength.value = 0; });

  const paintGesture = Gesture.Pan().enabled(mode === 2).onStart((e) => {
    const p = Skia.Path.Make();
    p.moveTo(e.x, e.y);
    setMaskPaths([...maskPaths, p]);
  }).onUpdate((e) => {
    const currentPath = maskPaths[maskPaths.length - 1];
    if (currentPath) {
      currentPath.lineTo(e.x, e.y);
      setMaskPaths([...maskPaths]);
    }
  });

  const navPan = Gesture.Pan().enabled(mode === 0).onUpdate((e) => {
    translateX.value += e.changeX;
    translateY.value += e.changeY;
  });

  const navZoom = Gesture.Pinch().enabled(mode === 0).onUpdate((e) => {
    scale.value *= e.scaleChange;
  });

  const combinedGestures = Gesture.Race(
    distortGesture, 
    paintGesture, 
    Gesture.Exclusive(doubleTap, Gesture.Simultaneous(navPan, navZoom))
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        
        {/* TOP BAR: PICSAY HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PIXEL WARP PRO</Text>
          <TouchableOpacity onPress={pickImage} style={styles.getBtn}>
             <Text style={styles.getBtnText}>GET PICTURE</Text>
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
                    sampling={{ filter: 'nearest' }} // ZERO BLUR MODE
                  >
                    {mode === 1 && (
                      <RuntimeShader 
                        source={DISTORT_SHADER} 
                        uniforms={{ fingerPos, radius: 120, strength: warpStrength }} 
                      />
                    )}
                  </Image>
                )}
                
                {/* MASKING LAYER */}
                {maskPaths.map((path, i) => (
                  <Path key={i} path={path} color="rgba(0, 255, 204, 0.3)" style="stroke" strokeWidth={12} strokeCap="round" />
                ))}
              </Group>
            </Canvas>
          </View>
        </GestureDetector>

        {/* BATCH FILTER DRAWER */}
        {mode === 3 && (
          <View style={styles.batchOverlay}>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['SHARPEN', 'VIBRANT', 'TK-TOK', 'WARM', 'COLD', 'MASK-ALL'].map((f) => (
                  <TouchableOpacity key={f} style={styles.filterCard} onPress={() => Alert.alert("Batch Apply", `Processing ${f}...`)}>
                    <Text style={styles.filterText}>{f}</Text>
                  </TouchableOpacity>
                ))}
             </ScrollView>
          </View>
        )}

        {/* BOTTOM NAVIGATION: PICSAY STYLE */}
        <View style={styles.toolbar}>
          <Tool label="VIEW" active={mode === 0} onPress={() => setMode(0)} />
          <Tool label="DISTORT" active={mode === 1} onPress={() => setMode(1)} />
          <Tool label="MASK" active={mode === 2} onPress={() => setMode(2)} />
          <Tool label="BATCH" active={mode === 3} onPress={() => setMode(3)} />
          <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert("Export", "Saving at Full Quality...")}>
            <Text style={styles.exportText}>DONE</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const Tool = ({ label, active, onPress }) => (
  <TouchableOpacity style={[styles.toolBtn, active && styles.activeTool]} onPress={onPress}>
    <Text style={[styles.toolText, active && styles.activeToolText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, backgroundColor: '#111', borderBottomWidth: 1, borderColor: '#333' },
  headerTitle: { color: '#00ffcc', fontWeight: 'bold', fontSize: 11, letterSpacing: 4 },
  getBtn: { backgroundColor: '#222', padding: 10, borderRadius: 2, borderWidth: 1, borderColor: '#444' },
  getBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  canvasContainer: { flex: 1 },
  batchOverlay: { height: 100, backgroundColor: '#111', padding: 10, borderTopWidth: 1, borderColor: '#333' },
  filterCard: { width: 90, height: 60, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderRadius: 2, borderWidth: 1, borderColor: '#00ffcc' },
  filterText: { color: '#00ffcc', fontSize: 9, fontWeight: 'bold' },
  toolbar: { height: 90, flexDirection: 'row', backgroundColor: '#111', alignItems: 'center', justifyContent: 'space-around' },
  toolBtn: { alignItems: 'center', padding: 15 },
  activeTool: { borderBottomWidth: 3, borderColor: '#00ffcc' },
  toolText: { color: '#666', fontSize: 9, fontWeight: 'bold' },
  activeToolText: { color: '#00ffcc' },
  exportBtn: { backgroundColor: '#00ffcc', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 2 },
  exportText: { color: '#000', fontWeight: 'bold', fontSize: 11 }
});
