// FRIENDLY REMINDER
// Do not use "//" comments in _designDoc functions

var stop = function(doc, req) { 
  log('stopping replication ' + doc._id); 
  doc._deleted = true; 
  return [doc, 'OK'];
};

var start = function(doc, req) { 
  var dbs, shareId, userHash; 
  if (! doc) doc = {}; 

  doc._id        = req.id; 
  doc.continuous = true; 

  /* source & target */
  dbs            = req.id.replace(/^[^\/]+\//,'').split(' => '); 
  doc.source     = dbs[0]; 
  doc.target     = dbs[1];

  /* user context */
  /* turn $subscription/user/what-ever-here => user_sync  into what-ever-here */
   
  userHash = req.id.match(/\buser\/([^\s]+)/).pop();

  doc.user_ctx = {
    roles : ["_admin"]
  };

  /* filter */
  if (doc.target === 'users_sync') {
    doc.filter = 'users_sync_filters/users_sync'
  }

  /* timestamps */
  doc.createdAt = JSON.stringify(new Date());
  doc.updatedAt = doc.createdAt; 

  return [doc, 'OK'];
};

var json = {
  "_id": "_design/users_sync",
  "views": {},
  "updates": {
    "stop": stop.toString().replace(/\s*\n\s*/g, ' '),
    "start": start.toString().replace(/\s*\n\s*/g, ' ')
  }
};

module.exports = json;