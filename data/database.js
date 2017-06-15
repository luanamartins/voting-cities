const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

var url = "mongodb://localhost:27017/database";

var TABLE_NAME = "candidates";

module.exports = {
  setupDatabase,
  getCandidateById,
  voteUp,
  voteDown,
  getAllCandidates
};

function setupDatabase(){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;

    db.listCollections().toArray(function(err, collections) {
      if(err) throw err;

      if(!existsCollection(TABLE_NAME, collections)){

        db.createCollection(TABLE_NAME, function(err, res) {
          if (err) throw err;
          console.log("Candidates table created!");
          db.close();
        });

        var candidatesString = fs.readFileSync('data/candidates-data.json');
        var candidates = JSON.parse(candidatesString);
        for (i = 0; i < candidates.length; i++) {
          addCandidate(candidates[i]);
        }
      }
    });
  });
}

function existsCollection(collection, databaseCollections){
  var foundCollection = false;
  for(i = 0; i < databaseCollections.length && !foundCollection; i++){
    if(databaseCollections[i].name === collection){
      foundCollection = true;
    }
  }
  return foundCollection;
}

// var candidate = {
//   path: "/static/nature1.jpg",
//   score: 0,
//   id: 1,
//   latitude: "2",
//   longitude: "3"
// };
function addCandidate(candidate){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) reject(err);
      db.collection(TABLE_NAME).insertOne(candidate, function(err, res) {
        if (err)  reject(err);
        console.log("1 record inserted");
        db.close();
        resolve(res);
      });
    });
  });
}

function getCandidateById(id){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) reject(err);
      var query = { id };
      db.collection(TABLE_NAME).find(query).toArray(function(err, result) {
        if (err) reject(err);
        db.close();
        
        resolve(result);
      });
    });
  });
}

function voteUp(id){
  return getCandidateById(id)
  .then((candidates) => {
    console.log('Candidate voted up', id);
    return updateScore(candidates[0], 1);
  });
}

function voteDown(id){
  return getCandidateById(id)
  .then(function(candidates){
    console.log('Candidate voted down', id);
    return updateScore(candidates[0], -1);
  });
}

function updateScore(candidate, value){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) reject(err);
      //console.log('Candidate to update', candidate);
      var myquery = { id: candidate.id };
      const newScore = candidate.score + value;
      const validNewScore = newScore > 0? newScore : 0;

      var newvalues = {
        path: candidate.path,
        score: validNewScore,
        id: candidate.id,
        latitude: candidate.latitude,
        longitude: candidate.longitude
      };

      db.collection(TABLE_NAME).update(myquery, newvalues, function(err, res) {
        if (err) reject(err);
        console.log(res.result.nModified + " record updated");
        db.close();
        resolve(newvalues);
      });
    });
  });
}

function getAllCandidates(){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) reject(err);
      db.collection(TABLE_NAME).find({}).toArray(function(err, result) {
        if (err) reject(err);
        db.close();
        resolve(result);
      });
    });
  });
}
