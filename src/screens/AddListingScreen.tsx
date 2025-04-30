import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../utils/storage';
import { checkNetworkConnection } from '../utils/network';

export default function AddListingScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to create a listing');
      return;
    }

    if (!title.trim() || !description.trim() || !price.trim() || !location.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!image) {
      Alert.alert('Error', 'Please select an image for your listing');
      return;
    }

    // Check network connection
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      Alert.alert('Error', 'No internet connection. Please check your network and try again.');
      return;
    }

    try {
      setUploading(true);

      let imageUrl = null;
      if (image) {
        Alert.alert('Uploading', 'Please wait while we upload your image...');
        imageUrl = await uploadFile(image, user.id, 'listings');
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
      }

      const { error } = await supabase
        .from('items')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            price: parseFloat(price),
            location: location.trim(),
            image_url: imageUrl,
            seller_id: user.id,
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Listing created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setImage(null);
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Listing</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      
      <View style={styles.imageContainer}>
        <TouchableOpacity 
          style={[styles.imageButton, image && styles.imageButtonSelected]} 
          onPress={pickImage}
        >
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: image.uri }} 
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <Text style={styles.imageButtonText}>Change Image</Text>
            </View>
          ) : (
            <Text style={styles.imageButtonText}>Select Image</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, uploading && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Listing</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  imageButtonSelected: {
    padding: 0,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  imageButtonText: {
    color: '#333',
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 3,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 