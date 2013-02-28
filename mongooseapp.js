var mongoose = require('mongoose'),
  _ = require('lodash'),
  async = require('async')

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected')
});

var kittySchema = mongoose.Schema({
  name: { type: String, index: true},
  furryness: {type: Number, index: true}
})
kittySchema.index({name: 1, furryness: 1})

var Kitten = mongoose.model('Kitten', kittySchema)
Kitten.on('index', function (e) {
  if (e) {
    console.error(e)
  }
})

var neededKittens = 10000
mongoose.connect('mongodb://localhost/mongoose-indexingbug', function () {
  Kitten.find({}, function (err, kittens) {
    console.log('Has', kittens.length, 'kittens')
    if (kittens.length < neededKittens) {
      console.log('Creating', neededKittens - kittens.length, 'more')
      async.forEachSeries(_.range(kittens.length, neededKittens), function (n, callback) {
        var k = new Kitten({ name: 'K' + n, furryness: n })
        k.save(function (err, k) {
          if (err) {
            console.error(err)
          }
          callback()
        })
      }, closeConnection)
    }
    else {
      console.log('not creating more')
      closeConnection()
    }
  })
})

function closeConnection() {
  mongoose.connection.close(function () {console.log('Connection closed')})
}
