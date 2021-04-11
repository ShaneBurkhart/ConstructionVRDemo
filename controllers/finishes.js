const m = require("./middleware.js");
const r = require("../util/redirects.js");
const models = require("../models/index.js");

const Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY });
const base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

const getPermissions = user => ({
  isSuperAdmin: user ? user.isSuperAdmin() : false,
  isEditor: user ? user.isEditor() : false,
})

module.exports = (app) => {
  app.get("/app/project/:access_token/finishes", async (req, res) => {
    const { access_token } = req.params;

    try {
      const project = await models.Project.findOne({ where: { accessToken: access_token } });
      if (!project) return res.status(404).send("Project not found");
      
      const getRecordIdAndVersion = new Promise((resolve, reject) => {
        base('projects').select({
          maxRecords: 1,
          filterByFormula: `{Access Token} = "${project.accessToken}"`
        }).eachPage(function page(records, _fetchNextPage){
          resolve({
            recordId: records[0].fields["Record ID"],
            isV1: records[0].fields["Is V1?"]
          });
        }, function done(err){
          if (err) reject("Could not find resource");
        })
      });

      const { recordId, isV1 } = await getRecordIdAndVersion;
      if (!recordId) return res.status(422).send("Could not locate resource");

      const getProjectHasRenderings = new Promise((resolve, reject) => {
        base('units').select({
          maxRecords: 1,
          filterByFormula: `{Project ID} = "${recordId}"`
        }).eachPage(function page(records, _fetchNextPage){
          resolve(!!records.length);
        }, function done(err){
          if (err) reject("Could not find resources");
        })
      });

      const hasRenderings = await getProjectHasRenderings;

      const permissions = getPermissions(req.user);
      const isAdmin = permissions.isSuperAdmin || permissions.isEditor;

      if (isV1) {
        // LEGACY APP - SEND TO SERVER.RB
        if (isAdmin) return res.redirect(`/admin/login/${project.adminAccessToken}`);
        return res.redirect(`/project/${project.accessToken}/finishes`);
      };

      const renderingsLink = isAdmin ? `/admin/login/${project.adminAccessToken}` : `/project/${project.accessToken}`;
      const projectName = project.name;
      
      res.render("project_finishes", { access_token, projectName, permissions, hasRenderings, renderingsLink }); // add hasRenderings to globals, redirect url (admin login), 
    } catch (err) {
      console.log({err});
      res.status(422).send("Could not complete request")
    }
  });
}
