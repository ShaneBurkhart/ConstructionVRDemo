import React from 'react';
import { Grid, Image, Label, Input, Form, Dropdown } from 'semantic-ui-react';

import StyledDropzone from "../../components/StyledDropzone";
import './ModularInputs.css';

const ErrorLabel = (label="") => (
  <Label
    basic
    color="red"
    size="mini"
    style={{ position: 'absolute', top: 0, left: `${String(label).length + 5}ch`}}
  >
    Invalid Format
  </Label>
)

export const CategoryDropdown = ({ selectedCategory, options, handleSelectCategory }) => (
  <>
    <label className="uiFormFieldLabel">Select a category</label>
    <Dropdown
      button 
      basic
      fluid
      scrolling
      upward={false}
      text={selectedCategory || 'Select One'}
      options={options.map(c => ({ key: c, text: c, value: c }))}
      onChange={(e, {value}) => handleSelectCategory(value)}
    />
  </>
);

export const PriceInput = ({ value, onChange, error, onBlur }) => (
  <Form.Field style={{ position: 'relative' }}>
    <label>Unit Price</label>
    <Input
      fluid
      error={error}
      labelPosition="left"
      placeholder='10.21'
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    >
      <Label basic>$</Label>
      <input />
    </Input>
    {error && <ErrorLabel label={"Unit Price"} />}
  </Form.Field>
);

export const DetailsInput = ({ value, onChange, onBlur, error }) => (
  <Form.TextArea
    label='Details'
    placeholder='Add notes about this option...'
    error={error}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
  />
);

export const ImagesInput = ({ images, onDrop, onDelete }) => (
  <div className="field">
    <label>Images</label>
    <Grid>
      <Grid.Row>
        {images.map((image) => (
          <Grid.Column width={8} key={image}>
            <Image src={image} />
            <span><a href="#/" onClick={() => onDelete(image)}>Remove</a></span>
          </Grid.Column>
        ))}
        {images.length < 2 &&
          <Grid.Column width={8}>
            <label>Drop or select a file.</label>
            <StyledDropzone onDrop={onDrop} />
            <label>Or upload using a link.</label>
            <div>
              <Input
                fluid
                icon="linkify"
                iconPosition="left"
                placeholder="https://..."
                // value={value}
                onChange={() => console.log('to do')}
                action={{
                  icon: "upload",
                  content: "Upload",
                  onClick: () => console.log('okay'),
                }}
              />
            </div>
          </Grid.Column>
        }
      </Grid.Row>
    </Grid>
  </div>
);

export const GeneralInput = ({ value, onChange, onBlur, error, label }) => (
  <span style={{ position: 'relative' }}>
    <Form.Input
      fluid
      label={label}
      error={error}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
    {error && <ErrorLabel label={label} />}
  </span>
);
