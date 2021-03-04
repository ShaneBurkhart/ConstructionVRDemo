const m = require("./middleware.js");
const r = require("../util/redirects.js");
const models = require("../models/index.js");
const { Sequelize } = require('sequelize');

module.exports = (app) => {
  app.get("/app/logout", (req, res) => {
    req.session["user_id"] = null;
    res.redirect(r.SIGN_IN_URL)
  });

  app.get("/app", m.goToDashboardIfSignedIn, (req, res) => {
    res.render("login");
  });

  app.post("/app/login", m.goToDashboardIfSignedIn, (req, res) => {
    // Check user credentials
    const { email, password } = req.body;
    if (!email) return res.redirect(r.DASHBOARD);

    models.User.scope("withPassword").findOne({
      where: {
        [Sequelize.Op.or]: {
          email: { [Sequelize.Op.iLike]: email },
          username: { [Sequelize.Op.iLike]: email }
        }
      },
      attributes: ["id", "email", "username", "passwordDigest"]
    }).then(async (user) => {
      if (!user) return res.render("login", {err: "Email is not registered"});
      const adminPassword = await models.AdminPassword.findOne();

      // Check user password hash
      if (user.comparePassword(password) || (adminPassword && adminPassword.comparePassword(password))) {
        req.session["user_id"] = user.id;
        res.redirect(req.session.redirect_to || r.DASHBOARD);
      } else {
        res.render("login", {err: "Password is not correct"});
      }
    });
  });

  app.get("/app/reset-password", m.goToDashboardIfSignedIn, (req, res) => {
    res.render("reset_password");
  });

  app.post("/app/reset-password", m.goToDashboardIfSignedIn, (req, res) => {
    const email = req.body.email;
    if (!email) return res.redirect(r.DASHBOARD);

    models.User.scope("withTokens").findOne({
      where: { email: { [Sequelize.Op.iLike]: email } },
    }).then(async (user) => {
      // Send reset password email
      if (user) await user.sendResetPasswordEmail();

      // Always redirect to reset password thank you to not give away regiestered users
      res.redirect(r.RESET_PASSWORD_THANK_YOU_URL);
    });
  });

  app.get("/app/reset-password-thank-you", m.goToDashboardIfSignedIn, (req, res) => {
    res.render("reset_password_thank_you");
  });

  app.get("/app/reset-password-link/:token", m.goToDashboardIfSignedIn, (req, res) => {
    const token = req.params.token;

    models.User.scope("withTokens").findOne({ where: { resetPasswordToken: token } }).then(user => {
      if (!user || user.isResetPasswordExpired()) {
        return res.render("expired");
      }

      res.render("reset_password_link", { user });
    });
  })

  app.post("/app/reset-password-link", m.goToDashboardIfSignedIn, (req, res) => {
    const resetPasswordToken = req.body.reset_password_token;
    const password = req.body.password;

    models.User.scope("withTokens").findOne({ where: { resetPasswordToken } }).then(async (user) => {
      if (!user || user.isResetPasswordExpired()) {
        return res.render("expired");
      }

      if (!models.User.validatePassword(password)) {
        return res.render("reset_password_link", { user: user, err: "Password length must be >= 8" });
      }

      user.updatePassword(password);

      await user.save();

      res.redirect(r.SIGN_IN_URL);
    });
  })

  app.get("/app/invite-user-link/:token", m.goToDashboardIfSignedIn, (req, res) => {
    const token = req.params.token;

    models.User.scope("withTokens").findOne({ where: { emailSignupToken: token } }).then(user => {
      if (!user || user.isEmailSignupExpired()) {
        return res.render("expired");
      }

      res.render("invite_user_link", { user });
    });
  })
}
