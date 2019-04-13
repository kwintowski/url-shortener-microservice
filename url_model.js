var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create Mongo Schema
var URLSchema = new Schema({
  src:  {type: String, required: true},
  dest: {type: String, required: true}
});
module.exports = mongoose.model('URL', URLSchema); 