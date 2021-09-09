import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Segment, Menu, Icon, Button } from 'semantic-ui-react';


import AddEditFinishModal from './modals/AddEditFinishModal';
import NewPlanModal from './modals/NewPlanModal';

import styles from './SideDrawer.module.css';

const SideDrawer = ({
  plans,
  planDocs,
  searchQuery,
  categoryList,
  noSearchResults,
  clearSearchQuery,
  activeCategoryMap,
}) => {
  const isFilePanel = useRouteMatch(`/app/project/${PROJECT_ACCESS_TOKEN}/finishes/files`)
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [open, setOpen] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showNewOptionModal, setShowNewOptionModal] = useState(false);
  const toggleDrawer = () => setOpen(!open);
  
  const toggleNewPlanModal = () => setShowNewPlanModal(!showNewPlanModal);
  const toggleShowNewOptionModal = () => setShowNewOptionModal(!showNewOptionModal);
  
  useEffect(() => {
    const onResize = (e) => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
  }, []);

  const canClose = windowWidth < 1201;
  const show = !canClose || open;

  const drawerStyles = [styles.sideDrawer];
  const toggleBtnStyles = [styles.drawerButtons];
  if (canClose) toggleBtnStyles.push(styles.boxShadow);
  if (canClose && open) drawerStyles.push(styles.boxShadow);
  if (!show) [drawerStyles, toggleBtnStyles].forEach(s => s.push(styles.close));

  const CategoriesDrawerContent = () => (
    <>
      <Segment vertical>
        <Button
          icon
          labelPosition='right'
          color="green"
          style={{ width: '90%' }}
          onClick={toggleShowNewOptionModal}
        >
          Add a New Finish
          <Icon name='plus' />
        </Button>
      </Segment>
      {!!searchQuery && (
        <Segment vertical>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
            search: "{searchQuery}"
          </span>
        </Segment>
      )}
      <Segment vertical className={styles.categoriesSection}>
        <Menu text vertical>
          <Menu.Item header>Click to Jump to Category</Menu.Item>
          {!(categoryList || []).length && 
            <Menu.Item>
              {noSearchResults ? (
                <>
                  <div>Search query found no results</div>
                  <a className="block mt-2 text-blue-800 cursor-pointer" onClick={clearSearchQuery}>Clear Search</a>
                </>
              ) : (
                <>No categories have been added yet.</>
              )}
            </Menu.Item>
          }
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
    </>
  );
  
  const planNames = Object.fromEntries(plans.map(p => [p.id, p.name]));
  const dateOptions = { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "numeric" }
  const sortedPlanDocs = planDocs.sort((a, b) => (Date.parse(a.createdAt)) > Date.parse(b.createdAt) ? -1 : (Date.parse(a.createdAt) < Date.parse(b.createdAt) ? 1 : 0))
  const FilePanelDrawerContent = () => (
    <>
      <Segment vertical>
        <Button
          icon
          labelPosition='right'
          color="blue"
          style={{ width: '90%' }}
          onClick={toggleNewPlanModal}
        >
          Add a New Document
          <Icon name='plus' />
        </Button>
      </Segment>
      <Segment vertical className={styles.categoriesSection}>
        <Menu text vertical>
          <Menu.Item header>Recently Uploaded:</Menu.Item>
          {!(sortedPlanDocs || []).length && (
            <Menu.Item>
              No documents have been uploaded yet.
            </Menu.Item>
          )}
          {(sortedPlanDocs || []).slice(0, 10).map(d => (
            <Menu.Item
              key={d.uuid}
              name={d.filename}
              href={`/app/document/${d.uuid}`}
              target="_blank"
              className="border border-b border-gray-100"
              content={
                <div className="max-w-full truncate">
                  <div className="flex font-medium">{planNames[d.PlanId]} {d.isHistory && <div className="ml-2 text-sm italic text-gray-400 font-extralight">(history)</div>}</div>
                  <div className="mt-1 text-sm font-light">{new Date(d.createdAt).toLocaleDateString('en', dateOptions)}</div> 
                </div>
              }
              active={false}
            />
          ))}
        </Menu>
      </Segment>
    </>
  );
  
  return (
    <>
      <div className={`${drawerStyles.join(' ')} hide-print`}>
        <Segment vertical>
          <a href="/" title="go to project dashboard">
            <img src="/logo.png" />
          </a>
        </Segment>
        {!isFilePanel ? (
          <CategoriesDrawerContent />
        ) : (
          <FilePanelDrawerContent />
        )}
        {canClose && (
          <span onClick={toggleDrawer} className={toggleBtnStyles.join(' ')}>
            <Button
              icon={<Icon name={`angle double ${open ? 'left' : 'right'}`} />}
              color="purple"
            />
          </span>
        )}
      </div>
      {showNewOptionModal && (
        <AddEditFinishModal onClose={toggleShowNewOptionModal} />
      )}
      {showNewPlanModal && (
        <NewPlanModal onClose={toggleNewPlanModal} />
      )}
    </>
  );
}

export default SideDrawer;
