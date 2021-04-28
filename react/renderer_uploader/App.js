import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as _ from 'underscore';
import { Label, Grid, Button, Header, Dimmer, Loader, Progress } from 'semantic-ui-react';

import ActionCreators from './action_creators';

import StyledDropzone from "../components/StyledDropzone";
import CustomizedDropdown from "./CustomizedDropdown";

const App = () => {
  const projects = useSelector(state => state.projects || []);
  const units = useSelector(state => state.units || []);
  const skpUploadProgress = useSelector(state => state.uploadProgress || 0);
  const dispatch = useDispatch();

  const [selectedProject, setSelectedProject] = useState({});
  const [selectedUnit, setSelectedUnit] = useState({});
  const [floorPlanImgUrl, setFloorPlanImgUrl] = useState('');
  const [skpUrl, setSkpUrl] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skpUploading, setSkpUploading] = useState(false);
  const [message, setMessage] = useState({ show: false })
  
  useEffect(() => {
    ActionCreators.updateDispatch(dispatch);
    ActionCreators.load();
  }, []);

  useEffect(() => {
    if (message.show) {
      setTimeout(() => {
        setMessage({ show: false })
      }, 3000);
    }
  }, [message])

  const resetForm = () => {
    setSelectedProject({});
    setSelectedUnit({});
    setFloorPlanImgUrl('');
    setSkpUrl('');
    setScreenshotUrls([]);
    setUnitsList([]);
  }

  const openUnitVersionUrl = newUnitVersionId => {
    if (!newUnitVersionId) return setMessage({ show: true, message: "Hmmm we could not retrieve the redirect url for this new version" })
    const unitVersionUrl = `/project/${selectedProject["Access Token"]}/unit/${selectedUnit["Record ID"]}?version=${newUnitVersionId}`;
    
    // open new browser tab with unitVersionUrl
    var a = document.createElement("a");    
    a.href = unitVersionUrl;   
    a.target = "_blank"; 
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0,true, false, false, false, 0, null);
    a.dispatchEvent(evt);
  }

  const handleSubmit = () => {
    if (_.isEmpty(selectedProject)) setMessage({ show: true, message: 'project selection is required'});
    if (_.isEmpty(selectedUnit)) return setMessage({ show: true, message: 'unit selection is required'});
    setLoading(true);

    const data = {
      unitId: selectedUnit["Record ID"],
      floorPlanImgUrl,
      screenshotUrls,
      skpUrl,
    }
    ActionCreators.submit(
      data,
      (newUnitVersionId) => {
        setMessage({ show: true, color: "green", message: "success" });
        openUnitVersionUrl(newUnitVersionId)
        resetForm();
        setLoading(false);
      },
      () => {
        setMessage({ show: true, message: "uh oh something went wrong" });
        setLoading(false);
      }
    );
  }

  const onDropFloorPlan = (acceptedFiles) => {
    setMessage({});
    if (!acceptedFiles.length) return setMessage({ show: true, message: "Image not received" });
    if (loading) return;

    const file = acceptedFiles[0];

    setLoading(true);

    const onSuccess = ({ presignedURL, awsURL }) => {
      ActionCreators.uploadFile(
        file,
        presignedURL,
        () => {
          setFloorPlanImgUrl(awsURL);
          setLoading(false);
        },
        () => {
          setMessage({ show: true, message: "Could not complete upload" });
          setLoading(false);
        }
      )
    }
      
    const onError = () => setMessage({ show: true, message: "Could not initiate upload" })
    ActionCreators.presignedURL(file, onSuccess, onError);
  }

  const onDropSKP = (acceptedFiles) => {
    setMessage({});
    if (!acceptedFiles.length) return setMessage({ show: true, message: "File not received" });
    if (loading || skpUploading) return;

    const file = acceptedFiles[0];

    setSkpUploading(true);

    const onSuccess = ({ presignedURL, awsURL }) => {
      ActionCreators.uploadLargeFile(
        file,
        presignedURL,
        () => {
          setSkpUrl(awsURL);
          setSkpUploading(false);
        },
        () => {
          setMessage({ show: true, message:  "Could not complete upload" });
          setSkpUploading(false);
        }
      )
    }
      
    const onError = () => {
      setSkpUploading(false);
      setMessage({ show: true, message: "Could not initiate upload" })
    };
    ActionCreators.presignedURL(file, onSuccess, onError);
  }

  const onDropScreenshots = (acceptedFiles) => {
    setMessage({});
    if (!acceptedFiles.length) return setMessage({ show: true, message:  "Image not received" });
    if (loading) return;

    const toLoad = acceptedFiles.length;
    let loaded = 0;
    const newScreenshotUrls = [...screenshotUrls];

    setLoading(true);

    (acceptedFiles || []).forEach((file) => {
      ActionCreators.presignedURL(file, ({ presignedURL, awsURL }) => {
        ActionCreators.uploadFile(
          file,
          presignedURL,
          () => {
            newScreenshotUrls.push(awsURL);
            loaded += 1;
            
            if (loaded === toLoad) {
              setScreenshotUrls(newScreenshotUrls);
              setLoading(false);
            }
          },
          () => {
            setMessage({ show: true, message: "Could not complete upload" });
            setLoading(false);
          }
        ),
        () => setMessage({ show: true, message: "Could not complete upload" })
      });
    })
  }

  const handleSelectProject = projectId => {
    setUnitsList([]);
    setSelectedUnit({});
    setMessage({});
    const project = projects.find(p => p["Record ID"] === projectId);
    if (!project) return setMessage({ show: true, message:  "Something went wrong with this project selection"})
  
    setSelectedProject(project);
    
    const projectUnits = units.filter(u => u["Project"][0] === projectId);
    if (!projectUnits.length) return setMessage({ show: true, message: "This project does not currently have any associated units"});

    return setUnitsList(projectUnits);
  }

  const handleSelectUnit = unitId => {
    setMessage({});
    const unit = units.find(u => u["Record ID"] === unitId);
    if (!unit) return setMessage({ show: true, message: "Something went wrong with this project selection" })
    setSelectedUnit(unit);
  }
  
  return (
    <main className="large-container" id="renderer-uploader__main">
      <div style={{ display: 'flex', minHeight: 45 }}>
        <Header as="h2" style={{ marginRight: "2%" }}>Upload Renderings</Header>
        {message.show && <Label basic color={message.color || "red"}>{message.message}</Label>}
      </div>
        <div className="dropdown-container">
          <div>
            <label>Select a Project</label>
            <CustomizedDropdown
              optionList={projects}
              onChange={(e, {value}) => handleSelectProject(value)}
              value={selectedProject["Name"] || ''}
            />
          </div>
          <div>
            <label>Select a Unit</label>
            <CustomizedDropdown
              optionList={unitsList} 
              onChange={(e, {value}) => handleSelectUnit(value)}
              value={selectedUnit["Name"] || ''}
              disabled={_.isEmpty(selectedProject)}
            />
          </div>
      </div>
      <Grid className="large-container">
        <Grid.Row>
          <Grid.Column>
            <label>Add a Floor Plan - </label>
            (<a onClick={() => setFloorPlanImgUrl('')}>clear</a>)
            {!floorPlanImgUrl && <StyledDropzone onDrop={onDropFloorPlan} />}
            {floorPlanImgUrl && (
              <div className="images-container">
                  <a className="images-container__image" href={floorPlanImgUrl} target="_blank"><img src={floorPlanImgUrl} /></a>
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <label>Add Scene Images - </label>
            (<a onClick={() => setScreenshotUrls([])}>clear</a>)
            <StyledDropzone onDrop={onDropScreenshots} />
            {!!screenshotUrls.length && (
              <div className="images-container">
                {(screenshotUrls || []).map(imgUrl => (
                  <div key={imgUrl} style={{ position: 'relative', height: 300, margin: '1% 0' }}>
                    <a className="images-container__image" href={imgUrl} target="_blank"><img src={imgUrl} /></a>
                    <Button
                      size="small"
                      circular
                      icon="trash"
                      style={{ 
                        position: 'absolute',
                        bottom: 0,
                        right: 15
                      }}
                      onClick={() => setScreenshotUrls(screenshotUrls.filter(image => image !== imgUrl))}
                    />
                  </div>
                ))}
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <label>Add a SKP - </label>
            (<a onClick={() => setSkpUrl('')}>clear</a>)
            {!skpUrl && <StyledDropzone onDrop={onDropSKP} accept={'.skp'} />}
            {skpUrl && (
              <div className="skp-url">
                  <label>SKP File Url:</label>
                  <a href={skpUrl} target="_blank">{skpUrl}</a>
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <div className="button-section" style={{ marginTop: "2%", display: "flex", justifyContent: "space-between" }}>
        <Button
          color="black"
          onClick={resetForm}
        >
          Reset Form
        </Button>
        <Button
          color='blue'
          disabled={_.isEmpty(selectedUnit)}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
      {loading && <Dimmer active inverted page><Loader /></Dimmer>}
      {skpUploading && (
        <Dimmer active inverted page>
          <Progress
            style={{ position: "fixed", width: "80vw", margin: "0 10vw", top: "45vh", left: 0 }}
            label="uploading..."
            color="green"
            size="medium"
            percent={skpUploadProgress}
            precision={0}
            active
          />
        </Dimmer>)
      }
    </main>
  );
}

export default App;
