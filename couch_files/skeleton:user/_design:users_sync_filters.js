// 1. ignore unshared objects
// 2. replicate only objects belonging to share
var users_sync = function(doc, req) { 
  if (! doc.type) {
    return false
  }
  if (doc.type[0] === '$') {
    return false;
  }
  return true;
}

var json = {
  "_id": "_design/users_sync_filters",
  "views": {},
  "filters": {
    "users_sync": users_sync.toString().replace(/\s*\n\s*/g, ' ')
  }
}

module.exports = json