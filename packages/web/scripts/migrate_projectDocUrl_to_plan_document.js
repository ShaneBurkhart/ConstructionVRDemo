const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@pg:5432/mydb')
var models = require("../models/index.js");

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

(async () => {
  console.log("Migrating...");

  const projects = await models.Project.findAll({ include: [{ model: models.Plan.scope("active"), required: false }] });
  await wait(1000);

  for (const project of projects) {
    const { documentUrl } = project;
    
    if (documentUrl) {
      const filename = s3Url.substring(str.indexOf("_") + 1);
      const document = await models.Document.create({
        s3Url: documentUrl,
        filename,
        //TODO: filetype (?)
        startedPipelineAt: Date.now(),
      });
      
      const order = (project.Plans || []).length;
      await project.createPlan({
        DocumentId: document.id,
        name: 'Construction Document',
        order,
        uploadedAt: Date.now(),
      });
    };
  }

  console.log("Done!");
})();


