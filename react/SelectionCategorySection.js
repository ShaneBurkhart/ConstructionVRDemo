import React from 'react';
import SelectionsTable from './SelectionsTable';

function SelectionCategorySection(props) {
  const { category, selections } = props;

  return (
    <div className="selection-category-section">
      <header className="category-header">
        <h2>{category}</h2>
      </header>
      <SelectionsTable selections={selections} />
    </div>
  );
}

export default SelectionCategorySection
