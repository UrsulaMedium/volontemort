import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import WarehousePage from './pages/WarehousePage';
import IncomingPage from './pages/IncomingPage';
import ShipmentsPage from './pages/ShipmentsPage';
import NewShipmentPage from './pages/NewShipmentPage';
import ShipmentDetailPage from './pages/ShipmentDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import ContactsPage from './pages/ContactsPage';
import DocumentsPage from './pages/DocumentsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<WarehousePage />} />
            <Route path="/incoming" element={<IncomingPage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/shipments/new" element={<NewShipmentPage />} />
            <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
