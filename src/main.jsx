import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000, // Données fraîches pendant 5 secondes seulement
      cacheTime: 300000, // Cache pendant 5 minutes
      refetchOnWindowFocus: false, // Ne pas refetch au focus
      refetchOnMount: true, // Refetch au montage pour avoir les dernières données
      retry: 1, // Réessayer 1 fois en cas d'erreur
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
) 