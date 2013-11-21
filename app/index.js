'use strict';
var util   = require('util'),
    path   = require('path'),
    fs     = require('fs'),
    rimraf = require('rimraf'),
    yeoman = require('yeoman-generator'),
    exec   = require('child_process').exec,
    wp_dir = 'engine',
    themes = wp_dir + '/wp-content/themes/',
    theme  = themes + 'theme';


var JuicerGenerator = module.exports = function JuicerGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    // Change to the theme's directory.
    process.chdir(theme);
    this.installDependencies({ skipInstall: options['skip-install'] });

    console.log('Creating mysql db...');

    var pass = '';
    if (this.mysqlPass.length > 0) {
        pass = ' -p'+this.mysqlPass;
    }
    exec('echo "create database '+this.projectName+'" | mysql -uroot'+pass);
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
  },{
      type: 'input',
      name: 'mysqlUser',
      message: 'What is your mysql user?',
      default: 'root'
  },{
      type: 'input',
      name: 'mysqlPass',
      message: 'What is this mysql user\'s password?',
      default: ''
  }];

  this.prompt(prompts, function (props) {
    this.projectName = props.projectName.toLowerCase().replace(' ', '_');
    this.mysqlUser = props.mysqlUser;
    this.mysqlPass = props.mysqlPass;

    cb();
  }.bind(this));
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
              remote.bulkDirectory('.', wp_dir);

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
    fs.readdir(themes, function(err, files) {
        if (typeof files != 'undefined' && files.length !== 0) {
            files.forEach(function(file) {
                var pathFile = fs.realpathSync(themes+file)
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



// Copy over theme files
JuicerGenerator.prototype.app = function app() {
  this.directory('theme', theme);
  this.copy('server.sh', 'server.sh');
  this.copy('favicon.ico', 'favicon.ico');
};

// Copy over MAMP wp-config.php
JuicerGenerator.prototype.wp_config = function wp_config() {
    this.copy('wp-config.php', wp_dir+'/wp-config.php');
    rimraf.sync(wp_dir+'/wp-config-sample.php');
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
        remote.directory('.', theme+'/css/');
        cb();
    });
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

