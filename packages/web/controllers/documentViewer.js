const m = require("./middleware.js");
const r = require("../util/redirects.js");
const models = require("../models/index.js");

module.exports = (app) => {
  app.get(["/app/document", "/app/document/*"], (req, res) => {
    res.render("document_viewer");
  });
}
