import React, { createContext, useState, useContext, useEffect } from 'react';
import { storageService } from '../services/storage';
import { useAuth } from './AuthContext';

const ListingsContext = createContext(null);

const MOCK_LISTINGS = [
  {
    id: '1',
    name: 'iPhone 13 Pro',
    brand: 'Apple',
    price: 699,
    category: 'electronics',
    condition: 'like-new',
    description: 'Premium smartphone in excellent condition',
    imageUri: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=iPhone+13+Pro',
    userId: '2',
    userName: 'John Doe',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Nike Air Jordan 1',
    brand: 'Nike',
    price: 170,
    category: 'clothing',
    condition: 'new',
    description: 'Brand new sneakers, never worn',
    imageUri: 'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Air+Jordan+1',
    userId: '2',
    userName: 'John Doe',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const ListingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [allListings, setAllListings] = useState(MOCK_LISTINGS);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, [user]);

  const loadListings = async () => {
    try {
      const stored = await storageService.getListings();
      const myStored = await storageService.getMyListings();
      
      if (stored.length > 0) {
        setAllListings([...MOCK_LISTINGS, ...stored]);
      }
      
      if (myStored.length > 0) {
        setMyListings(myStored);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addListing = async (listing) => {
    const newListing = {
      ...listing,
      id: Date.now().toString(),
      userId: user?.id,
      userName: user?.name,
      createdAt: new Date().toISOString(),
    };

    const updatedAll = [newListing, ...allListings];
    const updatedMy = [newListing, ...myListings];

    setAllListings(updatedAll);
    setMyListings(updatedMy);

    await storageService.saveListings(updatedAll.filter(l => l.userId === user?.id));
    await storageService.saveMyListings(updatedMy);

    return newListing;
  };

  const updateListing = async (id, updates) => {
    const updatedAll = allListings.map((listing) =>
      listing.id === id ? { ...listing, ...updates } : listing
    );
    const updatedMy = myListings.map((listing) =>
      listing.id === id ? { ...listing, ...updates } : listing
    );

    setAllListings(updatedAll);
    setMyListings(updatedMy);

    await storageService.saveListings(updatedAll.filter(l => l.userId === user?.id));
    await storageService.saveMyListings(updatedMy);
  };

  const deleteListing = async (id) => {
    const updatedAll = allListings.filter((listing) => listing.id !== id);
    const updatedMy = myListings.filter((listing) => listing.id !== id);

    setAllListings(updatedAll);
    setMyListings(updatedMy);

    await storageService.saveListings(updatedAll.filter(l => l.userId === user?.id));
    await storageService.saveMyListings(updatedMy);
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
