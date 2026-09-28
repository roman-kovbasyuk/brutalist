import { createContext, useContext } from 'react'

/** A tile's header slot for chart controls, so a chart's table switch sits in the tile's top-right corner. */
export const TileControlsContext = createContext<HTMLElement | null>(null)
export const useTileControls = () => useContext(TileControlsContext)
