var r = require("../util/redirects.js");
var models = require("../models/index.js");
// var pugHelpers = require("../util/pug.js");

// const redis = require('redis');
// let redisClient = redis.createClient(6379, "redis");

const Middleware = {
  // addPugHelpers: function addPugHelpers(req, res, next) {
  //   res.locals.helpers = pugHelpers;
  //   res.locals.r = r;

  //   redisClient.get("lastSynced", (err, data) => {
  //     console.log("Last Synced:", data);
  //     res.locals.lastSynced = Date.parse(data);
  //     next();
  //     if (!data) redisClient.set("lastSynced", new Date(new Date() - 5*60*1000), _=>{});
  //   });
  // },

  addUserToRequest: function addUserToRequest(req, res, next) {
    const userId = req.session["user_id"];

    if (userId) {
      models.User.findOne({
        where: { id: userId },
      }).then(user => {
        if (user) {
          req.user = user;
          res.locals.currentUser = user;
        }
        next();
      });
    } else {
      next();
    }
  },

  authUser: function authUser(req, res, next) {
    console.log(`m.authUser - ${req.user}`)
    if (!req.user) {
      req.session['redirect_to'] = req.originalUrl;
      return res.redirect(r.SIGN_IN_URL)
    };
    next();
  },

  goToDashboardIfSignedIn: function goToDashboardIfSignedIn(req, res, next) {
    console.log(`m.goToDashIFSI ${req.user}`)
    if (req.user) return res.redirect("/app/dashboard");
    next();
  }
};

Middleware["authAdmin"] = (req, res, next) => {
  console.log(`m.authAdmin - ${req.user} - ${req.user.role}`)
  if (!req.user) return res.redirect(r.SIGN_IN_URL);
  if (req.user.role !== "admin") {
    return res.redirect("/app/dashboard");
  }
  next();
};


(models.User.rawAttributes.role.values || []).forEach(role => {
  const camelCase = "auth" + role.split(" ").map(t=>(t.charAt(0).toUpperCase() + t.slice(1))).join("");

  Middleware[camelCase] = (req, res, next) => {
    if (!req.user) return res.redirect(r.SIGN_IN_URL);
    if (req.user.role !== role) return res.redirect("/app/dashboard");
    next();
  };
});

module.exports = Middleware;
