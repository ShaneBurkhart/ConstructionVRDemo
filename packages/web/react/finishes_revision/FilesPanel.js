import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Icon, Table, Grid, Header } from 'semantic-ui-react';

import ProjectDocumentModal from './modals/ProjectDocumentModal';

import styles from "./FilesPanel.module.css";


const FilesPanel = (props) => {
  const adminMode = IS_SUPER_ADMIN || IS_EDITOR;
  const projectDocUrl = useSelector(state => state.projectDocUrl);

  const [showDocModal, setShowDocModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleDocModal = () => setShowDocModal(!showDocModal);
  
  const fakeDocs = new Array(9).fill({ url: projectDocUrl, createdAt: Date.now() })
  return (
    <>
      <section className="xlarge-container">
        <div className={`${styles.documentLinkContainer} no-print`}>
          {projectDocUrl && (
            <>
              <a href={projectDocUrl} target="_blank" title="open the documents" style={{ cursor: 'pointer' }}>
                Construction Documents
              </a>
              {adminMode && (
                <a onClick={toggleDocModal} title="edit documents" className={styles.editCurrentIcon}>
                  <Icon name="cloud upload" />
                </a>
              )}
            </>
          )}
          {!projectDocUrl && adminMode && (
            <a onClick={toggleDocModal} title="click to add documents" style={{ cursor: 'pointer', display: 'flex', width: '100%' }}>
              <span style={{ marginRight: '5%' }}>Upload document</span>
              <Icon name="cloud upload" />
            </a>
          )}
        </div>
        <Grid>
          <Grid.Column width={8}>
              <Header as='h2'>Documents History</Header>
          </Grid.Column>
        </Grid>
        <Table className="celled">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={10}>Document</Table.HeaderCell>
              <Table.HeaderCell>Uploaded</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fakeDocs.map(({ url, createdAt }, i) => (
              <tr className="project-row" key={i}>
                <td>
                    <a target="_blank" href={url}>Open Document</a>
                </td>
                <td>
                    <span>{createdAt}</span>
                </td>
              </tr>
            ))}
          </Table.Body>
        </Table>
      </section>
      {showDocModal && <ProjectDocumentModal onClose={toggleDocModal} docUrl={projectDocUrl} />}
    </>
  );
}

export default FilesPanel;
