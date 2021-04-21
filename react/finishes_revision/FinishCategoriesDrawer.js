import React, { useState } from 'react';
import { Segment, Menu, Icon, Button } from 'semantic-ui-react';

import AddEditFinishModal from './modals/AddEditFinishModal';
import ShareLinkModal from './modals/ShareLinkModal';
import PrintOptionsModal from './modals/PrintOptionsModal';

import styles from './FinishCategoriesDrawer.module.css';

const FinishCategoriesDrawer = ({ activeCategoryMap, categoryList }) => {
  const [showAddNewOptionModal, setShowAddNewOptionModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const toggleShowAddNewOptionModal = () => setShowAddNewOptionModal(!showAddNewOptionModal);
  const toggleShowShareLinkModal = () => setShowShareLinkModal(!showShareLinkModal);
  const toggleShowPrintOptionsModal = () => setShowPrintOptionsModal(!showPrintOptionsModal);

  const onSubmitPrintOptions = () => {
    setShowPrintOptionsModal(false);
    setTimeout(() => window.print(), 0);
  }
  
  return (
    <>
      <div className={`${styles.categoriesDrawer} hide-print`}>
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
          <div className={styles.modalLink}>
            <a onClick={toggleShowShareLinkModal}>Get Share Link</a>
          </div>
          <div className={styles.modalLink}>
            <a onClick={toggleShowPrintOptionsModal}>Print Options</a>
          </div>
        </Segment>
        <Segment vertical className={styles.categoriesSection}>
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
      {showPrintOptionsModal && (
        <PrintOptionsModal onClose={toggleShowPrintOptionsModal} categoryList={categoryList} onSubmit={onSubmitPrintOptions} />
      )}
    </>
  );
}

export default FinishCategoriesDrawer;

