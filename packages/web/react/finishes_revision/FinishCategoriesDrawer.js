import React, { useState, useEffect } from 'react';
import { Segment, Menu, Icon, Button } from 'semantic-ui-react';

import AddEditFinishModal from './modals/AddEditFinishModal';

import styles from './FinishCategoriesDrawer.module.css';

const FinishCategoriesDrawer = ({ activeCategoryMap, categoryList }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [open, setOpen] = useState(false);
  const [showAddNewOptionModal, setShowAddNewOptionModal] = useState(false);
  
  const toggleDrawer = () => setOpen(!open);
  const toggleShowAddNewOptionModal = () => setShowAddNewOptionModal(!showAddNewOptionModal);
  
  useEffect(() => {
    const onResize = (e) => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
  }, []);

  const canClose = windowWidth < 1201;
  const show = !canClose || open;

  const drawerStyles = [styles.categoriesDrawer];
  const toggleBtnStyles = [styles.drawerButtons];
  if (canClose) toggleBtnStyles.push(styles.boxShadow);
  if (canClose && open) drawerStyles.push(styles.boxShadow);
  if (!show) [drawerStyles, toggleBtnStyles].forEach(s => s.push(styles.close));
  
  return (
    <>
      <div className={`${drawerStyles.join(' ')} hide-print`}>
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
        {canClose && (
          <span onClick={toggleDrawer} className={toggleBtnStyles.join(' ')}>
            <Button
              icon={<Icon name={`angle double ${open ? 'left' : 'right'}`} />}
              color="purple"
            />
          </span>
        )}
      </div>
      {showAddNewOptionModal && (
        <AddEditFinishModal onClose={toggleShowAddNewOptionModal} />
      )}
    </>
  );
}

export default FinishCategoriesDrawer;

