'use client'
import dynamic from 'next/dynamic'

// Disable SSR for the component throwing the error
const GameWrapper = dynamic(() => import('./game-state'), { ssr: false })
export default GameWrapper
