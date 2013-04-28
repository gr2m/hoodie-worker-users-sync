* okay, get rid of the friggind ?new_edits=false
  thing, it sucks. To prevent recursion with
  the "merge changes to all other placese where
  the same document is shared" – problem, use 
  the "updatedBy" property. Set it to "auto".
  That ends up to be a security feature as well,
  this way user A accessing Share A cannot see
  the hash of User B who changed the same document
  at Share B. w00t.

* fix `handleAccountRemoved` in shares_database
* add bootstraps like in SharesDatabase to 
  UsersDatabse, UserDatabase, UserSharesDatabase.
  Pretty much everywhere ;-)