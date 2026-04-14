import React, { createContext, useState, useContext, useEffect } from 'react';
import { storageService } from '../services/storage';
import { useAuth } from './AuthContext';

const ListingsContext = createContext(null);

export const ListingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [allListings, setAllListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, [user]);

  const loadListings = async () => {
    try {
      const stored = await storageService.getListings();
      const myStored = user ? stored.filter(l => l.userId === user.id) : [];
      
      setAllListings(stored);
      setMyListings(myStored);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addListing = async (listing) => {
    try {
      const newListing = {
        ...listing,
        id: Date.now().toString(),
        userId: user?.id,
        userName: user?.name,
        status: 'active', // active, sold, draft
        createdAt: new Date().toISOString(),
      };

      const updatedAll = [newListing, ...allListings];
      const updatedMy = [newListing, ...myListings];

      setAllListings(updatedAll);
      setMyListings(updatedMy);

      await storageService.saveListings(updatedAll);

      return newListing;
    } catch (error) {
      console.error('Error adding listing:', error);
      throw error;
    }
  };

  const updateListing = async (id, updates) => {
    try {
      const updatedAll = allListings.map((listing) =>
        listing.id === id ? { ...listing, ...updates, updatedAt: new Date().toISOString() } : listing
      );
      const updatedMy = myListings.map((listing) =>
        listing.id === id ? { ...listing, ...updates, updatedAt: new Date().toISOString() } : listing
      );

      setAllListings(updatedAll);
      setMyListings(updatedMy);

      await storageService.saveListings(updatedAll);
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  };

  const deleteListing = async (id) => {
    try {
      const updatedAll = allListings.filter((listing) => listing.id !== id);
      const updatedMy = myListings.filter((listing) => listing.id !== id);

      setAllListings(updatedAll);
      setMyListings(updatedMy);

      await storageService.saveListings(updatedAll);
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  };

  return (
    <ListingsContext.Provider
      value={{
        allListings,
        myListings,
        loading,
        addListing,
        updateListing,
        deleteListing,
        refreshListings: loadListings,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within ListingsProvider');
  }
  return context;
};
