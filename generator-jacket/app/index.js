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

    this.argument("name", {
      type: String,
      required: true
    });

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
      this.drupalTheme = this.options.path;
    }
  },

  initializing: function () {
    this.pkg = require("../package.json");
    // this.log(this.pkg);
  },

  prompting: function () {
    var done = this.async();

    if (!this.options["skip-welcome-message"]) {
      this.log(yosay("\"Allo, Awesome front end developer! Out of the box I include a sane default setup, a good starting structure and powerfull front-end tools."));
    }

    var prompts = [{
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
        value: "inlcudeScss-helper",
        checked: true
      }, {
        name: "layout-styles.scss",
        value: "inlcudeScss-layout",
        checked: true
      }, {
        name: "print-styles.scss",
        value: "includeScss-print",
        checked: true
      }]
    }];

    this.prompt(prompts, function (answers) {
      this.includeScssBase = _.contains(answers.scssFiles, "includeScss-base");
      this.includeScssComponent = _.contains(answers.scssFiles, "includeScssCompo-nent");
      this.inlcudeScssHelper = _.contains(answers.scssFiles, "inlcudeScssHe-lper");
      this.inlcudeScssLayout = _.contains(answers.scssFiles, "inlcudeScssLa-yout");
      this.includeScssPrint = _.contains(answers.scssFiles, "includeScssP-rint");
      done();
    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath("gulpfile.js"),
        this.destinationPath("gulpfile.js"),
        {
          // date: (new Date).toISOString().split("T")[0]
          // name: this.pkg.name,
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath("package.json"),
        this.destinationPath("package.json"),
        {}
      );
    },

    git: function () {
      this.fs.copy(this.templatePath(".gitignore"), this.destinationPath(".gitignore"));
    },

    bower: function () {
      this.fs.copyTpl(
        this.templatePath("bower.json"),
        this.destinationPath("bower.json"),
        {}
      );
    },


    styles: function () {
      this.directory(this.templatePath("src/scss/utils"), this.destinationPath("src/scss/utils"));

      if (this.includeScssBase) {
        this.fs.copy(this.templatePath("src/scss/base-styles.scss"), this.destinationPath("src/scss/base-styles.scss"));
        this.directory(this.templatePath("src/scss/base"), this.destinationPath("src/scss/base"));
      }

      if (this.includeScssComponent) {
        this.fs.copy(this.templatePath("src/scss/component-styles.scss"), this.destinationPath("src/scss/component-styles.scss"));
        this.directory(this.templatePath("src/scss/components"), this.destinationPath("src/scss/components"));
      }

      if (this.inlcudeScssHelper) {
        this.fs.copy(this.templatePath("src/scss/helper-styles.scss"), this.destinationPath("src/scss/helper-styles.scss"));
      }

      if (this.inlcudeScssLayout) {
        this.fs.copy(this.templatePath("src/scss/layout-styles.scss"), this.destinationPath("src/scss/layout-styles.scss"));
      }

      if (this.includeScssPrint) {
        this.directory(this.templatePath("src/scss/print"), this.destinationPath("src/scss/print"));
        this.fs.copy(this.templatePath("src/scss/print-styles.scss"), this.destinationPath("src/scss/print-styles.scss"));
      }
    }
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options["skip-install-message"],
      skipInstall: this.options["skip-install"]
    });
  }
});
