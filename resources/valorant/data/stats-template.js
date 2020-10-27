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

const
  config = require('../../../config'),
  ranks = require('./ranks'),
  agents = require('./agents'),
  agentDetails = require('./agent-details'),
  guns = require('./guns');


/*
 * Helper Functions
 */

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

  var agent = [ agentDetails[agents[playedAgents[0][0]]].name, playedAgents[0][1].matches ]
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



/*
 * Main Functions
 */

function valorantStatsEmbed(apiResponse){
  return {
    embed: {
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
  }
}

function missingUserEmebed(tag) {
  return {
    embed: {
      title: "Valorant - Error",
      description: `Your search for tag returned no results. The user either doesn't exist or has no data.`,
      fields: [
        {
          name: "Troubleshooting:",
          value: `- Validate that the player is using the [Blitz.gg Client](https://blitz.gg/download)
                  - Validate the [user profile](https://blitz.gg/valorant/profile/${tag.replace("#", "-").toLowerCase()}) on Blitz.gg
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
  }
}

function genericError(e) {
  if (e == null) { e = "UNK" }

  return { embed: {
    title: `Cordelia`,
    thumbnail: getRankedImageURL(99),
    description: "Oops! There was an error getting your stats!",
    footer: { text: e }
  }};
}

module.exports = {
  valorantStatsEmbed,
  missingUserEmebed,
  genericError
}