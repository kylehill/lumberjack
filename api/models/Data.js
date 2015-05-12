/**
* Data.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var shortid = require("shortid")

module.exports = {

  attributes: {

  },

  add: function(data, callback) {
    Data.create(data, function(err, data){
      if (err || !data) {
        console.log(err)
        return callback(err, data)
      }
      data.slug = shortid.generate()
      data.save(callback)
    })
  }
};

