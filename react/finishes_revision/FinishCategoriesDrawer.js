import React, { useState } from 'react';
import { Label, Segment, Input, Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react';
import { allCategoriesArr } from '../../common/constants';

import { Droppable } from 'react-beautiful-dnd';

import FinishCategoryModalCategory from './FinishCategoryModalCategory';
import ActionCreators from './action_creators';

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
  return (
    <div className="categories-drawer hide-print">
      <Segment vertical>
          <img src="/logo.png" />
        </Segment>
        <Segment vertical>
          <label>Add A Category</label>
          <Input
            fluid
            size="mini"
            placeholder="Flooring"
            value={'add a value here'}
            action={{
              color: 'green',
              icon: 'plus',
              onClick: () => console.log('clicked'),
            }}
            onChange={() => console.log('on change')}
          />
        </Segment>
        <Segment vertical className="categories-section">
          <label>Click to Jump to Category</label>

          <Segment vertical>
            <CategoriesDnD
              categoryList={allCategoriesArr}
            />
          </Segment>
        </Segment>
    </div>
  );
}

export default FinishCategoriesDrawer;

