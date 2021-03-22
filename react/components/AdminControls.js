import React from 'react';
import { Icon, Button, Popup } from 'semantic-ui-react';

import styles from "./AdminControls.module.css";

const AdminControls = ({ onClickTrash, dragHandleProps }) => {
  return (
    <div className={`${styles.adminControls} hide-print`} onClick={(e) => e.stopPropagation()}>
      {dragHandleProps &&
        <div {...dragHandleProps}>
          <Icon name="arrows alternate" />
        </div>
      }
      {onClickTrash &&
        <Popup
          on="click"
          content={
            <div>
              <p className="bold">Are you sure?</p>
              <Button color="red" onClick={onClickTrash}>Delete</Button>
            </div>
          }
          trigger={
            <div>
              <Icon name="trash" />
            </div>
          }
        />
      }
    </div>
  );
}

export default AdminControls;
