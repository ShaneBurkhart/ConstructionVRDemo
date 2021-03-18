import React, { useState } from 'react';
import _ from 'underscore';
import { Label, Popup, Input, Grid, Dropdown, Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react';

import { finishCategories, getAttrList } from '../../../common/constants';

import { PriceInput, DetailsInput, ImagesInput, GeneralInput } from './ModularInputs';

import ActionCreators from '../action_creators';
import './AddNewOptionModal.css';


const AddNewOptionModal = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});

  const handleSelectCategory = categoryName => {
    setAttributes([]);
    setSelectedCategory(categoryName);
    const category = finishCategories[categoryName];
    setAttributes(getAttrList(category));
  }

  const resetForm = () => {
    setAttributes([]);
    setAttributeValues({});
    setSelectedCategory('');
  }


  const getAttributeInput = (attrName) => {
    const val = attributeValues[attrName] || '';
    const arrVal = attributeValues[attrName] || [];
    const onChange = (e, {value}) => setAttributeValues(prev => ({ ...prev, [attrName]: value }));
    const onDeleteImg = (image) => setAttributeValues(prev => ({ ...prev, [attrName]: arrVal.filter(img => img !== image) }));
    const onDrop = (acceptedFiles) => {
      if (arrVal.length < 2) {
        (acceptedFiles || []).forEach(file => {
          ActionCreators.presignedURL(file, (data) => {
            ActionCreators.uploadFile(file, data.presignedURL, () => {
              arrVal.push(data.awsURL);
              setAttributeValues(prev => ({ ...prev, [attrName]: arrVal }));
            });
          });
        });
      }
    };

    const attrInputMap = {
      "Price":  <PriceInput key={attrName} value={val} onChange={onChange} />,
      "Details":  <DetailsInput key={attrName} value={val} onChange={onChange} />,
      "Images": <ImagesInput key={attrName} images={arrVal} onDelete={onDeleteImg} onDrop={onDrop} />,
      default: <GeneralInput key={attrName} label={attrName} value={val} onChange={onChange} />
    }
    const attrInput = attrInputMap[attrName] ? attrInputMap[attrName] : attrInputMap.default;
    return attrInput;
  }


  return (
    <Modal
      closeIcon
      closeOnDimmerClick={false}
      open={true}
      onClose={onClose}
      className="add-new-option-modal"
    >
      <Modal.Header>
        Add a New Finish
      </Modal.Header>
      <Modal.Content>
        <Form>
          {selectedCategory && (
            <span>
              <label style={{ fontWeight: 'bold' }}>Category:</label>
              <Label style={{ marginLeft: 20 }} color="teal">
                {selectedCategory}
                <Popup
                  content="Clearing the Category will reset the form"
                  trigger={ <Icon name='delete' onClick={resetForm} /> }
                />
              </Label>
            </span>
          )}
          {!selectedCategory && <div style={{ minHeight: 50, width: "100%" }}>
            <label style={{display: "block"}}>Select a category</label>
            <Dropdown
              button 
              basic
              fluid
              text={selectedCategory || 'Select One'}
              options={Object.keys(finishCategories).map(c => ({ key: c, text: c, value: c }))}
              onChange={(e, {value}) => handleSelectCategory(value)}
            />
          </div>}
          {!_.isEmpty(attributes) && attributes.map(({name}) => getAttributeInput(name))}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => alert('saving')}
          color="green"
          disabled={!selectedCategory || _.isEmpty(attributeValues)}
        >
          Save
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default AddNewOptionModal;
