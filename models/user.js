'use strict';

var bcrypt = require("bcrypt")
const { uuid } = require('uuidv4');
const sendgrid = require("../util/sendgrid.js");

const SITE_URL = process.env.SITE_URL;
const ANON_EDITOR_EMAIL = "anon_editor@plansource.io"

const SALT_ROUNDS = 10;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordDigest: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpiresAt: DataTypes.DATE,
    emailSignupToken: DataTypes.STRING,
    emailSignupExpiresAt: DataTypes.DATE,
    activated: DataTypes.BOOLEAN,
    role: {
      type:   DataTypes.ENUM,
      // values: ["super admin", "admin", "basic"],
      values: ["super admin", "editor"],
      defaultValue: "editor",
    },
    humanizedRole: {
      type: DataTypes.VIRTUAL,
      get () { return this.getDataValue("role").replace(/\b\w/g, l => l.toUpperCase()); }
    }
  }, {
    defaultScope: {
      attributes: {
        exclude: [
          'passwordDigest',
          'resetPasswordToken',
          'resetPasswordExpiresAt',
          'emailSignupToken',
          'emailSignupExpiresAt',
        ]
      },
    },
    scopes: {
      withPassword: { attributes: {} },
      withTokens: { attributes: {} }
    },
    indexes: [
      {
        unique: true,
        name: 'unique_email',
        fields: [sequelize.fn('lower', sequelize.col('email'))]
      }
    ],
    paranoid: true
  });

  User.beforeValidate(async (user, options) => {
    user.email = (user.email || "").toLowerCase();
  });

  User.associate = function(models) {
    // associations can be defined here
  };

  User.validateEmail = function(email) {
    if (!email || !/^\S+@\S+$/.test(email)) return false;
    return true;
  }

  User.validatePassword = function(password) {
    if (!password || password.length < 8) return false;
    return true;
  };

  User.getAnonEditor = function () {
    return new Promise(function (resolve, reject) {
      User.findOne({ where: { email: ANON_EDITOR_EMAIL } }).then(u => {
        if (u) return resolve(u)
        const user = User.build({
          firstName: "Anonymous",
          lastName: "Editor",
          email: ANON_EDITOR_EMAIL,
          username: "anon_editor",
          activated: true,
          role: "editor"
        })
        user.updatePassword(uuid());
        user.save().then(_ => resolve(user));
      })
    })
  }

  User.prototype.fullName = function() {
    return this.firstName + " " + this.lastName;
  };

  (User.rawAttributes.role.values || []).forEach(role => {
    const camelCase = "is" + role.split(" ").map(t=>(t.charAt(0).toUpperCase() + t.slice(1))).join("");
    User.prototype[camelCase] = function() { return this.role === role };
  });

  User.prototype.updatePassword = function(password) {
    const hash = bcrypt.hashSync(password, SALT_ROUNDS);
    this.passwordDigest = hash;
  };

  User.prototype.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.passwordDigest);
  };

  User.prototype.isResetPasswordExpired = function () {
    const resetPasswordExpiresAt = this.resetPasswordExpiresAt;
    return (new Date().getTime() - resetPasswordExpiresAt.getTime()) > 0;
  }

  User.prototype.isEmailSignupExpired = function () {
    const emailSignupExpiresAt = this.emailSignupExpiresAt;
    return (new Date().getTime() - emailSignupExpiresAt.getTime()) > 0;
  }

  User.prototype.getResetPasswordLink = function () {
    return SITE_URL + "/app/reset-password-link/" + this.resetPasswordToken;
  }

  User.prototype.getSignUpLink = function () {
    return SITE_URL + "/app/invite-user-link/" + this.emailSignupToken;
  }

  User.prototype.canEditProject = async function(project) {
    if (!project) return false;

    if (this.isAdmin) return true;
    if (this.id === parseInt(project.UserId)) return true;

    return false;
  }

  User.prototype.sendResetPasswordEmail = async function() {
    // Refresh the expiration and code
    const hourFromNow = new Date(new Date().getTime() + (60 * 60 * 1000));
    this.resetPasswordToken = uuid();
    this.resetPasswordExpiresAt = hourFromNow;

    await this.save();

    const message = `You have requested a password reset at FinishVision Finish Portal. 
    Please click the link to reset your password: ${this.getResetPasswordLink()}`

    // Send email with link to signup
    sendgrid.sendEmail({
      to: this.email,
      subject: `FinishVision invitation`,
      text: message,
      html: message,
    });
  }

  User.prototype.sendSignUpEmail = async function() {
    // Refresh the expiration and code
    const hourFromNow = new Date(new Date().getTime() + (60 * 60 * 1000));
    this.emailSignupToken = uuid();
    this.emailSignupExpiresAt = hourFromNow;
    
    await this.save();

    const message = `You have been invited to join the FinishVision Finish Portal. 
    Please use this link to accept your invitation: ${this.getSignUpLink()}`

    // Send email with link to signup
    sendgrid.sendEmail({
        to: this.email,
        subject: `FinishVision invitation`,
        text: message,
        html: message,
      });
  }

  return User;
};
