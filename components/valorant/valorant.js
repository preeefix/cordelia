// Modules
const fetch = require('node-fetch');
const Discord = require('discord.js');
const config = require('../../config');

// Valorant Content
const content = require('./content.json');
const ranks = require('./ranks');

// *******************
// * Reused messages *

// Generic Invalid Message
function invalidMessage(message) {

    var invalidEmbed = {
        title: "Valorant - Error",
        description: "It seems that you didn't provide a valid tag!",
        fields: [
            {
                name: "Usage:",
                value: "!valorant player#tag"
            },
        ],
        thumbnail: { url: `${config.express.external_URL}/static/valorant-logo.png` },
        color: config.discord.embed.colour,
        footer: {
            text: config.discord.embed.footer + ', Data from Blitz',
            icon_url: config.discord.embed.footerImg
        },
    }

    return message.reply({ embed: invalidEmbed })
}

function missingUserMessage(message, args) {
    var invalidEmbed = {
        title: "Valorant - Error",
        description: `Your search for ${args[1]} returned no results. The user either doesn't exist or has no data.`,
        fields: [
            {
                name: "Troubleshooting:",
                value: `- Validate that the player is using the [Blitz.gg Client](https://blitz.gg/download)
                    - Validate the [user profile](https://blitz.gg/valorant/profile/${args[1].replace("#", "-").toLowerCase()}) on Blitz.gg
                    - Contact qmarchi@`
            },
        ],
        thumbnail: { url: `${config.express.external_URL}/static/valorant-logo.png` },
        color: config.discord.embed.colour,
        footer: {
            text: config.discord.embed.footer + ', Data from Blitz',
            icon_url: config.discord.embed.footerImg
        },
    }

    return message.reply({ embed: invalidEmbed })
}

// ***********************
// * Rendered Components *

// Get the ranked image from Blitz
function getRankedImageURL(rankID) {
    return `${config.express.external_URL}/static/${ranks[rankID].key}.png`
}

// Determine the most played agent for the user
function getFavoriteAgent(apiResponse) {
    var playedAgents = [];

    // Determine Played agents
    for (const [ key, value ] of Object.entries(apiResponse.stats.overall.career.agentsStats)) {
        playedAgents.push([ key, value ]);
    }

    playedAgents.sort((a, b) => {
        return b[1].matches - a[1].matches;
    })
    console.log(`Most Played UUID: ${playedAgents[0][0]}`)

    var agent = [ content.agentData[content.agents[playedAgents[0][0]]].name, playedAgents[0][1].matches ]
    return `${agent[0]} with ${agent[1]} matches`;
}

// Determine the Average Damage by Round
function getCompADR(apiResponse) {
    var totalDamage = apiResponse.stats.competitive.career.damageStats.damage;
    var totalRounds = apiResponse.stats.competitive.career.roundsPlayed;

    return `~${(totalDamage/totalRounds).toFixed(2)}`
}

// Determine the KDA (K+(A/3))/D
function getCompKDA(apiResponse) {
    var totalKills = apiResponse.stats.competitive.career.kills;
    var totalDeaths = apiResponse.stats.competitive.career.deaths;
    var totalAssists = apiResponse.stats.competitive.career.assists;

    return `~${((totalKills+(totalAssists/3))/totalDeaths).toFixed(2)}`
}

// Determine the average Combat Score
function getCompCombat(apiResponse) {
    var totalScore = apiResponse.stats.competitive.career.score;
    var totalRounds = apiResponse.stats.competitive.career.roundsPlayed;

    return `~${(totalScore/totalRounds).toFixed(2)}`
}

async function getQStatus(apiResponse) {
    var playerID = apiResponse.id;

    var matchHistory = await fetch(`https://valorant.iesdev.com/matches/${playerID}?offset=0&queue=`).then(handleAPIResponse);

    var foundQ = false;

    for(const [ matchKey, matchValue ] of Object.entries(matchHistory.data)) {
        for(const [ playerKey, playerValue ] of Object.entries(matchValue.players)){
            if (playerValue.subject == "8aff4a09-3105-5bf9-809e-f84acb1c4278") {
                foundQ = true;
                break;
            }
        }
        break;
    }

    return `${foundQ ? "Yes" : "No"}`
}

// Determine the Average Combat Score

// ********************
// * Helper Functions *

function parseArgs(string, separator, n) {
    var split = string.split(separator);
    if (split.length <= n)
        return split;
    var out = split.slice(0,n-1);
    out.push(split.slice(n-1).join(separator));
    return out;
}

// Validate that we have a true response
function handleAPIResponse(response) {
    console.log("Response Valid: ", response.ok)
    return response.json()
}


// ************************
// * Root message handler *
async function messageHandler (message, args) {
    
    args = parseArgs(message.content, " ", 2);
    console.log("Arguments", args);

    // Validate Args
    if (args[1] == null) {
        return invalidMessage(message)
    } else if (!args[1].includes("#")) {
        return invalidMessage(message)
    }

    console.log("Valorant Command: ", args[1].replace("#", "-").toLowerCase());

    // Retrieve the core
    const apiResponse = await fetch(`https://valorant.iesdev.com/player/${args[1].replace("#", "-").toLowerCase()}`)
                                .then(handleAPIResponse)
                                .catch((err) => { return missingUserMessage(message, args)});

    console.log("API Raw: ". apiResponse);
    console.log(`Valorant API Request: ${apiResponse.name}#${apiResponse.tag}`)

    // Build the Embed
    var valorantEmbed = {
        title: `Valorant - ${apiResponse.name}#${apiResponse.tag}`,
        thumbnail: { url: getRankedImageURL(apiResponse.ranks.competitive.tier) },
        description: `${apiResponse.name}#${apiResponse.tag} is ranked ${ranks[apiResponse.ranks.competitive.tier].title}.`,
        fields: [
            {
                name: "Favorite Agent",
                value: getFavoriteAgent(apiResponse),
                inline: true
            },
            {
                name: "Competetive KDA",
                value: getCompKDA(apiResponse),
                inline: true
            },
            {
                name: "Competetive ADR",
                value: getCompADR(apiResponse),
                inline: true
            },
            {
                name: "Competetive Combat Score",
                value: getCompCombat(apiResponse),
                inline: true
            }
        ],
        color: config.discord.embed.colour,
        footer: {
            text: config.discord.embed.footer + ', Data from Blitz',
            icon_url: config.discord.embed.footerImg
        },
    }

    // And away we go!
    return message.reply({ embed: valorantEmbed });
    
}

module.exports = {
    messageHandler
}