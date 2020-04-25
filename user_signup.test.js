import "babel-polyfill"
const supertest = require("supertest");
const app = require("./websocket.js");
const req = supertest.agent(app);

var models = require("./models/index.js");
models.sequelize.options.logging = false;

async function findUserByEmail(email) {
  const userResults = await models.User.findAll({ where: { email } });
  return userResults[0];
}

beforeAll(async () => {
  const user = await findUserByEmail("shane@finishvision.com");
  if (!user) return;
  const ownedTeams = await user.getOwnedTeams();

  await models.User.destroy({ where: { id: user.id } });
  await models.Team.destroy({ where: { id: ownedTeams.map(o => o.id) } });
  await models.TeamMembership.destroy({ where: { UserId: user.id } });
});

describe('Create user email', function() {
  it('responds w/ 302 when valid email', function(done) {
    req
      .post('/api2/create/user_email')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("email=shane@finishvision.com")
      .expect(302, async function(err, res){
        if (res.header['location'].includes('email_error')) return done("Should not have email_error.");
        const user = await findUserByEmail("shane@finishvision.com");
        if (!user.confirmationCode || !user.confirmationExpiration) return done("No confirmation code.");
        done(err);
      });
  });

  it('responds w/ 302 when invalid email', function(done) {
    req
      .post('/api2/create/user_email')
      .send("email=shane@com")
      .expect(302)
      .end(async function(err, res){
        if (!res.header['location'].includes('email_error')) return done("Should have email_error.");
        const user = await findUserByEmail("shane@com");
        if (user) return done("User should not exist.");
        done(err);
      });
  });
});

describe('Confirm new user email', function() {
  it('responds w/ 302 when invalid code', async function(done) {
    const user = await findUserByEmail("shane@finishvision.com");

    req
      .post('/api2/create/confirm_email')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("code=1" + user.confirmationCode)
      .expect(302, async function(err, res){
        const user = await findUserByEmail("shane@finishvision.com");
        if (!user.confirmationCode || !user.confirmationExpiration) return done("Need to keep old confirm code.")
        if (user.emailConfirmedAt) return done("Email should not be confirmed successfully.")
        if (!res.header['location'].includes('/create/confirm_email')) return done("Redirect to team step.");
        if (!res.header['location'].includes('code_error')) return done("No code error.");
        done(err);
      });
  });

  it('responds w/ 302 when valid code', async function(done) {
    const user = await findUserByEmail("shane@finishvision.com");

    req
      .post('/api2/create/confirm_email')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("code=" + user.confirmationCode)
      .expect(302, async function(err, res){
        const user = await findUserByEmail("shane@finishvision.com");
        if (user.confirmationCode || user.confirmationExpiration) return done("Need to clear old confirm.")
        if (!user.emailConfirmedAt) return done("Email not confirmed successfully.")
        if (!res.header['location'].includes('/create/team')) return done("Redirect to team step.");
        done(err);
      });
  });
});

describe('Create team name', function() {
  it('responds w/ 302 when invalid name', function(done) {
    req
      .post('/api2/create/team')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("team_name=")
      .expect(302, async function(err, res){
        const user = await findUserByEmail("shane@finishvision.com");
        const ownedTeams = await user.getOwnedTeams();
        if (ownedTeams.length > 0) return done("Shouldn't have a team.");

        if (!res.header['location'].includes('/create/team')) return done("Redirect to team step. " + res.header["location"]);
        if (!res.header['location'].includes('team_error')) return done("Should include team_error.");

        done(err);
      });
  });

  it('responds w/ 302 when valid name', function(done) {
    req
      .post('/api2/create/team')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("team_name=FinishVision")
      .expect(302, async function(err, res){
        const user = await findUserByEmail("shane@finishvision.com");
        const ownedTeams = await user.getOwnedTeams();
        if (ownedTeams.length > 0) return done("Shouldn't have a team.");

        if (!res.header['location'].includes('/create/user_details')) return done("Redirect to user details step. " + res.header["location"]);

        done(err);
      });
  });
});

describe('Add user details', function() {
  it('responds w/ 302 when invalid', function(done) {
    req
      .post('/api2/create/user_details')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("firstName=&lastName=&password=")
      .expect(302, async function(err, res){
        const user = await findUserByEmail("shane@finishvision.com");
        const ownedTeams = await user.getOwnedTeams();

        if (user.firstName || user.lastName) return done("Should not save until valid.");
        if (user.passwordDigest) return done("Shouldn't have password.");
        if (ownedTeams.length > 0) return done("Shouldn't have a team.");

        if (!res.header['location'].includes('/create/user_details')) return done("Redirect to user_details page. " + res.header["location"]);
        if (!res.header['location'].includes('first_name_error')) return done("Should include first name error.");
        if (!res.header['location'].includes('last_name_error')) return done("Should include last name error.");
        if (!res.header['location'].includes('password_error')) return done("Should include password error.");

        done(err);
      });
  });

  it('responds w/ 302 when valid', function(done) {
    req
      .post('/api2/create/user_details')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("firstName=Shane&lastName=Burkhart&password=password1")
      .expect(302, async function(err, res){
        const user = await findUserByEmail("shane@finishvision.com");
        const ownedTeams = await user.getOwnedTeams();

        if (!user.firstName || !user.lastName) return done("Need both name parts.");
        if (!user.passwordDigest) return done("No password added.");
        if (ownedTeams.length != 1) return done("Wrong number of teams for user.");
        if (ownedTeams[0].name.localeCompare("FinishVision") != 0) return done("Wrong team name.");

        if (!res.header['location'].includes('/projects')) return done("Redirect to projects page. " + res.header["location"]);

        done(err);
      });
  });
});
