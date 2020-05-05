'use strict';
module.exports = (sequelize, DataTypes) => {
  const TeamMembership = sequelize.define('TeamMembership', {
    role: DataTypes.STRING
  }, {});
  TeamMembership.associate = function(models) {
    // associations can be defined here
  };

  TeamMembership.canUserEditProject = async function (user, project) {
    if (!project || !user) return false;
    const memberships = await TeamMembership.findAll({
      where: {
        UserId: user.id,
        TeamId: project.TeamId,
        role: ["owner", "editor"],
      }
    });
    return memberships.length > 0;
  }

  return TeamMembership;
};
