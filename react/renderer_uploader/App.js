import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as _ from 'underscore';
import { Label, Grid, Button, Header, Dimmer, Loader } from 'semantic-ui-react';

import ActionCreators from './action_creators';

import StyledDropzone from "../components/StyledDropzone";
import CustomizedDropdown from "./CustomizedDropdown";

const App = () => {
  const projects = useSelector(state => state.projects || []);
  const units = useSelector(state => state.units || []);
  const dispatch = useDispatch();

  const [selectedProject, setSelectedProject] = useState({});
  const [selectedUnit, setSelectedUnit] = useState({});
  const [floorPlanImgUrl, setFloorPlanImgUrl] = useState(null);
  const [skpUrl, setSkpUrl] = useState(null);
  const [screenshotUrls, setScreenshotUrls] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false })
  
  useEffect(() => {
    // load pulls Units and Projects from server --> what's source of truth for unit/project connection?
    // should I filter out Projects that don't have units associated?
    ActionCreators.updateDispatch(dispatch);
    ActionCreators.load();
  }, []);

  const handleSubmit = () => {
    // TO Do - update error system to toast message system
    if (_.isEmpty(selectedProject)) return console.log('project selection required');
    if (_.isEmpty(selectedUnit)) return console.log('unit selection required');
    // TO Do - get all validation requirement specs

    /* 
      WHAT HAPPENS ON SUBMIT --> 
      - send project/unit combo & all images to server (or just skp & floor plan?)
      - controller will add a unit version to the project/unit combo
      - connect skp & floorplan to unit version
      - "For each screenshot version, we will add a screenshot version to the unit." is a screenshot version just one of our screenshotUrls??
      - What do we send back to user? success message? link?
      -- open new tab to unit version target = _blank; clear form
    */
   ActionCreators.submit();
  }


  // TO DO - make onDrops more DRY 
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
          setFloorPlanImgUrl(awsURL)
          setLoading(false);
        },
        () => {
          setMessage({ show: true, message: "Could not complete upload" });
          setLoading(false)
        }
      )
    }
      
    const onError = () => setMessage({ show: true, message: "Could not initiate upload" })
    ActionCreators.presignedURL(file, onSuccess, onError);
  }

  const onDropSKP = (acceptedFiles) => {
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
          setSkpUrl(awsURL)
          setLoading(false);
        },
        () => {
          setMessage({ show: true, message:  "Could not complete upload" });
          setLoading(false)
        }
      )
    }
      
    const onError = () => setMessage({ show: true, message: "Could not initiate upload" });
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
            setLoading(false)
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
      <Header as="h2">Upload Renderings</Header>
        {message.show && <Label basic color={message.color || "red"}>{message.message}</Label>}
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
            {!screenshotUrls.length && <StyledDropzone onDrop={onDropScreenshots} />}
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
            {!skpUrl && <StyledDropzone onDrop={onDropSKP} />}
            {skpUrl && (
              <div className="skp-url">
                  <label>SKP File Url:</label>
                  <a href={skpUrl} target="_blank">{skpUrl}</a>
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Button
        color='blue'
        disabled={_.isEmpty(selectedUnit)}
        style={{ marginTop: '2%', float: 'right' }}
        onClick={handleSubmit}
      >
        Submit
      </Button>
      {loading && <Dimmer active inverted page><Loader /></Dimmer>}
    </main>
  );
}

export default App;
