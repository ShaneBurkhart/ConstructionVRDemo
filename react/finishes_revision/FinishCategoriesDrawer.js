import React, { useState } from 'react';
import { Segment, Menu, Icon, Button } from 'semantic-ui-react';

import AddEditFinishModal from './modals/AddEditFinishModal';

import './FinishCategoriesDrawer.css';

const FinishCategoriesDrawer = ({ activeCategoryMap, categoryList, adminMode }) => {
  const [showAddNewOptionModal, setShowAddNewOptionModal] = useState(false);
  const toggleShowAddNewOptionModal = () => setShowAddNewOptionModal(!showAddNewOptionModal);
  
  return (
    <>
      <div className="categories-drawer hide-print">
        <Segment vertical>
          <a href="/" title="go to project dashboard">
            <img src="/logo.png" />
          </a>
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
              {(categoryList || []).map(category => (
                <Menu.Item
                  key={category}
                  name={category}
                  href={`#${category}`}
                  content={`${category} (${activeCategoryMap[category]})`}
                  active={false}
                />
              ))}
            </Menu>
          </Segment>
      </div>
      {showAddNewOptionModal && (
        <AddEditFinishModal onClose={toggleShowAddNewOptionModal} />
      )}
    </>
  );
}

export default FinishCategoriesDrawer;

