import React from 'react';
import { Dropdown } from 'semantic-ui-react';


const CustomizedDropdown = ({ optionList, onChange, value, disabled=false }) => {
  return (
    <Dropdown
      button 
      basic
      fluid
      text={value || 'Select One'}
      options={optionList.map(li => ({ 
        key: li["Record ID"],
        text: li["Name"],
        value: li["Record ID"],
      }))}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

export default CustomizedDropdown;
