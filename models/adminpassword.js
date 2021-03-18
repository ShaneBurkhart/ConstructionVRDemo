'use strict';

var bcrypt = require("bcrypt")

const SALT_ROUNDS = 10;

module.exports = (sequelize, DataTypes) => {
  const AdminPassword = sequelize.define('AdminPassword', {
    passwordDigest: DataTypes.STRING
  }, {});

  AdminPassword.associate = function(models) {
    // associations can be defined here
  };

  AdminPassword.validatePassword = function(password) {
    if (!password || password.length < 8) return false;
    return true;
  };

  AdminPassword.prototype.updatePassword = function(password) {
    const hash = bcrypt.hashSync(password, SALT_ROUNDS);
    this.passwordDigest = hash;
  };

  AdminPassword.prototype.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.passwordDigest);
  };

  return AdminPassword;
};
