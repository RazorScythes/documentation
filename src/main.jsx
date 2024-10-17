import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import HttpsRedirect from 'react-https-redirect';
import './index.css'

import { QueryClient, QueryClientProvider } from 'react-query';
import { store } from './app/store'
import { Provider } from 'react-redux'

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HttpsRedirect>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HttpsRedirect>
  </Provider>,
)
