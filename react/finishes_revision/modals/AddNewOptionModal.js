import React, { useState } from 'react';
import _ from 'underscore';
import { Label, Popup, Input, Grid, Dimmer, Loader, Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react';

import { finishCategories, getAttrList } from '../../../common/constants';

import { CategoryDropdown, PriceInput, DetailsInput, ImagesInput, GeneralInput } from './ModularInputs';

import ActionCreators from '../action_creators';
import './AddNewOptionModal.css';


const AddNewOptionModal = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSelectCategory = categoryName => {
    setAttributes([]);
    setSelectedCategory(categoryName);
    const category = finishCategories[categoryName];
    setAttributes(getAttrList(category));
  }

  const handleSubmit = () => {
    setLoading(true);
    const newFinish = {
      category: selectedCategory,
      attributes: attributeValues,
    }
    const onSuccess = () => {
      setLoading(false);
      onClose();
    };
    const onError = () => {
      setLoading(false);
      alert('something went wrong');
    }
    ActionCreators.submit(newFinish, onSuccess, onError);
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
        (acceptedFiles || []).forEach((file) => {
          setLoading(true)
          ActionCreators.presignedURL(file, (data) => {
            ActionCreators.uploadFile(file, data.presignedURL, () => {
              arrVal.push(data.awsURL);
              setAttributeValues(prev => ({ ...prev, [attrName]: arrVal }));
              setLoading(false);
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
          <CategoryDropdown
            options={Object.keys(finishCategories)}
            selectedCategory={selectedCategory}
            handleSelectCategory={handleSelectCategory}
          />
          {!_.isEmpty(attributes) && attributes.map(({name}) => getAttributeInput(name))}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="green"
          disabled={loading || !selectedCategory || _.isEmpty(attributeValues)}
        >
          Save
        </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default AddNewOptionModal;
