import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { checkNetworkConnection } from './network';

export const uploadFile = async (file: ImagePicker.ImagePickerAsset, userId: string, path: string) => {
  try {
    // Check network connection first
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No network connection available');
    }

    // Get file extension from URI
    const fileExt = file.uri.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${path}/${fileName}`;

    // Convert URI to blob with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(file.uri, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    // Upload to Supabase with retry
    let uploadError;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      const { error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, blob, {
          contentType: file.type || 'image/jpeg',
          upsert: true
        });

      if (!error) {
        break;
      }

      uploadError = error;
      retryCount++;
      
      if (retryCount < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Image upload timed out. Please check your network connection.');
      }
      if (error.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
    }
    throw error;
  }
};

export const deleteFile = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('user-uploads')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 