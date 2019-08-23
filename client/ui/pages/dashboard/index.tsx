import * as React from 'react';

import PageContent from '../../components/PageContent';

function Dashboard() {
  return (
    <PageContent>
      <h2>Dashboard</h2>
    </PageContent>
  )
}

Dashboard.getInitialprops = async () => {
  return {};
};

export default Dashboard;