import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
import { Segment, Menu, Icon, Button } from 'semantic-ui-react';
// import ActionCreators from './action_creators';

import AddEditFinishModal from './modals/AddEditFinishModal';
import ShareLinkModal from './modals/ShareLinkModal';

import './FinishCategoriesDrawer.css';

const FinishCategoriesDrawer = ({ activeCategoryMap, categoryList }) => {
  const [showAddNewOptionModal, setShowAddNewOptionModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const toggleShowAddNewOptionModal = () => setShowAddNewOptionModal(!showAddNewOptionModal);
  const toggleShowShareLinkModal = () => setShowShareLinkModal(!showShareLinkModal);
  
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
            <div className="sharelink">
              <a onClick={toggleShowShareLinkModal}>Get Share Link</a>
            </div>
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
      {showShareLinkModal && (
        <ShareLinkModal onClose={toggleShowShareLinkModal} />
      )}
    </>
  );
}

export default FinishCategoriesDrawer;

