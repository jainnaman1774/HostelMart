import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../utils/storage';
import { supabase } from '../lib/supabase';

interface ProfilePictureUploadProps {
  userId: string;
  currentPictureUrl?: string;
  onUploadComplete: (url: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userId,
  currentPictureUrl,
  onUploadComplete,
}) => {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.split('/').pop();
      const file = new File([blob], filename || 'profile.jpg', { type: 'image/jpeg' });

      const url = await uploadFile(file, userId, 'profile-pictures');
      
      // Update profile with new picture URL
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: url })
        .eq('id', userId);

      if (error) throw error;

      onUploadComplete(url);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} disabled={uploading}>
        <View style={styles.imageContainer}>
          {currentPictureUrl ? (
            <Image source={{ uri: currentPictureUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              {uploading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <View style={styles.plusSign}>
                  <View style={styles.plusHorizontal} />
                  <View style={styles.plusVertical} />
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSign: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 30,
    height: 2,
    backgroundColor: '#007AFF',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }],
  },
  plusVertical: {
    position: 'absolute',
    width: 2,
    height: 30,
    backgroundColor: '#007AFF',
    left: '50%',
    top: '50%',
    transform: [{ translateY: -15 }],
  },
});

export default ProfilePictureUpload; 