var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var db = require('./data/database.js');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/templates/index.html');
});

io.on('connection', function(socket) {
    socket.on('event', function(data) {
        console.log('A client is connected:', data.message);
    });

    socket.on('vote-up', function(data){
      db.voteUp(data.id)
      .then((candidate) => {
        socket.emit('vote-up-finished', { score: candidate.score })
      })
      .catch((err) => {
        console.log(err);
        socket.emit('vote-up-finished', { error: -1 });
      });
    });

    socket.on('vote-down', function(data){
      db.voteDown(data.id)
      .then((candidate) => {
        socket.emit('vote-down-finished', { score: candidate.score })
      })
      .catch((err) =>
          socket.emit('vote-down-finished', { error: -1 })
      );
    });

    socket.on('info-candidate', function(data){
      db.getCandidateById(data.id)
      .then(function(candidate){
        //console.log('info-candidate', candidate);
      })
      .catch((err) =>
        console.log(err)
      );
      //socket.emit('info-candidate-updated', { message: 'info-candidate-updated!' });
    });

    socket.on('all-candidates', function(data){
      db.getAllCandidates()
      .then(function(candidates){
        //console.log('all-candidates', candidates);
      })
      .catch((err) => console.log(err));

    });
});


db.setupDatabase();
server.listen(8080);
console.log('Server started on ', 8080);
