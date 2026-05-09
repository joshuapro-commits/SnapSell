import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export const CameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isPickerReady, setIsPickerReady] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
    
    // Initialize picker on mount for Android
    const initPicker = async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      setTimeout(() => setIsPickerReady(true), 500);
    };
    initPicker();
  }, [permission]);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      navigation.navigate('AnalyzingScreen', { 
        imageUri: photo.uri,
        photoSource: 'camera', // Track photo source for verification
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleOpenGallery = async () => {
    if (!isPickerReady) {
      Alert.alert('Please Wait', 'Gallery is initializing...');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled) {
        navigation.navigate('AnalyzingScreen', { 
          imageUri: result.assets[0].uri,
          photoSource: 'gallery',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={60} color="#999" />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back" />
      
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton}>
            <Ionicons name="help-circle-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            <View style={[styles.frameCorner, styles.topLeft]} />
            <View style={[styles.frameCorner, styles.topRight]} />
            <View style={[styles.frameCorner, styles.bottomLeft]} />
            <View style={[styles.frameCorner, styles.bottomRight]} />
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="scan" size={24} color="#000" />
              </View>
              <Text style={styles.actionLabel}>Scan Item</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.captureRow}>
            <TouchableOpacity style={styles.galleryButton} onPress={handleOpenGallery}>
              <Ionicons name="images" size={24} color="#FFF" />
              <Text style={styles.galleryText}>From Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 320,
    height: 320,
  },
  frameCorner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderColor: '#FFF',
    borderWidth: 5,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  bottomContainer: {
    paddingBottom: 50,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  galleryButton: {
    alignItems: 'center',
    width: 80,
  },
  galleryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFF',
    marginTop: 6,
    fontFamily: 'Montserrat_500Medium',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFF',
  },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFF',
  },
  placeholder: {
    width: 80,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 30,
    fontFamily: 'Montserrat_600SemiBold',
  },
  permissionButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
