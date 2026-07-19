import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { VehicleProvider } from './context/VehicleContext.tsx';
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
              <VehicleProvider>
                <WishlistProvider>
                  <ChatProvider>
                    <App />
                  </ChatProvider>
                </WishlistProvider>
              </VehicleProvider>
            </LocationProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
