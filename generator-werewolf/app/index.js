var generators = require("yeoman-generator");
var mkdirp = require("mkdirp");
var yosay = require("yosay");
var chalk = require("chalk");
var wiredep = require("wiredep");
var _s = require("underscore.string");
var _ = require("underscore");

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
  },

  initializing: function() {
    this.pkg = require("../package.json");
  },

  promting: function() {
    var done = this.async();

    this.log(yosay("\"Allo, let's go and start creating a Drupal 8 theme!"));

    var prompts = [{
      type: "input",
      name: "themeName",
      message: "What is the name of your theme, eg. My Awesome Theme",
    },
    {
      type: "list",
      name: "baseTheme",
      message: "Which base theme would you like to include?",
      choices: [{
        name: "Stable",
        value: "stable",
      },
      {
        name: "Classy",
        value: 'classy',
      },
      {
        name: "None",
        value: "none",
      }]
    }];

    this.prompt(prompts, function (answers) {
      // Set theme name.
      this.themeName = answers.themeName;
      this.themeSanitized = answers.themeName.toLowerCase();

      // Set the theme description.
      this.themeDescription = answers.themeName;

      // Base theme questions.
      this.baseTheme = answers.baseTheme;

      done();

    }.bind(this));
  },

  writing: {
    infoFile: function() {
      this.fs.copyTpl(
        this.templatePath("themeSanitized.info.yml"),
        this.destinationPath(this.themeSanitized + ".info.yml"),
        {
          themeName: this.themeName,
          themeDescription: this.themeDescription,
          baseTheme: this.baseTheme
        }
      );
    }
  }

});
