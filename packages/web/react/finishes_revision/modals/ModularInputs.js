import React, { useState, useRef } from 'react';
import { Grid, Image, Label, Input, Form, Dropdown } from 'semantic-ui-react';

import { addHTTPToUrlIfMissing } from '../../../common/formatters';
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

export const CategoryDropdown = ({ selectedCategory, options, handleSelectCategory, disabled }) => {
  const _dd = useRef(null)
  return (
    <>
      <label className="uiFormFieldLabel">Select a category</label>
      <Dropdown
        ref={dd => _dd.current = dd}
        disabled={disabled}
        button 
        basic
        fluid
        scrolling
        upward={false}
        selection
        value={selectedCategory}
        search={(options, val) => options.filter(({text}) => text.toLowerCase().startsWith(val.toLowerCase()))}
        text={selectedCategory || 'Select One'}
        options={options.map(c => ({ key: c, text: c, value: c }))}
        onChange={(_e, {value}) =>{
          handleSelectCategory(value)
        }}
      />
    </>
)};

export const PriceInput = ({ value, onChange, error, onBlur }) => (
  <Form.Field style={{ position: 'relative' }}>
    <label>Unit Price</label>
    <Input
      fluid
      error={error}
      labelPosition="left"
      placeholder='10.21'
      type="number"
      step="0.01"
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

export const DocumentInput = ({ docURL, onDrop, onChange, onDelete }) => {
  const [inputVal, setInputVal] = useState('');
  const [show, setShow] = useState(!!docURL);

  if (!show) return (
    <div className="addADocBtn">
      <a href="#/" onClick={() => setShow(true)}>{docURL ? "Edit " : "Add a "} Document</a>
    </div>
  )
  
  return (
    <div className="field">
        <label style={{marginBottom: 11}}>
          <span>Document - </span><a href="#/" onClick={() => setShow(false)}>Hide</a>
        </label>
      <Grid>
        <Grid.Row>
          {docURL && (
            <Grid.Column>
              <div className="docAttachment">
                <span>📎</span>
                <a href={docURL} target="_blank">{docURL}</a>
              </div>
              <a href="#/" onClick={onDelete}>Remove</a>
            </Grid.Column>
          )}
          {!docURL &&
            <Grid.Column width={8}>
              <label>Drop or select a file.</label>
              <StyledDropzone onDrop={onDrop} accept={null} />
              <label>Or upload using a link.</label>
              <div>
                <Input
                  fluid
                  icon="linkify"
                  iconPosition="left"
                  placeholder="https://..."
                  value={inputVal}
                  onChange={(e, {value}) => setInputVal(value)}
                  action={{
                    icon: "upload",
                    content: "Add",
                    onClick: () => {
                      onChange(null, {value: addHTTPToUrlIfMissing(inputVal)});
                      setInputVal('');
                    },
                  }}
                />
              </div>
            </Grid.Column>
          }
        </Grid.Row>
      </Grid>
    </div>
)};

export const ImagesInput = ({ images, onDrop, onImgLinkUpload, onSwitchImgOrder, onDelete }) => {
  const [inputVal, setInputVal] = useState('');
  
  return (
    <div className="field">
        <label style={{marginBottom: 11}}>
          Images
          {images.length > 1 && (
            <span style={{ fontSize: '.8rem', marginLeft: 5 }}>
              -<a style={{ marginLeft: 5, zIndex: 99, fontWeight: 500 }} href="#/" onClick={() => onSwitchImgOrder()}>Switch Image Order</a>
            </span>
          )}
        </label>
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
                  value={inputVal}
                  onChange={(e, {value}) => setInputVal(value)}
                  action={{
                    icon: "upload",
                    content: "Upload",
                    onClick: () => {
                      onImgLinkUpload(inputVal);
                      setInputVal('');
                    },
                  }}
                />
              </div>
              <label style={{ display: 'block', marginTop: 8 }}>Or hit "ctrl + v" to paste an image from your clipboard.</label>
            </Grid.Column>
          }
        </Grid.Row>
      </Grid>
    </div>
)};

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
