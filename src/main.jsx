import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Les données sont considérées fraîches pendant 30 secondes
      cacheTime: 300000, // Cache pendant 5 minutes
      refetchOnWindowFocus: false, // Ne pas refetch au focus de la fenêtre
      refetchOnMount: false, // Ne pas refetch au montage si les données sont encore fraîches
      retry: 1, // Réessayer seulement 1 fois en cas d'erreur
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
) 