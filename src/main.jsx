import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Données toujours considérées comme périmées pour rafraîchissement instantané
      cacheTime: 300000, // Cache pendant 5 minutes
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