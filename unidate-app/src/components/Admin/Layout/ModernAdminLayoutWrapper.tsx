import React from 'react';
import ModernAdminLayout from './ModernAdminLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ModernAdminLayoutWrapper: React.FC<AdminLayoutProps> = ({ children }) => {
  return <ModernAdminLayout>{children}</ModernAdminLayout>;
};

export default ModernAdminLayoutWrapper;
