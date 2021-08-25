const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@pg:5432/mydb')
var models = require("../models/index.js");
const queue = require("lambda-queue"); //TODO: how to import this?

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
      const order = (project.Plans || []).length;
      const plan = await project.createPlan({
        name: documentUrl,
        order,
        uploadedAt: Date.now(),
      });
      
      const document = await plan.createDocument({
        s3Url: documentUrl,
        filename: documentUrl, //TODO: can I get the filename?
        startedPipelineAt: Date.now(),
      });
      
      queue.startSplitPdf({
        's3Key': encodeURIComponent(document.s3Url),
        'objectId': document.uuid
      });

    };
  }

  console.log("Done!");
})();


