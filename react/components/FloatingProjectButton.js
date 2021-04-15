import React, { useState } from 'react';
import { Icon, Button, Menu } from 'semantic-ui-react';

import styles from './FloatingProjectButton.module.css';

const FloatingProjectButton = ({ name, options }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const onMouseEnter = () => {
    setShowMenu(true);
  }
  
  const onMouseLeave = () => {
    setShowMenu(false);
  }

  return (
    <div
      className={`${styles.floatingProjectButtonContainer} hide-print`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {showMenu && (
        <Menu vertical>
          {options.map(([action, label]) => (
            <Menu.Item
              key={label}
              onClick={action}
              name={label}
              content={label}
            />
          ))}
        </Menu>
      )}
      <Button icon labelPosition="right" onClick={_=>window.scrollTo(0,0)}>
        {name}
        <Icon name="up arrow" />
      </Button>
    </div>
  );
}

export default FloatingProjectButton;
