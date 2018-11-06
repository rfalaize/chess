"use strict";
module.exports = function(app) {
  var agentController = require("./../controllers/agentController");

  // agent routes
  // ****************************************

  app.route("/agent/randomAgent").get(agentController.generateMove);

  /*app.route('/user/:userId')
    .get(user.getProfile)
    .put(user.createProfile)
    .delete(user.deleteProfile);*/
};
