// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const logger = require('node-color-log');
const config = require('./config');

/*
 * Discord Bot
 */

const { 
  AkairoClient,
  CommandHandler,
  ListenerHandler,
  InhibitorHandler
} = require('discord-akairo');

const Discord = require('discord.js');

const commandsPath = './commands/';
const listenersPath = './listeners/';
const inhibitorsPath = './inhibitors/';

class MyClient extends AkairoClient {
  constructor() {
    super({ // Options for Akairo go here.
      ownerID: config.discord.ownerID
    }, { // Options for discord.js goes here.
      disableMentions: 'everyone',
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
      presence: { status: "online", name: "VALORANT", type: "PLAYING" },
      ws: { intents: Discord.Intents.ALL }
    });

    this.commandHandler = new CommandHandler(this, { // Options for the Command Handler
      allowMention: true,
      commandUtil: true,
      commandUtilLifetime : 600000,
      directory: commandsPath,
      handleEdits: true,
      storeMessages: true,
      prefix: '!',
      argumentDefaults: {
				prompt: {
					cancel: 'Command has been cancelled.',
					ended: 'Too many retries, command has been cancelled.',
					modifyRetry: (message, text) =>
						`${message.member}, ${text}\n\nType \`cancel\` to cancel this command.`,
					modifyStart: (message, text) =>
						`${message.member}, ${text}\n\nType \`cancel\` to cancel this command.`,
					retries: 3,
					time: 30000,
					timeout: 'Time ran out, command has been cancelled.'
				}
			}
    });

    this.listenerHandler = new ListenerHandler(this, {
			directory: listenersPath
		});

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: inhibitorsPath
    });
    
    this.logger = logger;
    
    this.persistents = {};
  }

  init() {
    this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);

		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			inhibitorHandler: this.inhibitorHandler
		});

    this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
    this.inhibitorHandler.loadAll();
    
    this.logger.info('Client Initialized!');
  }
}

const client = new MyClient();
client.init();
client.login(config.discord.token);


/*
 * Express
 */

const Express = require('express'),
  passport = require('passport');

// Passport
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: config.oauth.client,
  clientSecret: config.oauth.secret,
  callbackURL: config.oauth.callback
},
function(accessToken, refreshToken, profile, cb) {
  return cb(null, profile);
}
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const app = Express();
app.use(passport.initialize()); // Pass
app.use(passport.session());    // port

// Default Route
app.get('/', (req, res) => {
  res.send('This is Cordelia. <a href="https://music.youtube.com/">Check out my mixtape</a>');
});

// Google Authenitcation Kick-off
app.get('/auth/google',
passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google Authentication
app.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/auth/google' }),
(req, res) => {
    // Validate if the returned email contains
    if (!req.user.emails[0].value.endsWith(`@${config.validation.emailBase}`)) {
        return res.send(`
        You attempted to authenicate with a non-@${config.validation.emailBase} address. 
        Please try again using your corporate account. <br><br>
        <a href="/auth/google">Retry</a>
        `);
    }

    // Give the form for a Discord ID
    return res.send(`What is your Discord Username, without your tag (#1234)? <br><br>
    <form action="/discord_grant"> <input type="text" name="discord"><br><input type="submit" value="Submit"></form>`);
});

// Handle the Discord Username
app.get('/discord_grant',
  (req, res) => {
    // Log the Query string
    logger.debug(`Express: Authentication Request for ${req.query.discord}`);

    // Quick Null Check
    if (req.query.discord == null || req.query.discord == "")
      return res.send('It seems that we got an invalid user! <a hreg="/auth/google">Retry?</a>');

    // Let Discord handle all the discord things
    client.emit("authenticate", req.query.discord);

    return res.send(`Cordelia will send you a message when your permissions have been grandted! <br><br>
                    If you don't recieve a message, reach out to @qmarchi. <br><br>
                    As a quick callout, Cordelia saves <i>no</i> information about this authentication request.`);
});

// Static Assets
app.use('/static', Express.static('resources/valorant/static'));
app.listen(config.express.port, config.express.host);
logger.info(`Running on http://${config.express.host}:${config.express.port}`)