const m = require("./middleware.js");
const r = require("../util/redirects.js");
const models = require("../models/index.js");

module.exports = (app) => {
  app.get(["/app/dashboard", "/app/dashboard/*","/app/admin/users-panel", "/app/admin/users/:user-id"], m.authUser, (req, res) => {
    // Log out temp user immediately if it exists
    // The logged in user can refresh to get their screen
    if (req.session["tmp_user_id"]) {
      // Logout so it only accesses when it has the query token
      req.session["tmp_user_id"] = null;
      req.user = null
      res.locals.currentUser = null

      // After clearing user, let middleware handle authorization
      return res.redirect(req.url)
    }

    res.render("projects_dashboard");
  });
}
