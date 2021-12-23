import React, { useState } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { getSession, useSession, signIn, signOut } from "next-auth/react"

import ProjectGrid from '../components/ProjectGrid';

import styles from '../styles/Home.module.css'


import ToastMessage from '../components/ToastMessage';
// import CreateProjectModal from './CreateProjectModal';
// import CopyProjectModal from './CopyProjectModal';
// import ConfirmModal from './ConfirmModal';


export default function App({ projects }) {
  const allProjects = projects || []
  const [message, setMessage] = useState({ show: false });
  const [projectToCopy, setProjectToCopy] = useState({});
  const [confirmProject, setConfirmProject] = useState({});
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCopyProjectModal, setShowCopyProjectModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleShowCreateProjectModal = () => setShowCreateProjectModal(!showCreateProjectModal);
  const toggleShowCopyProjectModal = () => setShowCopyProjectModal(!showCopyProjectModal);
  const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal);

  const onSuccess = (result) => setMessage({ show: true, message: result.message, positive: true });
  const onError = (result) => setMessage({ show: true, message: result.message, positive: false });

  const handleCreateNew = (name) => ActionCreators.addNewProject(name, onSuccess, onError); 
  const handleCopy = (newName) => ActionCreators.copyProject({ name: newName, id: projectToCopy.id }, onSuccess, onError);
  const handleToggleArchive = () => ActionCreators.toggleArchiveProject(confirmProject.id, onSuccess, onError);
  
  const openCopyModal = (id, name)=> {
    setProjectToCopy({id, name});
    toggleShowCopyProjectModal();
  }

  const openConfirmModal = (id, name, type) => {
    const modalMessage = type === "archive" ? `Archive '${name}'?` : `Reactivate '${name}'?`

    setConfirmModalMessage(modalMessage);
    setConfirmProject({id, name});
    toggleShowConfirmModal();
  }

  const updateSeenAt = (id) => ActionCreators.updateSeenAt(id)
  
  const filterProjects = (filter) => {
    switch (filter) {
      case 'recent':
        return allProjects
          .filter(p => !p.archived && p.last_seen_at)
          .sort((a,b) => a.last_seen_at > b.last_seen_at ? -1 : 1)
          .slice(0,5)
      case 'active':
        return allProjects.filter(p => !p.archived).sort((a,b) => a.name > b.name ? 1 : -1);
      case 'archived':
        return allProjects.filter(p => p.archived).sort((a,b) => a.name > b.name ? 1 : -1);
      default:
        return allProjects
    }
  }

  return (
    <main className={styles.main}>
      <Head>
        <title>App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="column">
          <ProjectGrid
            title={"Recently Viewed Projects"}
            projects={filterProjects('recent')}
            className="mt-6"
          />
          <ProjectGrid
            title={"Active Projects"}
            projects={filterProjects('active')}
            search
            className="mt-12"
          />
          <ProjectGrid
            title={"Archived Projects"}
            projects={filterProjects('archived')}
            archived
            className="mt-12"
          />
        </div>

        {showCreateProjectModal && <CreateProjectModal onSubmit={handleCreateNew} onClose={toggleShowCreateProjectModal} />}
        {showCopyProjectModal && (
          <CopyProjectModal
            onSubmit={handleCopy}
            projectToCopy={projectToCopy}
            setProjectToCopy={setProjectToCopy}
            onClose={toggleShowCopyProjectModal}
          />
        )}
        {showConfirmModal && (
          <ConfirmModal
            onSubmit={handleToggleArchive}
            project={confirmProject}
            modalMessage={confirmModalMessage}
            setConfirmProject={setConfirmProject}
            onClose={toggleShowConfirmModal}
          />
        )}
      </div>
      <ToastMessage message={message.message} positive={message.positive} />
    </main>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context)

  // TODO get all projects

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: { session, projects: [
      {
        id: 1,
        name: 'Project 1',
        archived: false,
      },
      {
        id: 2,
        name: 'Project 2',
        archived: false,
      }
    ] }
  }
}