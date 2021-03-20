import React, { useState, useEffect } from 'react';
import _ from 'underscore';
import { Label, Popup, Input, Grid, Dimmer, Loader, Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react';

import { finishCategories, getAttrList, getAttrGridRows } from '../../../common/constants';
import { CategoryDropdown, PriceInput, DetailsInput, ImagesInput, GeneralInput } from './ModularInputs';

import ActionCreators from '../action_creators';
import './AddNewOptionModal.css';


const EditFinishModal = ({ onClose, finishDetails: { category, orderNumber, attributes} }) => {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [attrRows, setAttrRows] = useState([]);
  const [attributeValues, setAttributeValues] = useState(attributes);
  const [loading, setLoading] = useState(false);

  const handleSelectCategory = categoryName => {
    setAttrRows([]);
    setSelectedCategory(categoryName);
    const newCategory = finishCategories[categoryName];
    setAttrRows(getAttrList(newCategory));
  }

  useEffect(() => {
    const categoryObj = finishCategories[category];
    const attrList = getAttrList(categoryObj);
    setAttrRows(getAttrGridRows(attrList));
  }, []);

  const handleSubmit = () => {
    console.log('ok')
    // setLoading(true);
    // const newFinish = {
    //   category: selectedCategory,
    //   attributes: attributeValues,
    // }
    // const onSuccess = () => {
    //   setLoading(false);
    //   onClose();
    // };
    // const onError = () => {
    //   setLoading(false);
    //   alert('something went wrong');
    // }
    // ActionCreators.submit(newFinish, onSuccess, onError);
  }

  const resetForm = () => {
    setAttrRows([]);
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
        Edit Finish
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
              <Grid.Row key={row.reduce((a,b) => a + b.name, '')} columns={row.length}>
                {row.map((attr, i) => (
                  <Grid.Column key={attr.name}>
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

export default EditFinishModal;
