import React from 'react';

const App = () => {
  const allProjects = PROJECTS;
  return (
    <main className="container">
      <h2>Projects</h2>
      {allProjects.map(project => (
        <div className="project-row" key={project['Record ID']}>
          <a href={`/admin/login/${project["Admin Access Token"]}`}>{project['Name']}</a>
          {/* <button>Copy</button> */}
        </div>
      ))}
    </main>
  );
}

export default App;
