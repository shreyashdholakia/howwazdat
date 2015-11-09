
'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserProfileSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  firstname: String,
  lastname: String,
  location: String,
  joiningDate: Date,
  avatar: { data: Buffer, contentType: String },
  admin: Boolean,
  updatedDate: Date
});

/**
 * Define model.
 */

mongoose.model('UserProfile', UserProfileSchema);
