import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { checkNetworkConnection } from '../utils/network';
import Constants from 'expo-constants';

// Use environment variables with fallback to app.config.js values
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://itkojptodexfkbkmjexz.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a29qcHRvZGV4Zmtia21qZXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA5MzU1NzcsImV4cCI6MjAyNjUxMTU3N30.Hs-Ey_pMJqQFnYs8YJqLDsHXkgxF3GpqQDhHdjE_Ync";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase configuration');
}

// Get the current origin for CORS
const getCurrentOrigin = () => {
  if (Constants.appOwnership === 'expo') {
    return 'exp://*';
  }
  if (Constants.appOwnership === 'standalone') {
    return Constants.expoConfig?.hostUri || '*';
  }
  return '*';
};

// Create Supabase client with custom configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'hostel-mart-app',
      'Origin': getCurrentOrigin(),
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// CORS check function
export const checkCORS = async () => {
  try {
    const response = await fetch(supabaseUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': getCurrentOrigin(),
        'Access-Control-Request-Method': 'GET',
      },
    });

    const corsHeaders = response.headers.get('access-control-allow-origin');
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': corsHeaders,
      'Current Origin': getCurrentOrigin(),
    });

    return corsHeaders === '*' || corsHeaders?.includes(getCurrentOrigin());
  } catch (error) {
    console.error('CORS check failed:', error);
    return false;
  }
};

// Enhanced connection test function
export const testConnection = async () => {
  try {
    // Check network connection first
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      console.error('No network connection available');
      return false;
    }

    // Test Supabase connection by querying the 'items' table
    const { error } = await supabase.from('items').select('*').limit(1);
    if (error) {
      console.error('Error querying items table:', error);
      return false;
    }
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
};

// Initialize connection test
testConnection().then(success => {
  if (!success) {
    console.warn('Initial Supabase connection test failed. Please check the error messages above for details.');
  }
}); 