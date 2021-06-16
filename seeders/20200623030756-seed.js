'use strict';
const models = require("../models/index.js");

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const emails = process.env.SEED_EMAILS && process.env.SEED_EMAILS.split(",") || []
    const password = process.env.SEED_PASSWORD
    return models.User.bulkCreate(emails.map((email) => {
      console.log(`Create user ${email}`)
      let user = new models.User({email: email})
      user.updatePassword(password)
      return {
        email: user.email,
        passwordDigest: user.passwordDigest,
        role: "super admin",
        activated: true,
      }
    }))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};