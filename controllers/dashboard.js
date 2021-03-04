const m = require("./middleware.js");
const r = require("../util/redirects.js");
const models = require("../models/index.js");

module.exports = (app) => {
  app.get(["/app/dashboard", "/app/dashboard/*"], m.authUser, (req, res) => {
    res.render("projects_dashboard");
  });
}
