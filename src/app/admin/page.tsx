'use client';

import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <AdminLayout title="Admin Dashboard">
      {(currentUser) => <AdminDashboard currentUser={currentUser} />}
    </AdminLayout>
  );
}
