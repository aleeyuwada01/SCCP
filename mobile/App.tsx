import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={{
          latitude: 12.989, // Katsina State
          longitude: 7.604,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {location && (
          <Marker 
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }}
            title="Current Location"
          />
        )}
      </MapView>
      <View style={styles.actionPanel}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>New Capture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonTextSecondary}>Sync Queue (0)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '80%',
  },
  actionPanel: {
    height: '20%',
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    gap: 10
  },
  button: {
    backgroundColor: '#059669', // Emerald 600
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6', // Neutral 100
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonTextSecondary: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 16
  }
});
