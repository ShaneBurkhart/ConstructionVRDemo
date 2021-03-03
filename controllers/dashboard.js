const m = require("./middleware.js");
const r = require("../util/redirects.js");
const models = require("../models/index.js");

module.exports = (app) => {
  app.get(["/dashboard", "/dashboard/*"], m.authUser, (req, res) => {
    res.render("dashboard");
  });
}
