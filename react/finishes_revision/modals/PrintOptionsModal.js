import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Button, Checkbox } from 'semantic-ui-react';

import ActionCreator from '../action_creators';

import styles from './PrintOptionsModal.module.css';

const PrintOptionsModal = ({ onClose, categoryList=[], onSubmit }) => {
  const hiddenCategories = useSelector(state => state.categoriesHiddenFromPrint);
  const [nextHiddenCategories, setNextHiddenCategories] = useState({ ...hiddenCategories });

  const togglePrintCategories = (_e, {value}) => {
    if (!nextHiddenCategories[value]) return setNextHiddenCategories(prev => ({ ...prev, [value]: true }));
    return setNextHiddenCategories(prev => ({ ...prev, [value]: !prev[value] }));
  };
  
  const selectAll = () => setNextHiddenCategories({});
  
  const deselectAll = () => {
    const nextMap = {};
    categoryList.forEach(c => nextMap[c] = true);
    setNextHiddenCategories(nextMap);
  };

  const handleSubmit = () => {
    ActionCreator.updatePrintCategories(nextHiddenCategories);
    onSubmit();
  };
  
  return (
    <Modal
      closeIcon
      open={true}
      onClose={onClose}
      size="tiny"
    >
      <Modal.Header>
        Select which categories to include in print
      </Modal.Header>
      <Modal.Content>
        <a className="pointer" onClick={selectAll}>Select All</a>
        <span> - </span> 
        <a className="pointer" onClick={deselectAll}>Deselect All</a>
        <div className={styles.checkboxesContainer} style={{ height: 22 * Math.ceil(categoryList.length/2) }}>
          {categoryList.sort().map(category => (
            <Checkbox
              key={category}
              value={category}
              label={category}
              checked={!nextHiddenCategories[category]}
              style={{ display: 'block', marginTop: 4 }}
              onChange={togglePrintCategories}
            />
          ))}
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="green"
          icon="print"
          content="Print"
        />
      </Modal.Actions>
    </Modal>
  );
}

export default PrintOptionsModal;
