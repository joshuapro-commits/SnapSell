import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { aiService } from '../services/ai';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const CameraScreen = ({ navigation }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      analyzeImage(photo.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeImage = async (imageUri) => {
    navigation.navigate('AnalyzingScreen', { imageUri });
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={60} color={COLORS.textLight} />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (analyzing) {
    return null;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} />
      <View style={styles.cameraOverlay}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.instructionText}>Scan your item</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Scan Frame */}
        <View style={styles.scanFrameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanHint}>Position item within frame</Text>
        </View>
        
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.galleryButton}>
            <Ionicons name="images-outline" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.flashButton}>
            <Ionicons name="flash-outline" size={28} color="#fff" />
          </TouchableOpacity>
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
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 44,
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scanFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFB800',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanHint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: SPACING.xl,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl * 2,
    paddingBottom: 50,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  permissionText: {
    ...TYPOGRAPHY.sectionTitle,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  permissionButtonText: {
    ...TYPOGRAPHY.button,
    color: '#fff',
  },
  analyzingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  analyzingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  analyzingLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  analyzingLogoSell: {
    color: '#F59E0B',
  },
  analyzingContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imagePreviewContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    marginBottom: 32,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  detectingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  detectingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  authenticatingBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  authenticatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  analyzingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  analyzingSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  magicText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '75%',
    marginBottom: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  progressStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistText: {
    fontSize: 14,
    color: '#64748B',
  },
});
