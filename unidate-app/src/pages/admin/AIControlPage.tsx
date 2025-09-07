import React from 'react';
import SimpleAdminLayout from '../../components/Admin/Layout/SimpleAdminLayout';
import AIControlPanel from '../../components/Admin/AI/AIControlPanel';

const AIControlPage: React.FC = () => {
  return (
    <SimpleAdminLayout>
      <AIControlPanel />
    </SimpleAdminLayout>
  );
};

export default AIControlPage;
