import { createContext, useContext, useState, ReactNode } from 'react'

export interface EquippableItem {
  id: string
  name: string
  price: string
  originalPrice: string
  image: string
  rating: number
  reviews: number
  discount: string
  category: string
  isEquippable: true
  equipSlot: 'torso' | 'face' | 'feet' | 'head' | 'hands'
}

interface MannequinContextType {
  equippedItems: Record<string, EquippableItem | null>
  equipItem: (item: EquippableItem) => void
  unequipItem: (slot: string) => void
  isEquipped: (itemId: string) => boolean
  getEquippedItem: (slot: string) => EquippableItem | null
}

const MannequinContext = createContext<MannequinContextType | undefined>(undefined)

export const useMannequin = () => {
  const context = useContext(MannequinContext)
  if (!context) {
    throw new Error('useMannequin deve ser usado dentro de um MannequinProvider')
  }
  return context
}

interface MannequinProviderProps {
  children: ReactNode
}

export const MannequinProvider = ({ children }: MannequinProviderProps) => {
  const [equippedItems, setEquippedItems] = useState<Record<string, EquippableItem | null>>({
    torso: null,
    face: null,
    feet: null,
    head: null,
    hands: null,
  })

  const equipItem = (item: EquippableItem) => {
    setEquippedItems((prev) => ({
      ...prev,
      [item.equipSlot]: item,
    }))
  }

  const unequipItem = (slot: string) => {
    setEquippedItems((prev) => ({
      ...prev,
      [slot]: null,
    }))
  }

  const isEquipped = (itemId: string) => {
    return Object.values(equippedItems).some((item) => item?.id === itemId)
  }

  const getEquippedItem = (slot: string) => {
    return equippedItems[slot] || null
  }

  const value: MannequinContextType = {
    equippedItems,
    equipItem,
    unequipItem,
    isEquipped,
    getEquippedItem,
  }

  return <MannequinContext.Provider value={value}>{children}</MannequinContext.Provider>
}
