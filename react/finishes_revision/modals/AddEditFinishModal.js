import React, { useState, useEffect } from 'react';
import _ from 'underscore';
import { Grid, Dimmer, Loader, Form, Button, Modal } from 'semantic-ui-react';

import useEvent from '../../hooks/useEvent';
import { finishCategories, getAttrList, getAttrGridRows } from '../../../common/constants';
import { CategoryDropdown, PriceInput, DetailsInput, ImagesInput, GeneralInput } from './ModularInputs';

import ActionCreators from '../action_creators';

const AddEditFinishModal = ({ onClose, preselectedCategory='', finishDetails={} }) => {
  const { category='', attributes={}, id=null } = finishDetails;
  
  const [selectedCategory, setSelectedCategory] = useState(preselectedCategory || category);
  const [attrRows, setAttrRows] = useState([]);
  const [attributeValues, setAttributeValues] = useState(attributes);
  const [loading, setLoading] = useState(false);

  const isNew = id === null;

  const onDrop = (acceptedFiles) => {
    const imgArr = attributeValues["Images"] || [];
    if (imgArr.length < 2) {
      (acceptedFiles || []).forEach((file) => {
        setLoading(true);
        ActionCreators.presignedURL(file, (data) => {
          ActionCreators.uploadFile(file, data.presignedURL, () => {
            imgArr.push(data.awsURL);
            setAttributeValues(prev => ({ ...prev, "Images": imgArr }));
            setLoading(false);
          });
        });
      });
    }
  }
  
  const addImageFromClipboard = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blobLikeFile = items[i].getAsFile();
        if (blobLikeFile) {
          onDrop([blobLikeFile])
        }
      }
    }
  }

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.items.length > 0) {
      addImageFromClipboard(e.clipboardData.items)
    }
  }
  
  useEvent('paste', handlePaste);

  const handleSelectCategory = categoryName => {
    setAttrRows([]);
    setSelectedCategory(categoryName);
    const newCategoryObj = finishCategories[categoryName];
    const attrList = (getAttrList(newCategoryObj));
    setAttrRows(getAttrGridRows(attrList));
  }

  useEffect(() => {
    if (selectedCategory) {
      const categoryObj = finishCategories[selectedCategory];
      const attrList = getAttrList(categoryObj);
      setAttrRows(getAttrGridRows(attrList));
    }
  }, []);

  const handleSubmit = () => {
    setLoading(true);
    const finish = {
      id,
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
    if (isNew) return ActionCreators.submitNewFinish(finish, onSuccess, onError);
    return ActionCreators.updateFinish(finish, onSuccess, onError);
  }

  const getAttributeInput = (attrName) => {
    const val = attributeValues[attrName] || '';
    const arrVal = attributeValues[attrName] || [];
    // add Formatter function pass value for price/url/etc, w/ default passing thru
    const onChange = (e, {value}) => setAttributeValues(prev => ({ ...prev, [attrName]: value }));
    const onDeleteImg = (image) => setAttributeValues(prev => ({ ...prev, [attrName]: arrVal.filter(img => img !== image) }));

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
    >
      <Modal.Header>
        {isNew ? "Add New Finish" : "Edit Finish"}
      </Modal.Header>
      <Modal.Content>
        <Form>
          <Grid>
            <Grid.Row style={{ overflow: "visible" }}>
              <Grid.Column width={16}>
                <CategoryDropdown
                  options={Object.keys(finishCategories).sort()}
                  selectedCategory={selectedCategory}
                  handleSelectCategory={handleSelectCategory}
                />
              </Grid.Column>
            </Grid.Row>
            {!_.isEmpty(attrRows) && attrRows.map(row => (
              <Grid.Row key={row.reduce((a,b) => a + b.name, '')}>
                {row.map(attr => (
                  <Grid.Column key={attr.name} width={attr.width}>
                    {getAttributeInput(attr.name)}
                  </Grid.Column>
                ))}
              </Grid.Row>
            ))}
          </Grid>
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

export default AddEditFinishModal;
