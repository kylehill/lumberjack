var renderHome = function(res) {
  res.render("homepage", {
    text: "/*\n* Meet LumberJack!\n* It's tool for anyone that's lecturing on\n*   JS fundamentals to new developers.\n* Think of it as a more illustrative console.log().\n*\n* Call the function log() with any parameter \n*   to log it out to the right side w/ line number.\n*/\nlog(\"hello, world!\");\n\nfunction greeter(person) {\n  log(person);\n  return \"Hi, \" + person;\n}\n\nvar salutation = greeter(\"LumberJack\");\nlog(salutation);"
  })
}

module.exports = {

  _config: {
    actions: false,
    shortcuts: false,
    rest: false
  },
	
  save: function(req, res) {
    Data.add(req.body, function(err, s){
      if (err || !s) {
        return res.json({ error: true })
      }
      //console.log("!", err, s)
      res.json({ slug: s.slug })
    })
  },

  read: function(req, res) {
    Data.findOne({ slug: req.params.slug }).exec(function(err, data){
      if (err || !data) {
        res.json({})
      }
      res.json(data)
    })
  },

  home: function(req, res) {
    res.render("homepage")
  }

};

