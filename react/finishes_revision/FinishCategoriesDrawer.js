import React, { useState } from 'react';
import { Label, Segment, Input, Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react';
import { allCategoryNames } from '../../common/constants';

import { Droppable } from 'react-beautiful-dnd';

import FinishCategoryModalCategory from './FinishCategoryModalCategory';
import AddNewOptionModal from './modals/AddNewOptionModal';
// import ActionCreators from './action_creators';

import './FinishCategoriesDrawer.css';

const CategoriesDnD = ({ categoryList }) => {
  const _droppableId = Math.random().toString(36).substring(2, 15);
  return (
    <Droppable droppableId={_droppableId} type="CATEGORY">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {categoryList.map((c, i) => (
            <FinishCategoryModalCategory
              key={c}
              index={i}
              category={c}
            />
          ))}
        {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

const FinishCategoriesDrawer = () => {
  const [showAddNewOptionModal, setShowAddNewOptionModal] = useState(true);
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
            <label>Click to Jump to Category</label>
            <Segment vertical>
              <CategoriesDnD
                categoryList={allCategoryNames}
              />
            </Segment>
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

