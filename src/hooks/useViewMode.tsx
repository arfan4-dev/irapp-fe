import {useState} from 'react'

const useViewMode = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const toggleViewMode = () => {
        setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'))
    }

    return {
        viewMode,
        setViewMode,
        toggleViewMode,
    }

}

export default useViewMode