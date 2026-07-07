'use client'
import { create, createStore, useStore } from 'zustand'
import { createContext, useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export interface GameState {}

export const createGameStore = () => createStore<GameState>()((set, get) => ({}))

export type GameStoreApi = ReturnType<typeof createGameStore>

export const GameStoreContext = createContext<GameStoreApi | undefined>(undefined)
export const GameStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const store = createGameStore()
  const pathName = usePathname()
  useEffect(() => {}, [pathName])
  return <GameStoreContext.Provider value={store}>{children}</GameStoreContext.Provider>
}
export const useGameStore = <T,>(selector: (store: GameState) => T): T => {
  const StoreContext = useContext(GameStoreContext)
  if (!StoreContext) throw new Error('useGameStore must be used within an GameStoreProvider')
  return useStore(StoreContext, selector)
}
