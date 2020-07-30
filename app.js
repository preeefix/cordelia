'use strict';

// External Imports
const Express = require('express');
const Discord = require('discord.js');
const passport = require('passport');

// Local Modules
const config = require('./config');
const cannedResponses = require('./canned/canned.js');

// Discord Variables
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    presence: { status: "online", name: "VALORANT", type: "PLAYING" },
    ws: { intents: Discord.Intents.ALL }
});

var guild, employeeRole, guestRole, botChannel, onboardingChannel;

// Passport Variables
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

// ***********
// Express App
// ***********
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
        console.log(`Requesting User: ${req.query.discord}`)

        // Quick Null Check
        if (req.query.discord == null || req.query.discord == "")
            return res.send('It seems that we got an invalid user!');

        // Retrieve the top match
        guild.members.fetch({ query: req.query.discord, limit: 1 }).then((userlist) => {
            var member = userlist.values().next().value;

            // Log the resulting member
            console.log(`Found User: ${member.user.tag}`);

            // Add Roles
            member.roles.add(employeeRole).then(() => {
                member.send(cannedResponses.memberAuthenticated(member))
            });

            return res.send(`Cordelia will send you a message when your permissions have been grandted! <br><br>
                            If you don't recieve a message, reach out to @qmarchi.`);
        })
});

  // Static Assets
  app.use('/static', Express.static('static'));

// ***********
// Discord App
// ***********

// Ready Handler
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}.`);
    guild = client.guilds.resolve(config.discord.guild);

    // Retrieve the Channel Instances
    botChannel = guild.channels.cache.find(
        channel => channel.id == config.discord.channels.botChannel);
    onboardingChannel = guild.channels.cache.find(
        channel => channel.id == config.discord.channels.onboardingChannel)

    // Retrieve Roles
    employeeRole = guild.roles.cache.find(
        role => role.name === config.discord.employeeRoleName);
    guestRole = guild.roles.cache.find(
        role => role.name === config.discord.guestRoleName);
})

// Message Handler
client.on('message', async (msg) => {
    
    // Split the Arguments
    const args = msg.content.slice(1).trim().split(/ +/);

    if (!msg.content.startsWith('!'))
        return;

    if (msg.content.startsWith("!valorant")) {
        require('./components/valorant/valorant').messageHandler(msg, args)
    }

    // DM Handler
    if (msg.guild == null) {
        
        // Validation Kickoff
        if (msg.content.startsWith("!validate")) {
            return msg.reply(cannedResponses.firstWelcome)
        }
    }

    if (msg.guild != guild)
        return;
    
    if (msg.channel == botChannel) {

        // Guest User Handler
        if (msg.content.startsWith('!guest')) {
            
            if (args[1] == null)
                return msg.reply(`You've provided an invalid argument.`);

            guild.members.resolve(args[1]).roles.add(guestRole).then( (guestMember) => {
                return msg.reply(`The guest role has been given to ${guestMember.user.tag}.`);
            });
        }
    }
})

// Reaction Handler
client.on('messageReactionAdd', async (reaction, user) => {

    // Resolve Partials
    if (reaction.partial) {
        try { await reaction.fetch() }
        catch (error) {
            console.log(`There was an error when trying to fetch the reaction: `, error)
            return;
        }
    }

    // DM Reaction Handler
    if (reaction.message.guild == null)
        return;

    console.log(`\n**Guild Level Reaction** \nChannel: ${reaction.message.channel.id}\nMessage: ${reaction.message.id}\nGuild: ${reaction.message.guild}\nEmoji: ${reaction.emoji.name}`)
    // Guild Reaction Handler
    if (reaction.message.guild == guild) {

        console.log(`\nReaction Matches Guild`)
        // Region Reaction Handler
        if (reaction.message.channel == onboardingChannel) {
            console.log(`\nReaction Matches Channel`)
            var regionRole;

            if (reaction.emoji.name == "🗽") {
              regionRole = guild.roles.cache.find(role => role.name === 'AMER-East' );
            } else if (reaction.emoji.name == "⛰️") {
              regionRole = guild.roles.cache.find(role => role.name === 'AMER-Central' );
            } else if (reaction.emoji.name == "🏖️") {
              regionRole = guild.roles.cache.find(role => role.name === 'AMER-West' );
            } else if (reaction.emoji.name == "🏝️") {
              regionRole = guild.roles.cache.find(role => role.name === 'APAC' );
            } else if (reaction.emoji.name == "🇪🇺") {
              regionRole = guild.roles.cache.find(role => role.name === 'EMEA' );
            } else {
                console.log(`Didn't match a regionRole. Tossing.`)
                return;
            }

            guild.members.resolve(user).roles.add(regionRole)
        }
    }

});

// New Member Prompt
client.on('guildMemberAdd', member => {
    member.send(cannedResponses.firstWelcome(member));
});

// **********
// App Launch
// **********
app.listen(config.express.port, config.express.host);
client.login(config.discord.token);

console.log(`Running on http://${config.express.host}:${config.express.port}`);