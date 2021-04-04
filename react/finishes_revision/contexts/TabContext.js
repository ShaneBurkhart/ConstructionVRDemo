import React from 'react';

const TabContext = React.createContext({
  focusedEl: null,
  registerAttrCount: () => {},
  setFocusedEl: () => {},
  tabToNextEl: () => {},
  tabToPrevEl: () => {},
});

export default TabContext;