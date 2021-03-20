import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Droppable } from 'react-beautiful-dnd';
import { Popup, Button, Icon } from 'semantic-ui-react';

import { getCategoryTag } from '../../common/constants';

import FinishCard from './FinishCard';

import styles from "./FinishCategoryTable.module.css";

const FinishCategoriesTable = ({ category, finishes }) => {
  const [expanded, setExpanded] = useState(true);
  const isAdmin = useSelector(state => state.adminMode);

  const count = finishes.length;
  const tag = getCategoryTag(category);
  
  const onToggleCollapse = () => setExpanded(!expanded);
  const handleAlphabetizeCards = () => alert('nice');
  const handleAddNewCard = () => alert('niiice');


  return (
    <div id={category} className={`${styles.categoryContainer} ${count ? "no-print" : ""}`}>
      <header>
        <h2 onClick={onToggleCollapse}>
          <Icon className="hide-print" name={expanded ? "angle down" : "angle up"} />
          {category}
          <span className={`${styles.expandCollapseText} hide-print`}>
            <a href="#/">
              {expanded ? `Collapse (${count} selections)` : `Expand (${count} selections)` }
            </a>
          </span>
        </h2>
        {isAdmin && (
          <h2 className="hide-print" style={{ width: 200, textAlign: "right" }}>
            <Button icon="plus" onClick={handleAddNewCard} />
            <Button icon="sort alphabet down" onClick={handleAlphabetizeCards} />
          </h2>
        )}
      </header>
      {expanded && finishes.map(f => (
        <FinishCard
          key={f.id}
          tag={tag}
          finishDetails={f}
        />
      ))}
    </div>
  )
}

export default FinishCategoriesTable;