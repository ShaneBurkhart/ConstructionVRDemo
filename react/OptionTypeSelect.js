import React from 'react';

import { Select } from 'semantic-ui-react'

const options = [
  "Concepts",
  "Flooring",
  "Light Fixture",
  "Bath Accessories",
  "Appliance",
  "Plumbing Fixture",
  "Tile",
  "Exterior",
  "Cabinet/Countertop",
  "Paint Color",
  "LVT - Luxury Vinyl Tile",
  "Millwork",
  "Furniture",
  "Mirrors",
  "Art",
  "Misc",
  "Blinds",
  "Shelving",
  "Doors",
  "Other"
].map((v, i) =>({ key: v, text: v, value: v }))

function OptionTypeSelect(props) {
  const { value, compact, onChange, emptyText } = props;
  var o = options;

  if (emptyText && emptyText != "") {
    o = [{ key: emptyText, text: emptyText, value: "" }].concat(options);
  }

  return (
    <Select
      value={value}
      compact={compact}
      options={o}
      onChange={onChange}
      />
  );
}

export default OptionTypeSelect



