const { Sequelize, Op } = require('sequelize');
const m = require("../middleware.js");
const models = require("../../models/index.js");

module.exports = (app) => {
  app.get("/api2/admin/users", m.authSuperAdmin, async (req, res) => {
    const users = await models.User.findAll();
    const roles = models.User.rawAttributes.role.values;

    const projectsAllInfo = await models.Project.findAll({ where: { accessToken: { [Op.not]: null } } });
    // here we are obscuring token names from adminAccessToken to href
    const projects = projectsAllInfo.map(({ id, name, adminAccessToken, accessToken, archived, last_seen_at }) => ({ id, name, href: adminAccessToken, accessToken, archived, last_seen_at }))
    res.json({ users, roles, projects });
  });

  app.post("/api2/admin/invite-user",  m.authSuperAdmin, async (req, res) => {
    if (!models.User.validateEmail(req.body.email)) {
      return res.status(422).json({ msg: "Wrong email" })
    }

    let user = await models.User.findOne({ 
      where: { 
        [Sequelize.Op.or]: {
          email: { [Sequelize.Op.iLike]: req.body.email },
          username: { [Sequelize.Op.iLike]: req.body.username } 
        }
      }, paranoid: false 
    });

    if (user) {
      if (user.deletedAt !== null) {
        await user.restore()
      } else {
        return res.status(422).json({ msg: "User exists" })
      }
    } else {
      user = await models.User.create({ 
        username: req.body.username, 
        email: req.body.email 
      })
    }

    user.role = req.body.role;
    await user.save();

    await user.sendSignUpEmail().catch(e => console.log(e));

    res.json(user);
  });

  app.post("/api2/admin/users/:id", m.authSuperAdmin, async (req, res) => {
    let user = await models.User.findOne({where: {id: req.params.id}})

    let usernameExists = await models.User.findOne({ 
      where: { 
        [Sequelize.Op.or]: {
          username: { [Sequelize.Op.iLike]: req.body.username } 
        }
      }, paranoid: false 
    });

    let emailExists = await models.User.findOne({ 
      where: { 
        [Sequelize.Op.or]: {
          email: { [Sequelize.Op.iLike]: req.body.email } 
        }
      }, paranoid: false 
    });

    const isOwnEmail = emailExists && emailExists.id === user.id;
    const isOwnUsername = usernameExists && usernameExists.id === user.id;

    if (emailExists && !isOwnEmail) {
      return res.status(422).json({ msg: 'Email already exists' })
    } else if (usernameExists && !isOwnUsername) {
      return res.status(422).json({ msg: 'Username already exists' })
    } else {
      await user.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        role: req.body.role,
      })
    }

    res.json(user);
  });

  app.delete("/api2/admin/users/:id/delete", m.authSuperAdmin, async (req, res) => {
    await models.User.destroy({ where: { id: req.params.id } });
    res.json({ id: req.params.id, "status": "ok" });
  });
}
