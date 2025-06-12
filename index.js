const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
app.post('/api/users', function(req, res){
  const userId = uuidv4();
  let user = {
    username: req.body.username,
    _id: userId
  }
  users.push(user);
  res.json(user);
})

app.get('/api/users', function(req, res){
    res.json(users);
});

let exercises = [];
app.post('/api/users/:_id/exercises', function(req, res){
  let userId = req.params._id;
  let user = users.find(user => user._id === userId);
  if(!user){
    res.json({error: "User not found"});
    return;
  }
  let exercise = {
    _id: userId,
    username: user.username,
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
  }
  exercises.push(exercise);
  res.json(exercise);
})

app.get('/api/users/:_id/logs', function(req, res){
  let userId = req.params._id;
  let user = users.find(user => user._id === userId);
  let log = [];
  if(!user){
    res.json({error: "User not found"});
    return;
  }
  for (exercice of exercises){
    if (exercice._id === userId){
      log.push(exercice);
    }
  }

  let { from, to, limit } = req.query;
  let fromDate = from ? new Date(from) : null;
  let toDate = to ? new Date(to) : null;
  if (fromDate != null && toDate != null){
    log = log.filter(exercice => new Date(exercice.date) >= fromDate && new Date(exercice.date) <= toDate);
    if(limit != null){
       log = log.slice(0, parseInt(limit));
    }
  }
  
  let count = log.length;
  res.json({_id: userId, username: user.username, count: count, log: log});
  
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
