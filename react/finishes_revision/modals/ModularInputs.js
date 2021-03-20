import React from 'react';
import { Grid, Image, Label, Input, Form, Dropdown } from 'semantic-ui-react';

import StyledDropzone from "../../components/StyledDropzone";
import styles from './AddEditFinishModals.module.css';

export const CategoryDropdown = ({ selectedCategory, options, handleSelectCategory}) => (
  <>
    <label className={styles.uiFormFieldLabel}>Select a category</label>
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

export const PriceInput = ({ value, onChange }) => (
  <Form.Field>
    <label>Unit Price</label>
    <Input
      fluid
      labelPosition="left"
      placeholder='10.21'
      value={value}
      onChange={onChange}
    >
      <Label basic>$</Label>
      <input />
    </Input>
  </Form.Field>
);

export const DetailsInput = ({ value, onChange}) => (
  <Form.TextArea
    label='Details'
    placeholder='Add notes about this option...'
    value={value}
    onChange={onChange}
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

export const GeneralInput = ({ value, onChange, label }) => (
  <Form.Input
    fluid
    label={label}
    value={value}
    onChange={onChange}
  />
);
