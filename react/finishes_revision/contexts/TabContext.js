import React from 'react';

const TabContext = React.createContext({
  focusedEl: null,
  setFocusedEl: () => {},
  tabToNextCategory: () => {},
  tabToPrevCategory: () => {},
});

export default TabContext;