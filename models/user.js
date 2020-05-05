'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    passwordDigest: DataTypes.STRING,
    confirmationCode: DataTypes.STRING,
    confirmationExpiration: DataTypes.DATE,
    emailConfirmedAt: DataTypes.DATE,
  }, {});

  User.associate = function(models) {
    // associations can be defined here
    User.belongsToMany(models.Team, {
      through: {
        model: models.TeamMembership,
        scope: { role: "owner" },
      },
      as: "OwnedTeams",
    });
    User.belongsToMany(models.Team, {
      through: {
        model: models.TeamMembership,
        scope: { role: "editor" },
      },
      as: "EditorTeams",
    });
    User.belongsToMany(models.Team, {
      through: models.TeamMembership,
      as: "Teams",
    });
  };

  User.prototype.refreshConfirmationCode = async function () {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1)
    this.confirmationCode = Math.floor(100000 + Math.random() * 900000);
    this.confirmationExpiration = futureDate;
    await this.save();
  };

  User.prototype.confirmEmail = async function (code) {
    if (!code) return false;
    if (!this.confirmationCode || !this.confirmationExpiration) return false;
    if (this.confirmationCode.localeCompare(code) != 0) return false;
    if ((new Date() - this.confirmationExpiration) > 1000*60*60) return false;

    this.emailConfirmedAt = new Date();
    this.confirmationCode = null;
    this.confirmationExpiration = null;
    await this.save();

    return true;
  }

  User.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.passwordDigest);
  }

  User.prototype.setPassword = async function (password) {
    const passwordDigest = await bcrypt.hash(password, 10);
    this.passwordDigest = passwordDigest;
  }

  User.login = async (email, password) => {
    const user = (await User.findAll({ where: { email: email } }))[0];
    if (!user) return null;

    const isMatch = await user.checkPassword(password);
    if (!isMatch) return null;

    return user;
  }

  User.validatePassword = function (password) {
    return true;
  }

  return User;
};
