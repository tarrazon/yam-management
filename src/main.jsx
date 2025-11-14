import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Données toujours considérées comme périmées pour rafraîchissement instantané
      gcTime: 0, // Pas de cache (anciennement cacheTime)
      refetchOnWindowFocus: true, // Refetch automatiquement au retour sur la fenêtre
      refetchOnMount: true, // Refetch au montage
      retry: 1, // Réessayer 1 fois en cas d'erreur
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
) 