const m = require("./middleware.js");
const r = require("../util/redirects.js");
const models = require("../models/index.js");


module.exports = (app) => {
  app.get("/admin", m.authSuperAdmin, (req, res) => {
    res.render("admin");
  });

  app.post("/admin", m.authSuperAdmin, (req, res) => {
    const adminPassword = req.body.admin_password;
    const password = req.body.password;

    models.AdminPassword.findAll().then(async (rows) => {
      // Find user with password included
      const user = await models.User.scope("withPassword").findOne({ where: { id: req.user.id } });

      if (!models.AdminPassword.validatePassword(adminPassword)) {
        return res.render("admin", { error: "Invalid admin password" });
      }
      // Password doesn't match the old password
      if (!user.comparePassword(password)) {
        return res.render("account", { error: "Your account password doesn't match" });
      }

      let m = rows[0];

      if (!m) {
        m = new models.AdminPassword();
      }

      m.updatePassword(adminPassword);

      await m.save();

      res.redirect(r.DASHBOARD);
    })
  });

  app.get("/account", m.authUser, (req, res) => {
    res.render("account");
  });

  app.post("/account", m.authUser, (req, res) => {
    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;
    let emailList = req.body.notification_emails || [];

    models.User.scope("withPassword").findOne({ where: { id: req.user.id } }).then(async (user) => {
      if (newPassword && !models.User.validatePassword(newPassword)) {
        return res.render("account", { error: "Invalid password" });
      }
      // Password doesn't match the old password
      if (newPassword && !user.comparePassword(oldPassword)) {
        return res.render("account", { error: "Old password doesn't match" });
      }

      if (newPassword) {
        user.updatePassword(newPassword);
      }

      /* 
        when one email is checked it will come thru req.body as a string, 
        multiple checked emails will come thru as array
      */
      let notificationEmails = emailList;
      if (typeof emailList !== 'string') notificationEmails = emailList.join(',');

      user.update({
        notificationEmails
      });

      await user.save();

      res.redirect(r.DASHBOARD);
    });
  });

  app.get("/account/user", m.authUser, async (req, res) => {
    const userId = req.session["user_id"]
    const user = await models.User.findOne({ where: { id: userId } });
    const { notificationEmails, email } = user;
    res.json({ notificationEmails, email });
  });

  app.get("/api2/hi", (req, res) => {
    console.log('hiiiii')
  })

  app.get("/api2/invite-user-link/:token", (req, res) => {
    console.log('ok -- invitssssssse user222s')
    const token = req.params.token;

    models.User.scope("withTokens").findOne({ where: { emailSignupToken: token } }).then(user => {
      if (user.activated) {
        return res.redirect(r.SIGN_IN_URL);
      }

      if (!user || user.isEmailSignupExpired()) {
        return res.render("expired");
      }
      
      res.render("invite_user_link", { user });
    });
  });

  app.post("/api2/invite-user-link", m.goToDashboardIfSignedIn, (req, res) => {
    const emailSignupToken = req.body.email_signup_token;
    const password = req.body.password;

    models.User.scope("withTokens").findOne({ where: { emailSignupToken } }).then(async (user) => {
      if (user.activated) {
        return res.redirect(r.SIGN_IN_URL);
      }

      if (!user || user.isEmailSignupExpired()) {
        return res.render("expired");
      }

      if (!models.User.validatePassword(password)) {
        return res.render("invite_user_link", { user: user, err: "Password length must be >= 8" });
      }

      user.updatePassword(password);
      user.activated = true

      await user.save();

      req.session["user_id"] = user.id;

      res.redirect(r.DASHBOARD);
    });
  })
}
