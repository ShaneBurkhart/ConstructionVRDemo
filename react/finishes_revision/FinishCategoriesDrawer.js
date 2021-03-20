import React, { useState } from 'react';
import { Segment, Menu, Input, Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react';

import AddNewOptionModal from './modals/AddNewOptionModal';

import './FinishCategoriesDrawer.css';

const FinishCategoriesDrawer = ({ activeCategoryMap }) => {
  const [showAddNewOptionModal, setShowAddNewOptionModal] = useState(false);
  const toggleShowAddNewOptionModal = () => setShowAddNewOptionModal(!showAddNewOptionModal);
  
  return (
    <>
      <div className="categories-drawer hide-print">
        <Segment vertical>
            <img src="/logo.png" />
          </Segment>
          <Segment vertical>
            <Button
              icon
              labelPosition='right'
              color="green"
              onClick={toggleShowAddNewOptionModal}
            >
              Add a New Finish
              <Icon name='plus' />
            </Button>
          </Segment>
          <Segment vertical className="categories-section">
            <Menu text vertical>
              <Menu.Item header>Click to Jump to Category</Menu.Item>
              {(Object.keys(activeCategoryMap) || []).map(category => (
                <Menu.Item
                  key={category}
                  name={category}
                  content={`${category} (${activeCategoryMap[category]})`}
                  active={false}
                  onClick={() => {}}
                />
              ))}
            </Menu>
          </Segment>
      </div>
      {showAddNewOptionModal && (
        <AddNewOptionModal 
          onClose={toggleShowAddNewOptionModal}
        />
      )}
    </>
  );
}

export default FinishCategoriesDrawer;

