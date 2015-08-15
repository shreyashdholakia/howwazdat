
'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserProfileSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  firstname: String,
  lastname: String,
  location: String,
  avatar: { data: Buffer, contentType: String },
  admin: Boolean,
  updatedDate: Date
});

/**
 * Pre hook.
 */

UserProfileSchema.pre('save', function(next, done){
  if (this.isNew)
    this.created = Date.now();

  

  next();
});

/**
 * Statics
 */
UserProfileSchema.statics = {
  load: function(id, cb) {
    this.findOne({
      _id: id
    }).populate('creator', 'username').exec(cb);
  }
};

/**
 * Methods
 */

UserProfileSchema.statics.findByTitle = function (title, callback) {
  return this.find({ title: title }, callback);
}

UserProfileSchema.methods.expressiveQuery = function (creator, date, callback) {
  return this.find('creator', creator).where('date').gte(date).run(callback);
}


/**
 * Define model.
 */

mongoose.model('UserProfile', UserProfileSchema);