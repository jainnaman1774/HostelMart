import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const ItemDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { item } = route.params;

  const handleDelete = async () => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('items').delete().eq('id', item.id);
          if (error) {
            Alert.alert('Error', 'Failed to delete listing.');
          } else {
            Alert.alert('Deleted', 'Listing deleted successfully!');
            navigation.goBack();
          }
        },
      },
    ]);
  };

  const handleBuy = () => {
    Alert.alert('Buy', 'Proceed to buy this item (implement checkout logic here).');
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    Alert.alert('Contact', 'This will open a chat with the seller');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={{ uri: item.image }} style={styles.image} />
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>{item.price}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.sectionText}>{item.location}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <Text style={styles.sectionText}>John Doe</Text>
            <Text style={styles.sectionText}>Computer Science Student</Text>
            <Text style={styles.sectionText}>Member since 2023</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteButtonText}>Save</Text>
        </TouchableOpacity>
        {user && item.seller_id === user.id ? (
          <TouchableOpacity style={styles.contactButton} onPress={handleDelete}>
            <Text style={styles.contactButtonText}>Delete Listing</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.contactButton} onPress={handleBuy}>
            <Text style={styles.contactButtonText}>Buy</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: width,
    height: width,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  favoriteButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  favoriteButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    flex: 2,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ItemDetailScreen; 