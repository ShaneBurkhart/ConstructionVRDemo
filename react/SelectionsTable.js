import React from 'react';
import SelectionRow from './SelectionRow';

function SelectionsTable(props) {
  const { selections } = props;

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: "33%" }}>Selection</th>
          <th style={{ width: "66%" }}>Options</th>
        </tr>
      </thead>
      <tbody>
        {selections.map((value, index) => {
          return <SelectionRow key={value["id"]} index={index} selection={value} />
        })}
      </tbody>
    </table>
  );
}

export default SelectionsTable

