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
    this.askAddRegions = false;
    this.regions = [];
  },

  welcome: function() {
    this.log(yosay("\"Allo, let's go and start creating a Drupal 8 theme!"));
  },

  themeName: function() {
    var cb = this.async();

    var prompts = [{
      type: "input",
      name: "themeName",
      message: "What is the name of your theme:",
      validate: function(str) {
        return str !== "";
      }
    }];

    this.prompt(prompts, function(answers) {
      // Set theme name.
      this.themeName = answers.themeName;
      this.themeSanitized = answers.themeName.toLowerCase();
      cb();
    }.bind(this));
  },

  themeDescription: function() {
    var cb = this.async();

    var prompts = [{
      type: "input",
      name: "themeDescription",
      message: "Enter a description for your theme:",
      validate: function(str) {
        return str !== "";
      }
    }];

    this.prompt(prompts, function(answers) {
      // Set theme name.
      this.themeDescription = answers.themeDescription
      cb();
    }.bind(this));
  },

  baseTheme: function() {
    var cb = this.async();

    var prompts = [{
      type: "list",
      name: "baseTheme",
      message: "Which base theme would you like to include?",
      choices: [{
        name: "Stable",
        value: "stable",
      }, {
        name: "Classy",
        value: 'classy',
      }, {
        name: "None",
        value: "none",
      }]
    }];

    this.prompt(prompts, function(answers) {
      this.baseTheme = answers.baseTheme;
      cb();
    }.bind(this));
  },

  askAddRegions: function() {
    var cb = this.async();

    this.log(yosay("\"In Drupal 8, you are required to have a content region. I will add a Content region to the theme."));

    var prompts = [{
      type: "confirm",
      name: "addRegions",
      message: "Would you like to add some more regions to your theme:",
      default: true,
    }];

    this.prompt(prompts, function(answers) {
      this.askAddRegions = answers.askAddRegions;
      cb();
    }.bind(this));

  },

  addRegions: function(cb) {
    cb = cb || this.async();

    var prompts = [{
      type: 'input',
      name: 'region',
      message: chalk.yellow('  What is the name of the region:'),
      validate: function(str) {
        return str !== "";
      }
    }, {
      type: 'confirm',
      name: 'askAgain',
      message: 'Would you like to add some more regions:',
    }];

    this.prompt(prompts, function(props) {
      this.regions.push(props.region);

      if (props.askAgain) {
        this.addRegions(cb);
      } else {
        cb();
      }
    }.bind(this));
  },

  writing: {
    infoFile: function() {
      this.fs.copyTpl(
        this.templatePath("themeSanitized.info.yml"),
        this.destinationPath(this.themeSanitized + ".info.yml"), {
          themeName: this.themeName,
          themeSanitized: this.themeSanitized,
          themeDescription: this.themeDescription,
          baseTheme: this.baseTheme,
          regions: this.regions
        }
      );
    },
    themeFile: function() {
      this.fs.copyTpl(
        this.templatePath("themeSanitized.theme"),
        this.destinationPath(this.themeSanitized + ".theme"), {
          themeName: this.themeName,
          themeSanitized: this.themeSanitized
        }
      );
    },
    librariesFile: function() {
      this.fs.copyTpl(
        this.templatePath("themeSanitized.libraries.yml"),
        this.destinationPath(this.themeSanitized + ".libraries.yml"), {
        }
      );
    }
  }

});
