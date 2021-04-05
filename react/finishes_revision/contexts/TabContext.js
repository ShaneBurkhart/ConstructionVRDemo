import React from 'react';

const TabContext = React.createContext({
  focusedEl: null,
  setFocusedEl: () => {},
  goToNextCategory: () => {},
  goToPrevCategory: () => {},
});

export default TabContext;