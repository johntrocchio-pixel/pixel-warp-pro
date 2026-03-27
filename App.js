import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Canvas, Path, Skia, TouchHandler, useTouchHandler } from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [paths, setPaths] = React.useState([]);

  // The "Lasso" and "Paint" logic
  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      const newPath = Skia.Path.Make();
      newPath.moveTo(x, y);
      setPaths((prev) => [...prev, newPath]);
    },
    onActive: ({ x, y }) => {
      const currentPath = paths[paths.length - 1];
      if (currentPath) {
        currentPath.lineTo(x, y);
        setPaths([...paths]);
      }
    },
  });

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        {paths.map((p, i) => (
          <Path 
            key={i} 
            path={p} 
            color="#00ffcc" 
            style="stroke" 
            strokeWidth={5} 
          />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  canvas: { flex: 1 },
});
