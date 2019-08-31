const mongoose = require("mongoose");
const URL = require("url").URL;

mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
const AutoIncrement = require('mongoose-sequence')(mongoose);

const linkSchema = new mongoose.Schema({
  original_url : {
    type : String,
    required : true,
    validate : {
      validator: (v) => {
        try {
          new URL(v);
          return true;
        } catch (err) {
          return false;
        }
      },
      message : "Invalid URL!"
    }
  }
})

linkSchema.plugin(AutoIncrement, {inc_field: "short_url"});

const Link = mongoose.model("Link", linkSchema);

const doShortLink = (newLink, done) => {
  var NewLink = new Link({ original_url : newLink });
  NewLink.save((error, data) => {
    if (error)
      done(error);
    done(null, data);
  })
};

const doGetLink = (shortUrl, done) => {
  Link.findOne({short_url : shortUrl}, (err, data) => {
    if(err) done(err);
    done(null, data);
  })
}

const showAllLink = (done) => {
  Link.find({}, (error, data) => {
    if (error)
      done(error);
    done(null, data);
  })
}

exports.LinkModel = Link;
exports.doShortLink = doShortLink;
exports.showAllLink = showAllLink;
exports.doGetLink = doGetLink;