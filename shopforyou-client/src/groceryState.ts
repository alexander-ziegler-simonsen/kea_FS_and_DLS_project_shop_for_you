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

interface Category {
  id: number;
  name: string;
}

interface GroceryQueryStore {
  groceryQuery: GroceryQuery;
  categories: Category[]; // Added categories to the store
  setCategoryId: (categoryId?: number) => void;
  setSortOrder: (sortOrder: string) => void;
  setSearchText: (searchText: string) => void;
  setPrice: (price?: number) => void;
  setGroceryName: (groceryName?: string) => void;
  setGroceryImage: (groceryImage?: string) => void;
  setDescription: (description?: string) => void;
  setAmount: (amount?: number) => void;
  setGroceries: (groceries: any) => void;
  setCategories: (categories: Category[]) => void; // Added function to update categories
}

const useGroceryQueryStore = create<GroceryQueryStore>((set) => ({
  groceryQuery: {
    categoryId: undefined,
    sortOrder: 'name-asc',
    searchText: '',
    price: groceryData.results[0]?.prices[0]?.price || 0,
    groceryName: groceryData.results[0]?.names[0]?.name || 'Unknown',
    groceryImage: groceryData.results[0]?.images[0]?.image || '',
    description: groceryData.results[0]?.descriptions[0]?.description || 'No description available',
    amount: undefined,
  },
  categories: [], // Initialize categories as an empty array
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
  setCategories: (categories) =>
    set(() => ({ categories })), // Update categories in the store
}));

export default useGroceryQueryStore;