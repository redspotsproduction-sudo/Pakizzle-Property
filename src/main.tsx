import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { PropertyProvider } from './context/PropertyContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ChatProvider } from './context/ChatContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <LocationProvider>
              <PropertyProvider>
                <WishlistProvider>
                  <ChatProvider>
                    <App />
                  </ChatProvider>
                </WishlistProvider>
              </PropertyProvider>
            </LocationProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
