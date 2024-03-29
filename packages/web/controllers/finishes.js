const m = require("./middleware.js");
const r = require("../util/redirects.js");
const models = require("../models/index.js");

const getPermissions = user => ({
  isSuperAdmin: user ? user.isSuperAdmin() : false,
  isEditor: user ? user.isEditor() : false,
})

module.exports = (app) => {
  app.get(["/app/project/:access_token/finishes", "/app/project/:access_token/finishes/*"], async (req, res) => {
    const { access_token } = req.params;
    const { edit_access_token } = req.query;

    try {
      const project = await models.Project.findOne({ where: { accessToken: access_token } });
      if (!project) return res.status(404).send("Project not found");

      // Log out temp user immediately if it exists
      // The logged in user can refresh to get their screen
      if (req.session["tmp_user_id"]) {
        // Logout so it only accesses when it has the query token
        req.session["tmp_user_id"] = null;
        req.user = null
        res.locals.currentUser = null
      }

      // If we have an edit_access_token, check it against the project 
      // And add temp user to the session 
      if (edit_access_token && project.adminAccessToken === edit_access_token) {
        const tmpUser = await models.User.getAnonEditor()
        req.session["tmp_user_id"] = tmpUser.id;
        req.user = tmpUser
        res.locals.currentUser = tmpUser
      }
      
      const isV1 = project.v1;
      const hasRenderings = false;

      const permissions = getPermissions(req.user);
      const isAdmin = permissions.isSuperAdmin || permissions.isEditor;

      if (isV1) {
        // LEGACY APP - SEND TO SERVER.RB
        const finishesPath = `/project/${project.accessToken}/finishes`;
        if (isAdmin) return res.redirect(`/admin/login/${project.adminAccessToken}?redirect_to=${encodeURIComponent(finishesPath)}`);
        return res.redirect(finishesPath);
      };

      const renderingsLink = isAdmin ? `/admin/login/${project.adminAccessToken}` : `/project/${project.accessToken}`;
      const projectName = project.name;

      res.render("project_finishes", { 
        access_token, projectName, permissions, hasRenderings, renderingsLink,
        edit_access_token: project.adminAccessToken,
      });
    } catch (err) {
      console.log(err)
      res.status(422).send("Could not complete request");
    }
  });
}
