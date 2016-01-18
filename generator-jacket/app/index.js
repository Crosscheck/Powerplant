var generators = require("yeoman-generator");
var mkdirp = require("mkdirp");
var yosay = require("yosay");
var chalk = require("chalk");
var wiredep = require("wiredep");
var _s = require("underscore.string");
var _ = require("underscore");

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    this.breakpoints = require(this.templatePath("breakpoints.json"));
    var bpQuestion = [];

    _.each(this.breakpoints.breakpoints, function(e, i) {
      if(i !== "zero") {
        bpQuestion.push({name: i + " ( " + e.width + " )", value: "bp_" + i, checked: true});
      }
    });
    this.bpQuestion = bpQuestion;

    this.option("drupal-theme", {
      desc: "When this flag is on, it will check the path flag, and split the config files from the src and dist folders.",
      type: Boolean
    });

    this.option("path", {
      desc: "Path can allocate a deeper path for all the files. This works also in combination with drupal-theme option",
      type: String,
      defaults: this.destinationRoot()
    });


    this.option("skip-welcome", {
      desc: "Skips the welcome message",
      type: Boolean
    });

    this.option("skip-install-message", {
      desc: "Skips the message after the installation of dependencies",
      type: Boolean
    });


    if(this.options.path !== this.destinationRoot() && this.options.drupalTheme === false) {
      this.destinationRoot(this.options.path);
    }

    if(this.options.path !== this.destinationRoot() && this.options.drupalTheme === true) {
      this.theme = this.options.path + "/";
    } else {
      this.theme = "";
    }
  },

  initializing: function () {
    this.pkg = require("../package.json");
  },

  prompting: function () {
    var done = this.async();

    if (!this.options["skip-welcome-message"]) {
      this.log(yosay("\"Allo, Awesome front end developer! Out of the box I include a sane default setup, a good starting structure and powerfull front-end tools."));
    }

    var prompts = [{
      type: "input",
      name: "appName",
      message: "What is the name of this project?",
      validate: function(str) {
        return str !== "" && str.length >= 2;
      }
    }, {
      type: "input",
      name: "appDescr",
      message: "Please give a simple description for this project?",
      validate: function(str) {
        return str !== "";
      }
    }, {
      type: "confirm",
      name: "jade",
      message: "Do you want to use the Jade template engine?",
      default: true
    }, {
      type: "confirm",
      name: "html",
      message: "Do you want to use the h5bp index.html?",
      default: true
    }, {
      type: "confirm",
      name: "browserSync",
      message: "Do you want to use the Browsersync server for easy testing?",
      default: true
    }, {
      type: "confirm",
      name: "scssLint",
      message: "Do you want to use scss-lint to keep the scss code consistent?",
      default: true
    }, {
      type: "confirm",
      name: "sassDoc",
      message: "Do you want to use sassDoc to document your project?",
      default: true
    }, {
      type: "checkbox",
      name: "breakpoints",
      message: "What breakpoints would you like me to use?",
      choices: this.bpQuestion
    }, {
      type: "checkbox",
      name: "scssFiles",
      message: "What scss files would you like me to load?",
      choices: [{
        name: "base-styles.scss",
        value: "includeScss-base",
        checked: true
      }, {
        name: "component-styles.scss",
        value: "includeScss-component",
        checked: true
      }, {
        name: "helper-styles.scss",
        value: "includeScss-helper",
        checked: true
      }, {
        name: "layout-styles.scss",
        value: "includeScss-layout",
        checked: true
      }, {
        name: "print-styles.scss",
        value: "includeScss-print",
        checked: true
      }]
    }, {
      type: "input",
      name: "siteWidth",
      message: "What is the width of your project? (example: 100% or 1200)",
      default: 1170,
      validate: function(str) {
        return Number.parseInt(str, 10) > 0;
      }
    }, {
      type: "confirm",
      name: "drawGrid",
      message: "Do you want to draw a visual grid?",
      default: true
    }];

    this.prompt(prompts, function (answers) {
      this.appName = answers.appName;
      this.appDescr = answers.appDescr;

      this.jade = answers.jade;
      this.html = answers.html;

      this.browserSync = answers.browserSync;

      this.scssLint = answers.scssLint;
      this.sassDoc = answers.sassDoc;

      this.whichBreakpoints = answers.breakpoints;
      this.includeScssBase = _.contains(answers.scssFiles, "includeScss-base");
      this.includeScssComponent = _.contains(answers.scssFiles, "includeScss-component");
      this.includeScssHelper = _.contains(answers.scssFiles, "includeScss-helper");
      this.includeScssLayout = _.contains(answers.scssFiles, "includeScss-layout");
      this.includeScssPrint = _.contains(answers.scssFiles, "includeScss-print");

      this.siteWidth = answers.siteWidth;
      this.drawGrid = answers.drawGrid;

      done();
    }.bind(this));
  },

  writing: {
    configs: function () {
      this.fs.copyTpl(
        this.templatePath("_breakpoints.json"),
        this.destinationPath("breakpoints.json"),
        {
          whichBreakpoints: this.whichBreakpoints
        }
      );

      this.fs.copyTpl(
        this.templatePath("config.json"),
        this.destinationPath("config.json"),
        {
          theme: this.theme,
          jade: this.jade
        }
      );
    },

    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath("gulpfile.js"),
        this.destinationPath("gulpfile.js"),
        {
          dest: this.destinationPath(),
          theme: this.options.path,
          jade: this.jade,
          browserSync: this.browserSync,
          scssLint: this.scssLint,
          sassDoc: this.sassDoc
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath("_package.json"),
        this.destinationPath("package.json"),
        {
          appName: this.appName,
          appDescr: this.appDescr,
          jade: this.jade,
          browserSync: this.browserSync,
          scssLint: this.scssLint,
          sassDoc: this.sassDoc
        }
      );
    },

    scssLint: function () {
      if (this.scssLint) {

        this.fs.copyTpl(
          this.templatePath(".scss-lint.yml"),
          this.destinationPath(".scss-lint.yml"),
          {}
        );
      }
    },

    git: function () {
      this.fs.copy(this.templatePath("_gitignore"), this.destinationPath(".gitignore"));
    },

    bower: function () {
      this.fs.copyTpl(
        this.templatePath("bower.json"),
        this.destinationPath("bower.json"),
        {
          appName: this.appName,
          appDescr: this.appDescr,
        }
      );
    },

    dist: function () {
      this.directory(this.templatePath("dist"), this.destinationPath(this.theme + "dist"));
    },

    jade: function () {
      if (this.jade) {
        this.fs.copyTpl(
          this.templatePath("src/jade/**/*"),
          this.destinationPath(this.theme + "src/jade"),
          {
            appName: this.appName,
            appDescr: this.appDescr,
            jade: this.jade,
            browserSync: this.browserSync,
            scssLint: this.scssLint,
            sassDoc: this.sassDoc,
            includeScssBase: this.includeScssBase,
            includeScssComponent: this.includeScssComponent,
            includeScssHelper: this.includeScssHelper,
            includeScssLayout: this.includeScssLayout,
            includeScssPrint: this.includeScssPrint
          }
        );
      }
    },

    html: function () {
      if(this.html) {
        this.fs.copyTpl(
          this.templatePath("dist/index.html"),
          this.destinationPath(this.theme + "dist/index.html"),
          {
            appName: this.appName,
            appDescr: this.appDescr,
            jade: this.jade,
            browserSync: this.browserSync,
            scssLint: this.scssLint,
            sassDoc: this.sassDoc,
            includeScssBase: this.includeScssBase,
            includeScssComponent: this.includeScssComponent,
            includeScssHelper: this.includeScssHelper,
            includeScssLayout: this.includeScssLayout,
            includeScssPrint: this.includeScssPrint
          }
        );
      } else {
        this.fs.delete(this.destinationPath(this.theme + "dist/index.html"));
      }
    },

    styles: function () {
      this.fs.copyTpl(
        this.templatePath("src/scss/utils/**/*"),
        this.destinationPath(this.theme + "src/scss/utils"),
        {
          siteWidth: this.siteWidth,
          drawGrid: this.drawGrid,
          sassDoc: this.sassDoc
        }
      );

      if (this.includeScssBase) {
        this.fs.copy(this.templatePath("src/scss/base-styles.scss"), this.destinationPath(this.theme + "src/scss/base-styles.scss"));
        this.directory(this.templatePath("src/scss/base"), this.destinationPath(this.theme + "src/scss/base"));
      }

      if (this.includeScssComponent) {
        this.fs.copy(this.templatePath("src/scss/component-styles.scss"), this.destinationPath(this.theme + "src/scss/component-styles.scss"));
        this.directory(this.templatePath("src/scss/components"), this.destinationPath(this.theme + "src/scss/components"));
      }

      if (this.includeScssHelper) {
        this.fs.copy(this.templatePath("src/scss/helper-styles.scss"), this.destinationPath(this.theme + "src/scss/helper-styles.scss"));
      }

      if (this.includeScssLayout) {
        this.fs.copy(this.templatePath("src/scss/layout-styles.scss"), this.destinationPath(this.theme + "src/scss/layout-styles.scss"));
      }

      if (this.includeScssPrint) {
        this.directory(this.templatePath("src/scss/print"), this.destinationPath(this.theme + "src/scss/print"));
        this.fs.copy(this.templatePath("src/scss/print-styles.scss"), this.destinationPath(this.theme + "src/scss/print-styles.scss"));
      }
    }
  },

  install: function () {
    var that = this;
    this.installDependencies({
      skipMessage: this.options["skip-install-message"],
      skipInstall: this.options["skip-install"],
      callback: function() {
        if(that.scssLint) {
          that.spawnCommand("gem", ["install", "scss_lint"]);
        }

        that.spawnCommand("gulp", ["help"]);
      }
    });
  }
});
