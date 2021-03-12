import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as _ from 'underscore';
import { Label, Popup, Input, Grid, Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react';

import ActionCreators from './action_creators';

import StyledDropzone from "../components/StyledDropzone";
import CustomizedDropdown from "./CustomizedDropdown";


const onDrop = (acceptedFiles) => {
  const { optionFields } = this.state;
  if ((optionFields.Images || []).length >= 2) return;

  (acceptedFiles || []).forEach(file => {
    ActionCreators.presignedURL(file, (data) => {
      ActionCreators.uploadFile(file, data.presignedURL, () => {
        const newFields = _.clone(this.state.optionFields);
        const newImages = Array.from(newFields.Images || []);

        newImages.push({ url: data.awsURL });
        newFields.Images = newImages;

        this.setState({ optionFields: newFields });
      });
    });
  });
}

const App = () => {
  const projects = useSelector(state => state.projects || []);
  const units = useSelector(state => state.units || []);
  const dispatch = useDispatch();

  const [selectedProject, setSelectedProject] = useState({});
  const [selectedUnit, setSelectedUnit] = useState({});
  const [unitsList, setUnitsList] = useState([]);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    ActionCreators.updateDispatch(dispatch);
    ActionCreators.load();
  }, []);

  const handleSelectProject = projectId => {
    setUnitsList([]);
    setErrors({});
    
    const project = projects.find(p => p["Record ID"] === projectId);
    
    if (!project) return setErrors({ project: "Something went wrong with this project selection"})
  
    setSelectedProject(project);
    
    const projectUnits = units.filter(u => u["Project"][0] === projectId);
    if (!projectUnits.length) return setErrors({project: "This project does not currently have any associated units"});

    return setUnitsList(projectUnits);
  }

  const handleSelectUnit = unitId => {
    setErrors({});
    const unit = units.find(u => u["Record ID"] === unitId);
    if (!unit) return setErrors({unit: "Something went wrong with this project selection"})
    setSelectedUnit(unit);
  }
  
  return (
    <main className="xlarge-container" id="renderer-uploader__main">
      <Header as="h2">Upload Renderings</Header>
      {errors.project && <Label color="red">{errors.project}</Label>}
        <div className="dropdown-container">
          <div>
            <label>Select a Project</label>
            {errors.project && <Label color="red">{errors.project}</Label>}
            <CustomizedDropdown
              optionList={projects}
              onChange={(e, {value}) => handleSelectProject(value)}
              value={selectedProject["Name"] || ''}
            />
          </div>
          <div>
            <label>Select a Unit</label>
            {errors.unit && <Label color="red">{errors.unit}</Label>}
            <CustomizedDropdown
              optionList={unitsList} 
              onChange={(e, {value}) => handleSelectUnit(value)}
              value={selectedUnit["Name"] || ''}
              disabled={_.isEmpty(selectedProject)}
            />
          </div>
      </div>
      <Grid>
        <Grid.Row>
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
                value="linkupload"
                // onChange={this.onChangeLink}
                action={{
                  icon: "upload",
                  content: "Upload",
                  onClick: () => console.log('hi'),
                }}
              />
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </main>
  );
}

export default App;
