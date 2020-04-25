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

const EMAIL = "shane@finishvision.com";
const PASSWORD = "password1";

beforeAll(async () => {
  const user = await findUserByEmail(EMAIL);
  if (!user) return;
  const ownedTeams = await user.getOwnedTeams();

  await models.User.destroy({ where: { id: user.id } });
  await models.Team.destroy({ where: { id: ownedTeams.map(o => o.id) } });
  await models.TeamMembership.destroy({ where: { UserId: user.id } });

  const newUser = models.User.build({ email: EMAIL });
  await newUser.setPassword(PASSWORD);
  await newUser.save();
});

describe('Login user', function() {
  it('responds w/ 302 when invalid email or password', function(done) {
    req
      .post('/api2/login')
      .send(`email=${EMAIL}&password=${PASSWORD}asdf`)
      .expect(302)
      .end(async function(err, res){
        if (!res.header['location'].includes('login_error')) return done("Should have login_error.");
        if (!res.header['location'].includes('/login')) return done("Should redirect to login page.");

        done(err);
      });
  });

  it('responds w/ 302 when valid email and password', function(done) {
    req
      .post('/api2/login')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(`email=${EMAIL}&password=${PASSWORD}`)
      .expect(302, async function(err, res){
        if (!res.header['location'].includes('/projects')) return done("Should redirect to projects page. " + res.header["location"]);
        done(err);
      });
  });

});

describe('Logout user', function() {
  it('responds w/ 302', function(done) {
    req
      .get('/api2/logout')
      .expect(302, async function(err, r){
        if (!r.header['location'].includes('/login')) return done("Should redirect to login page.");

        req
          .get('/projects')
          .expect(302, async function(err, res){
            if (!res.header['location'].includes('/login')) return done("Should redirect to login page.");
            done(err);
        });
      });
  });
});
