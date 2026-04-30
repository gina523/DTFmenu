/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerMenu } from './pages/CustomerMenu';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMenuManager } from './pages/AdminMenuManager';
import { AdminLayout } from './components/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Face */}
        <Route path="/" element={<CustomerMenu />} />
        
        {/* Management Face */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/orders" replace />} />
          <Route path="orders" element={<AdminDashboard />} />
          <Route path="menu" element={<AdminMenuManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

