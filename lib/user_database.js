var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Replication  = require('./replication.js')

/**
 *  UserDatabase
 *
 *  wraps user's databases (user/<hash>) 
 *  and reacts on the respective changes
 *
 */
var UserDatabase = function(databaseName, usersDatabase) {

  this.name               = databaseName;
  this.ownerHash          = databaseName.match(/^([^\/]+)\/([^\/]+)/).pop();

  this.worker             = usersDatabase.worker;
  this.couch              = usersDatabase.worker.couch;
  this.database           = usersDatabase.worker.couch.database(this.name);
  
  this.createReplications()
}
util.inherits(UserDatabase, EventEmitter);


// 
// 
// 
UserDatabase.prototype.createReplications = function() {
  this.replication1 = new Replication({
    _id : "user_sync/" + this.name + " => " + "users_sync"
  }, this)
  this.replication2 = new Replication({
    _id : "user_sync/users_sync => " + this.name
  }, this)
}

// 
// 
// 
UserDatabase.prototype.cleanUp = function() {
  this.replication1.stop()
  this.replication2.stop()
}


// 
// 
// 
UserDatabase.prototype.log = function(message) {
  message = "[" + this.name + "]\t" + message
  this.worker.log.apply( this.worker, arguments)
}

module.exports = UserDatabase;