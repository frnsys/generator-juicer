'use strict';
var util   = require('util'),
    path   = require('path'),
    fs     = require('fs'),
    rimraf = require('rimraf'),
    yeoman = require('yeoman-generator'),
    exec   = require('child_process').exec;


var JuicerGenerator = module.exports = function JuicerGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(JuicerGenerator, yeoman.generators.Base);

JuicerGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(juicer);

  var prompts = [{
    type: 'input',
    name: 'projectName',
    message: 'What is your project\'s name?',
    default: 'Juicer'
  }];

  this.prompt(prompts, function (props) {
    this.projectName = props.projectName;

    cb();
  }.bind(this));
};

JuicerGenerator.prototype.app = function app() {
  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
  this.copy('index.jade', 'index.jade');
  this.copy('404.jade', '404.jade');
  this.copy('favicon.ico', 'favicon.ico');

  this.directory('inc', 'inc');
  this.directory('assets', 'assets');
  this.directory('src', 'src');
  this.directory('js', 'js');
};

JuicerGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('gitignore', '.gitignore');
  this.copy('bowerrc', '.bowerrc');
  this.copy('csslintrc', '.csslintrc');
  this.copy('jshintrc', '.jshintrc');
  this.copy('Gruntfile.js', 'Gruntfile.js');
};

JuicerGenerator.prototype.h5bp = function h5bp() {
  var cb = this.async();

  this.remote('h5bp', 'html5-boilerplate', function(err, remote) {
      if (err) {
          return cb(err);
      }
      remote.copy('.htaccess', '.htaccess');
      remote.copy('crossdomain.xml', 'crossdomain.xml');
      remote.copy('humans.txt', 'humans.txt');
      remote.copy('robots.txt', 'robots.txt');
      cb();
  });
};

JuicerGenerator.prototype.stylesheets = function stylesheets() {
    var cb = this.async();

    this.remote('ftzeng', 'atomic', function(err, remote) {
        if (err) {
            return cb(err);
        }
        remote.directory('.', 'css/');
        cb();
    });
};

// Get latest stable Wordpress
JuicerGenerator.prototype.wordpress = function wordpress() {
    var cb = this.async(),
        self = this;

    // From: https://github.com/romainberger/yeoman-wordpress (with modifications)
    try {
        var version = exec('git ls-remote --tags git://github.com/WordPress/WordPress.git', function(err, stdout, stderr) {
          if (err !== null) {
            self.writeln('exec error: ' + err);
          }
          else {
            var pattern = /\d\.\d[\.\d]*/ig
              , match = stdout.match(pattern)
              , patternShort = /^\d\.\d$/
              , latestVersion = match[match.length - 1]
              , semverLatestString = latestVersion;

            if (semverLatestString.match(patternShort)) semverLatestString += '.0';

            if (semverLatestString !== null && typeof semverLatestString !== 'undefined') {
              self.latestVersion = latestVersion;
              self.log.writeln('Latest version: '+self.latestVersion);
            }
          }
          self.remote('wordpress', 'wordpress', self.latestVersion, function(err, remote) {
              remote.bulkDirectory('.', 'engine');

              cb();
          });
        });
      }
    catch(e) {
        cb();
    }
};

JuicerGenerator.prototype.purge_themes = function purge_themes() {
    var cb = this.async(),
        self = this;

    // Clean up themes.
    // From: https://github.com/romainberger/yeoman-wordpress (with modifications)
    fs.readdir('engine/wp-content/themes', function(err, files) {
        if (typeof files != 'undefined' && files.length !== 0) {
            files.forEach(function(file) {
                var pathFile = fs.realpathSync('engine/wp-content/themes/'+file)
                  , isDirectory = fs.statSync(pathFile).isDirectory();

                if (isDirectory) {
                    rimraf.sync(pathFile);
                    self.log.writeln('Removing ' + pathFile);
                }
            });
        }
    });

    cb();
};

var juicer =
'\n\t     _         _                         '+
'\n\t    (_) _   _ (_)   ___    __   _ __     '+
'\n\t    | |( ) ( )| | /\'___) /\'__`\\( \'__)'+
'\n\t    | || (_) || |( (___ (  ___/| |       '+
'\n\t _  | |`\\___/\'(_)`\\____)`\\____)(_)   '+
'\n\t( )_| |                                  '+
'\n\t\\___/\'                                 '+
'\n\n\t       [A Yeoman generator]\n\n';

