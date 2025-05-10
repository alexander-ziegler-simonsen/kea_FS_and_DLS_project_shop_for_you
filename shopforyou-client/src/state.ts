import {create} from 'zustand';

interface GameQuery {
  genreId?: number;
  categoryId?: number; // Added categoryId
  platformId?: number;
  storeId?: number;
  sortOrder: string;
  searchText: string;
}

interface GameQueryStore {
  gameQuery: GameQuery;
  setGenreId: (genreId?: number) => void;
  setCategoryId: (categoryId?: number) => void; // Added setCategoryId
  setPlatformId: (platformId?: number) => void;
  setStoreId: (storeId?: number) => void;
  setSortOrder: (sortOrder: string) => void;
  setSearchText: (searchText: string) => void;
}

const useGameQueryStore = create<GameQueryStore>((set) => ({
    gameQuery: {} as GameQuery,
    setGenreId: (genreId) => 
        set((state) => ({ gameQuery: { ...state.gameQuery, genreId } })),
    setCategoryId: (categoryId) => 
        set((state) => ({ gameQuery: { ...state.gameQuery, categoryId } })), // Added setCategoryId implementation
    setPlatformId: (platformId) => 
        set((state) => ({ gameQuery: { ...state.gameQuery, platformId } })),
    setStoreId: (storeId) => 
        set((state) => ({ gameQuery: { ...state.gameQuery, storeId } })),
    setSortOrder: (sortOrder) => 
        set((state) => ({ gameQuery: { ...state.gameQuery, sortOrder } })),
    setSearchText: (searchText) => 
        set((state) => ({ gameQuery: { ...state.gameQuery, searchText } })),
}));

export default useGameQueryStore;