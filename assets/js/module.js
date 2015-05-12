var defaultText = "/*\n* Meet LumberJack!\n* It's tool for anyone that's lecturing on\n*   JS fundamentals to new developers.\n* Think of it as a more illustrative console.log().\n*\n* Call the function log() with any parameter \n*   to log it out to the right side w/ line number.\n*/\nlog(\"hello, world!\");\n\nfunction greeter(person) {\n  log(person);\n  return \"Hi, \" + person;\n}\n\nvar salutation = greeter(\"LumberJack\");\nlog(salutation);"
var app = angular.module("lumberjackApp", ["ui.router"])

app.filter('unsafe', [ "$sce", function($sce) { return $sce.trustAsHtml; } ]);

app.config([ "$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider){

  $urlRouterProvider.otherwise("");

  $stateProvider
    .state('index', {
      url: "",
      templateUrl: "/templates/main.html"
    })

  $stateProvider
    .state('known', {
      url: "/:id",
      templateUrl: "/templates/main.html"
    })

}])

var mainCtrl = app.controller("mainController", ["$scope", "$http", "$state", "$stateParams", "$timeout", function($scope, $http, $state, $stateParams, $timeout){

  /*
  * Editor config
  */
  editor = ace.edit("editor");
  editor.$blockScrolling = Infinity
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
  
  /*
  * Editor keyup event binding
  */
  var parseTimeout

  editor.getSession().on("change", function(){
    $timeout.cancel(parseTimeout)
    parseTimeout = $timeout(checkCode, 500)
  })

  /*
  * Click handlers
  */

  $scope.clickHeader = function() {
    $state.go("index")
  }

  $scope.clickSave = function() {
    $http.post("/api/save", {
      text: editor.getSession().getValue()
    }).success(function(d){
      $state.go("known", { id: d.slug })
    })
  }

  /*
  * Core log parsing/error handling code
  */

  var getLineNumber = function(err) {
    var lines = err.stack.split("\n").filter(function(line){
      return line.indexOf("eval") > -1
    })

    if (!lines.length) {
      return false
    }

    // Works for Firefox and Chrome
    return lines[0].split(":").slice(-2,-1)[0] * 1
  }

  var colorize = function(value) {
    console.log("colorize", value)

    switch(typeof value) {
      case "boolean":
      case "number":
      case "undefined":
        return "<span class='purple'>" + value + "</span>"
      case "string":
        return "<span class='gold string'>" + '"' + value + '"' + "</span>"
      case "function":
        return "<pre class='white function'>" + value.toString() + "</pre>"
    }

    if (value === null) {
      return "<span class='purple'>" + value + "</span>"
    }

    if (value.constructor === Array) {
      var str = "<span class='bracket open'>[</span>"
      str += value.map(function(item, i){
        var str = colorize(item)

        if (i + 1 < value.length) {
          str += "<span class='comma'>,</span>"
        }

        return str
      }).join("")
      str += "<span class='bracket close'>]</span>"
      return str
    }

    if (typeof value === "object") {
      var alphaKeys = Object.keys(value).sort()
      var str = "<span class='brace open'>{</span>"
      str += "<div class='gutter'>"

      str += alphaKeys.map(function(key){
        var str = "<div class='pair'>"
        str += "<span class='key'><span class='blue'>" + key + "</span>: </span>"
        str += "<span class='val'>" + colorize(value[key]) + "</span>"
        
        str += "</div>"
        return str
      }).join("")

      str += "</div>"
      str += "<span class='brace close'>}</span>"

      return str
    }

    return value
  }

  var log = function(d) {

    var e = new Error()
    var line = getLineNumber(e)

    if (line) {
      $scope.messages.push({
        line: "Line " + line,
        snippet: "- " + editor.getSession().getValue().split("\n")[line - 1],
        value: colorize(d)
      })
      return
    }

    return {
      value: colorize(d)
    }

  }

  var checkCode = function() {
    $scope.messages = []
    
    // Thar be dragons here
    try {
      eval(editor.getSession().getValue())
    }
    catch(err) {
      $scope.messages.push({
        line: "Line " + getLineNumber(err),
        error: true,
        value: err.name + ": " + err.message
      })
    }
  }

  /*
  * On load, retrieve/set value
  */

  if ($stateParams.id) {
    $http.get("/api/" + $stateParams.id).success(function(d){
      editor.getSession().setValue(d.text)
      checkCode()
    })
  }
  else {
    editor.getSession().setValue(defaultText)
  }

}])