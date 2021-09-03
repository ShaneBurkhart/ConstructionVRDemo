import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import _ from 'underscore';
import { Grid, Dimmer, Loader, Form, Button, Modal, Input, Popup, Checkbox } from 'semantic-ui-react';

import useEvent from '../../hooks/useEvent';
import { finishCategoriesMap, getAttrGridRows, attrMap } from '../../../common/constants.js';
import { CategoryDropdown, PriceInput, DetailsInput, ImagesInput, GeneralInput, DocumentInput } from './ModularInputs';

import ActionCreators from '../action_creators';

import styles from './AddEditFinishModal.module.css';

const AddEditFinishModal = ({ onClose, preselectedCategory='', finishDetails={} }) => {
  const { attributes={}, id=null } = finishDetails;
  const finishLibrary = useSelector(state => state.finishLibrary);
  
  const initCategory = preselectedCategory || '';
  const initAttrList = (initCategory) ? finishCategoriesMap[initCategory].attr : [];
  const initAttrGridRows = getAttrGridRows(initAttrList) || [];
  
  const [selectedCategory, setSelectedCategory] = useState(initCategory);
  const [attrRows, setAttrRows] = useState(initAttrGridRows);
  const [isLibraryView, setIsLibraryView] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [attributeValues, setAttributeValues] = useState(attributes);
  const [attributeValueErrors, setAttributeValueErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isNew = id === null;

  const handleSearch = (_e, {value}) => {
    setLibraryLoading(true);
    setSearchQuery(value);
    const onSuccess = () => setLibraryLoading(false);
    const onError = () => setLibraryLoading(false);
    const debounceSearch = _.debounce((q) => {
      ActionCreators.searchFinishLibrary(q, {category: selectedCategory, includeArchived }, onSuccess, onError);
    }, 500);
    debounceSearch(value);
  }

  const handleSetLibraryView = () => {
    setIsLibraryView(true);
    handleSearch(null, ({ value: '' }));
  }

  const onDropDocument = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    if (loading) return;
    if (acceptedFiles.length > 1) acceptedFiles.length = 1;
    
    if (!attributeValues["Document"]) {
      setLoading(true);
      ActionCreators.presignedURL(
        acceptedFiles[0],
        (data) => {
          ActionCreators.uploadFile(
            acceptedFiles[0],
            data.presignedURL,
            () => {
              setAttributeValues(prev => ({ ...prev, "Document": data.awsURL }));
              setLoading(false);
            },
            () => setLoading(false),
          );
        },
        () => setLoading(false),
      );
    }
  }

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    if (loading) return;
    const imgArr = attributeValues["Images"] || [];
    const spaceRemaining = 2 - imgArr.length; // max 2 images
    if (!spaceRemaining > 0) return;
    if (acceptedFiles.length > spaceRemaining) acceptedFiles.length = spaceRemaining;
    
    let toLoad = acceptedFiles.length > spaceRemaining ? spaceRemaining : acceptedFiles.length;
    
    (acceptedFiles || []).forEach((file, i) => {
      if (imgArr.length < 2) {
        setLoading(true);
        ActionCreators.presignedURL(
          file,
          (data) => {
            ActionCreators.uploadFile(
              file,
              data.presignedURL,
              () => {
                imgArr.push(data.awsURL);
                setAttributeValues(prev => ({ ...prev, "Images": imgArr }));
                toLoad -= 1;
                if (!toLoad) setLoading(false);
              },
              () => setLoading(false),
            );
          },
          () => setLoading(false),
        );
      }
    });
  }
  
  const addImageFromClipboard = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blobLikeFile = items[i].getAsFile();
        if (blobLikeFile) onDrop([blobLikeFile])
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
    if (!isNew) return;
    setAttrRows([]);
    setSelectedCategory(categoryName);
    const attrList = finishCategoriesMap[categoryName].attr;
    setAttrRows(getAttrGridRows(attrList));
    if (isLibraryView) {
      setLibraryLoading(true);
      const cb = () => setLibraryLoading(false);
      ActionCreators.searchFinishLibrary(searchQuery, {category: categoryName, includeArchived}, cb, cb)
    };
  }

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
      onClose();
    }
    if (isNew) return ActionCreators.submitNewFinish(finish, onSuccess, onError);
    return ActionCreators.updateFinish(finish, onSuccess, onError);
  }

  const getAttributeInput = (attrName) => {
    const val = attributeValues[attrName] || '';
    const arrVal = attributeValues[attrName] || [];
    
    const onChange = (e, {value}) => {
      if (attributeValueErrors[attrName] && attrMap[attrName].validate(attributeValues[attrName])){
        setAttributeValueErrors(prev => ({ ...prev, [attrName]: false }));
      } 
      setAttributeValues(prev => ({ ...prev, [attrName]: value }))
    };
    
    const onBlur = () => {
      if (!attrMap[attrName].validate(attributeValues[attrName])) {
        setAttributeValueErrors(prev => ({ ...prev, [attrName]: true }))
      } else {
        setAttributeValueErrors(prev => ({ ...prev, [attrName]: false }))
      };
    }
    
    const onDeleteImg = (image) => setAttributeValues(prev => ({ ...prev, [attrName]: arrVal.filter(img => img !== image) }));
    const onDeleteVal = () => setAttributeValues(prev => ({ ...prev, [attrName]: '' }))

    const onImgLinkUpload = (imgUrl) => {
      setLoading(true)
      ActionCreators.uploadFromUrl(
        imgUrl,
        (awsURL) => {
          arrVal.push(awsURL);
          setAttributeValues(prev => ({ ...prev, [attrName]: arrVal }));
          setLoading(false)
        },
        (error) => { setLoading(false) }
      );
    }

    const switchImgOrder = () => {
      const [ img1, img2 ] = arrVal;
      if (img1 && img2) setAttributeValues(prev => ({ ...prev, "Images": [ img2, img1 ]}))
    }

    const attrInputMap = {
      "Price":  <PriceInput key={attrName} value={val} onChange={onChange} onBlur={onBlur} error={attributeValueErrors[attrName]} />,
      "Details":  <DetailsInput key={attrName} value={val} onChange={onChange} onBlur={onBlur} error={attributeValueErrors[attrName]} />,
      "Images": <ImagesInput key={attrName} images={arrVal} onDelete={onDeleteImg} onDrop={onDrop} onImgLinkUpload={onImgLinkUpload} onBlur={onBlur} error={attributeValueErrors[attrName]} onSwitchImgOrder={switchImgOrder} />,
      "Document": <DocumentInput key={attrName} docURL={val} onDrop={onDropDocument} onChange={onChange} onDelete={onDeleteVal} onBlur={onBlur} error={attributeValueErrors[attrName]} />,
      default: <GeneralInput key={attrName} label={attrName} value={val} onChange={onChange} onBlur={onBlur} error={attributeValueErrors[attrName]} />,
    }
    const attrInput = attrInputMap[attrName] ? attrInputMap[attrName] : attrInputMap.default;
    return attrInput;
  }

  const filteredCategoryAttributes = selectedCategory && finishCategoriesMap[selectedCategory].attr.filter(a => !attrMap[a].excludeFromLibraryDetails);

  const getDisplayName = (libraryObj) => {
    const attrList = (finishCategoriesMap[selectedCategory] || {}).attr || [];
    return attrList
      .filter(a => libraryObj[a] && !attrMap[a].excludeFromName)
      .map(a => libraryObj[a])
      .join(", ");
  }

  return (
    <Modal
      closeIcon
      closeOnDimmerClick={false}
      open={true}
      onClose={onClose}
    >
      <Modal.Header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{isNew ? "Add New Finish" : "Edit Finish"}</span>
        <Button
          onClick={handleSubmit}
          color="green"
          disabled={loading || !selectedCategory || _.isEmpty(attributeValues) || Object.values(attributeValueErrors).includes(true)}
        >
          Save
        </Button>
      </Modal.Header>
      <Modal.Content>
        <Form>
          <Grid>
            {isLibraryView && (
              <div>
                <p className="max-w-md my-3 text-base text-gray-800 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Search finishes from all projects
                </p>
                <Checkbox className="block" label="Include archived projects" checked={includeArchived} onChange={() => setIncludeArchived(!includeArchived)} />
              </div>
            )}
            <Grid.Row style={{ overflow: "visible" }}>
              <Grid.Column width={16}>
                <CategoryDropdown
                  disabled={!isNew}
                  options={Object.keys(finishCategoriesMap).sort()}
                  selectedCategory={selectedCategory}
                  handleSelectCategory={handleSelectCategory}
                />
              </Grid.Column>
            </Grid.Row>

            {!isLibraryView && selectedCategory && 
              <Grid.Row>
                <Grid.Column>
                  {!_.isEmpty(attributeValues) && <Popup
                      on="click"
                      onClose={e => e.stopPropagation()}
                      content={
                        <div>
                          <p className="bold">Are you sure? Your current values may be overwritten</p>
                          <Button color="green" onClick={handleSetLibraryView}>Continue to Library</Button>
                        </div>
                      }
                      trigger={<Button color="blue">Fill from library</Button>}
                    />}
                  {_.isEmpty(attributeValues) && <Button color="blue" onClick={handleSetLibraryView}>Fill from library</Button>}
                </Grid.Column>
              </Grid.Row>
            }
            {isLibraryView && 
              <section className={styles.libraryView}>
                <Input placeholder='Search...' onChange={handleSearch} value={searchQuery}>
                  <input autoFocus />
                </Input>
                <Button style={{ marginLeft: 10 }} onClick={() => setIsLibraryView(false)}>Cancel</Button>
                <div className={styles.searchResults}>
                  {(finishLibrary || []).map(f => (
                      <Grid.Row key={Object.values(f).join("")}>
                        <article
                          className={styles.finishCard}
                          onClick={() => {
                            setAttributeValues(f);
                            setIsLibraryView(false);
                          }}
                        >
                          <div className={styles.finishCardLeft}>
                            <div className={styles.cardName}>
                              <span>
                                {getDisplayName(f)}
                              </span>
                            </div>
                            {(filteredCategoryAttributes || []).map(a => (
                              <div key={a} className={styles.finishCardAttrRow}>
                                <div className={styles.attrLabel}>{a}:</div>
                                <div className={styles.attrVal}>{f[a] || ''}</div>
                              </div>
                            ))}
                          </div>
                          <div className={styles.finishCardRight}>
                            {(f["Images"] || []).map(imgUrl => (
                              <img key={imgUrl} src={imgUrl} className={styles.thumbnail}/>
                            ))}
                          </div>
                        </article>
                      </Grid.Row>
                  ))}
                  {!finishLibrary.length && searchQuery && <div>No results...</div> }
                  {libraryLoading && <Dimmer active inverted><Loader /></Dimmer>}
                </div>
              </section>
            }
            {!isLibraryView && !_.isEmpty(attrRows) && attrRows.map(row => (
              <Grid.Row key={row.join("")}>
                {row.map(attr => (
                  <Grid.Column key={attr} width={attrMap[attr].width}>
                    {getAttributeInput(attr)}
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
          disabled={loading || !selectedCategory || _.isEmpty(attributeValues) || Object.values(attributeValueErrors).includes(true)}
        >
          Save
        </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default AddEditFinishModal;
