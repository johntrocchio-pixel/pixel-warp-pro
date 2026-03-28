import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  Canvas, Image, useImage, Skia, Group, RuntimeShader, Path, Fill
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useDerivedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- GPU LIQUIFY SHADER ---
const LIQUIFY_SHADER = Skia.RuntimeEffect.Make(`
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
  
  // MODES: 0=Navigate, 1=Distort (Liquify), 2=Mask/Paint, 3=Batch/Filter
  const [mode, setMode] = useState(0); 
  const [maskPaths, setMaskPaths] = useState([]);

  // --- TRANSFORMATION STATE ---
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

  // --- GESTURES: TOGGLE & ZOOM ---
  const doubleTap = Gesture.Tap().numberOfTaps(2).onStart(() => {
    if (scale.value > 1) {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    } else {
      scale.value = withTiming(500); // 500x Jump
    }
  });

  // --- GESTURES: LIQUIFY/DISTORT ---
  const distortGesture = Gesture.Pan().enabled(mode === 1).onUpdate((e) => {
    fingerPos.value = { x: e.x, y: e.y };
    warpStrength.value = 0.8;
  }).onEnd(() => { warpStrength.value = 0; });

  // --- GESTURES: MASK PAINTING ---
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
                    sampling={{ filter: 'nearest' }}
                  >
                    {mode === 1 && (
                      <RuntimeShader 
                        source={LIQUIFY_SHADER} 
                        uniforms={{ fingerPos, radius: 120, strength: warpStrength }} 
                      />
                    )}
                  </Image>
                )}
                
                {/* MASK LAYER (PICSAY SELECTION STYLE) */}
                {maskPaths.map((path, i) => (
                  <Path key={i} path={path} color="rgba(0, 255, 204, 0.4)" style="stroke" strokeWidth={10} />
                ))}
              </Group>
            </Canvas>
          </View>
        </GestureDetector>

        {/* BATCH / FILTER PRESETS OVERLAY */}
        {mode === 3 && (
          <View style={styles.batchOverlay}>
             <Text style={styles.overlayTitle}>BATCH PRESETS</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['VIBRANT', 'SHARPEN', 'TK-TOK', 'WARM', 'COLD'].map((f) => (
                  <TouchableOpacity key={f} style={styles.filterCard} onPress={() => Alert.alert("Batch", `Applying ${f} to folder...`)}>
                    <Text style={styles.filterText}>{f}</Text>
                  </TouchableOpacity>
                ))}
             </ScrollView>
          </View>
        )}

        {/* PICSAY NAVIGATION BAR */}
        <View style={styles.toolbar}>
          <Tool label="NAV" active={mode === 0} onPress={() => setMode(0)} />
          <Tool label="DISTORT" active={mode === 1} onPress={() => setMode(1)} />
          <Tool label="MASK" active={mode === 2} onPress={() => setMode(2)} />
          <Tool label="BATCH" active={mode === 3} onPress={() => setMode(3)} />
          <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert("Export", "Saving full res...")}>
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
  headerTitle: { color: '#00ffcc', fontWeight: 'bold', fontSize: 12, letterSpacing: 3 },
  getBtn: { backgroundColor: '#222', padding: 10, borderRadius: 4 },
  getBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  canvasContainer: { flex: 1 },
  batchOverlay: { height: 120, backgroundColor: '#111', padding: 15 },
  overlayTitle: { color: '#888', fontSize: 10, marginBottom: 10, fontWeight: 'bold' },
  filterCard: { width: 80, height: 60, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderRadius: 4, borderWidth: 1, borderColor: '#444' },
  filterText: { color: '#00ffcc', fontSize: 10, fontWeight: 'bold' },
  toolbar: { height: 90, flexDirection: 'row', backgroundColor: '#111', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#333' },
  toolBtn: { alignItems: 'center', padding: 10 },
  activeTool: { borderBottomWidth: 2, borderColor: '#00ffcc' },
  toolText: { color: '#555', fontSize: 9, fontWeight: 'bold' },
  activeToolText: { color: '#00ffcc' },
  exportBtn: { backgroundColor: '#00ffcc', padding: 12, borderRadius: 4 },
  exportText: { color: '#000', fontWeight: 'bold', fontSize: 10 }
});
