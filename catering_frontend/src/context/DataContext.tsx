"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { recipes as mockRecipes, procurementOrders as mockPOs, quotes as mockQuotes, Recipe, ProcurementOrder, QuoteRecord } from '@/data/mock-dashboard';

interface DataContextType {
  isMock: boolean;
  toggleMock: () => void;
  getRecipes: () => Promise<Recipe[]>;
  getPOs: () => Promise<ProcurementOrder[]>;
  getQuotes: () => Promise<QuoteRecord[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isMock, setIsMock] = useState(true);

  const toggleMock = () => setIsMock(!isMock);

  const getRecipes = async () => {
    if (isMock) return mockRecipes;
    const res = await fetch('http://localhost:3000/recipe');
    return res.json();
  };

  const getPOs = async () => {
    if (isMock) return mockPOs;
    // Implement API call
    return mockPOs; // Placeholder
  };

  const getQuotes = async () => {
    if (isMock) return mockQuotes;
    // Implement API call
    return mockQuotes; // Placeholder
  };

  return (
    <DataContext.Provider value={{ isMock, toggleMock, getRecipes, getPOs, getQuotes }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within DataProvider');
  return context;
}
