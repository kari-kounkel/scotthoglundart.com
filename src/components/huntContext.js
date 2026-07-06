import { createContext, useContext } from 'react'

// Shared context for the Acorn Hunt — isolated here so Daisy.jsx and
// AcornHunt.jsx can both use it without a circular import.
export const HuntCtx = createContext(null)
export const useHunt = () => useContext(HuntCtx)
