/**
 *  UsersSyncWorker
 *  
 */
var UsersDatabase  = require('./users_database.js');
var util           = require('util');
var HoodieWorker   = require('hoodie-worker');

// get JSONs for _design & _security docs required by the shares worker
var replicatorDesignDoc      = require('../couch_files/_replicator/_design:users_sync')
var userSkeletonDesignDoc    = require('../couch_files/skeleton:user/_design:users_sync_filters')
var usersSyncSecurityOptions = require('../couch_files/users_sync/_security')

// Listen to changes in _users database and start 
// new share workers for confirmed sign ups
var UsersSyncWorker = function(config) {
  console.log("setting up UsersSyncWorker with:\n%s", JSON.stringify(config, '', '  '))
  this.setup(config)
  .then( this.launch.bind(this) )
  .otherwise( this.handleErrorWithMessage("UsersSyncWorker setup failed") )
};
util.inherits(UsersSyncWorker, HoodieWorker);


// 
// install is called within the setup and can 
// return a promise for asynchronous tasks.
// 
// the shares worker several databases in
// _design docs in here.
// 
UsersSyncWorker.prototype.install = function() {
  return this.when.all([
    this.createUserSkeletonDatabase(), 
    this.createUsersSyncDatabase(),
    this.createDesignDocsInReplicator()
  ])
};


// 
// 
// 
UsersSyncWorker.prototype.launch = function() {
  this.log('launching …');
  new UsersDatabase(this);
}


// 
// 
// 
UsersSyncWorker.prototype.createUserSkeletonDatabase = function() {
  var create = this.promisify( this.couch.database('skeleton/user'), 'create' );

  this.log('creating skeleton/user database …')
  return create()
  .otherwise( this.handleCreateDatabaseError('skeleton/user').bind(this) )
  .then( this.createDesignDocsInUserSkeleton.bind(this) )
}


// 
// when an database cannot be created due to 'file_exists' error
// it's just fine. In this case we return a resolved promise.
// 
UsersSyncWorker.prototype.handleCreateDatabaseError = function(databaseName) {
  return function(error) {
    if (error.name === 'file_exists') {
      return this.when.resolve()
    } else {
      return this.when.reject(error)
    }
  }
}




// 
// 
// 
UsersSyncWorker.prototype.createDesignDocsInUserSkeleton = function() {
  this.log('creating design docs in skeleton/share …')

  var save = this.promisify( this.couch.database('skeleton/user'), 'save')
  return save( userSkeletonDesignDoc._id, userSkeletonDesignDoc )
    .otherwise( this.handleErrorWithMessage("Could not save skeleton/user/%s", userSkeletonDesignDoc._id) )
}




// 
// 
// 
UsersSyncWorker.prototype.createUsersSyncDatabase = function() {
  var create = this.promisify( this.couch.database('users_sync'), 'create' );

  this.log('creating users_sync database …')
  return create()
  .otherwise( this.handleCreateDatabaseError('users_sync').bind(this) )
  .then( this.createUsersSyncDatabaseSecurity.bind(this) )
}


// 
// 
// 
UsersSyncWorker.prototype.createUsersSyncDatabaseSecurity = function() {
  this.log('creating shares/_security …')

  var query = this.promisify(this.couch.database("users_sync"), 'query')
  var options = {
    path   : '_security',
    method : 'PUT',
    json   : usersSyncSecurityOptions
  };

  return query( options );
};


//    
//    
//    
UsersSyncWorker.prototype.createDesignDocsInUsers = function() {
  this.log('creating design docs in _users database …')

  var save = this.promisify( this.couch.database('_users'), 'save');
  return save( usersDesignDoc._id, usersDesignDoc );
}


//    
//    
//    
UsersSyncWorker.prototype.createDesignDocsInReplicator = function() {
  this.log('creating design docs in _replicator database …')

  var save = this.promisify( this.couch.database('_replicator'), 'save')
  return save( replicatorDesignDoc._id, replicatorDesignDoc )
}

module.exports = UsersSyncWorker;