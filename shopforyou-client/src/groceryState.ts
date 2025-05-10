import { create } from 'zustand';
import groceryData from './domain/grocery/grocerys';

interface GroceryQuery {
  categoryId?: number;
  sortOrder: string;
  searchText: string;
  price?: number;
  groceryName?: string;
  groceryImage?: string;
  description?: string;
  amount?: number;
}

interface GroceryQueryStore {
  groceryQuery: GroceryQuery;
  setCategoryId: (categoryId?: number) => void;
  setSortOrder: (sortOrder: string) => void;
  setSearchText: (searchText: string) => void;
  setPrice: (price?: number) => void;
  setGroceryName: (groceryName?: string) => void;
  setGroceryImage: (groceryImage?: string) => void;
  setDescription: (description?: string) => void;
  setAmount: (amount?: number) => void;
  setGroceries: (groceries: any) => void;
}

const useGroceryQueryStore = create<GroceryQueryStore>((set) => ({
  groceryQuery: {
    categoryId: undefined, // Default to 0 if undefined
    sortOrder: 'name-asc', // Default value changed to 'name-asc'
    searchText: '', // Default value
    price: groceryData.results[0]?.prices[0]?.price || 0, // Default to 0 if undefined
    groceryName: groceryData.results[0]?.names[0]?.name || 'Unknown', // Default to 'Unknown' if undefined
    groceryImage: groceryData.results[0]?.images[0]?.image || '', // Default to empty string if undefined
    description: groceryData.results[0]?.descriptions[0]?.description || 'No description available', // Default to placeholder text if undefined
    amount: undefined, // Default value
  },
  setCategoryId: (categoryId) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery, categoryId } })),
  setSortOrder: (sortOrder) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery, sortOrder } })),
  setSearchText: (searchText) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery, searchText } })),
  setPrice: (price) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery, price } })),
  setGroceryName: (groceryName) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery, groceryName } })),
  setGroceryImage: (groceryImage) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery, groceryImage } })),
  setDescription: (description) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery, description } })),
  setAmount: (amount) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery, amount } })),
  setGroceries: (groceries) =>
    set((state) => ({ groceryQuery: { ...state.groceryQuery }, groceries })),
}));

export default useGroceryQueryStore;