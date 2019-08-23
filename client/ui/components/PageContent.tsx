import * as React from 'react';
import Header from './Head';

function PageContent({children}: any) {
  return (
    <React.Fragment>
      <Header />
      <div>{children}</div>
    </React.Fragment>
  )
}

export default PageContent;