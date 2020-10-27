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

const logger = require('node-color-log'),
  config = require('../../../config');

function genString(team) {
  var returnString = "";
  var currentPlayer = {};

  for(var teamPlayers = 0; teamPlayers < team.length; teamPlayers++){
    currentPlayer = team[teamPlayers];
    returnString = returnString + `- ${currentPlayer.gameName}#${currentPlayer.tagLine} (CS: ${Math.floor(currentPlayer.stats.score/currentPlayer.stats.roundsPlayed)})\n`
  }

  return returnString;
}

function matchTemplate(team1, team2, tag) {

  var t1string = genString(team1);
  var t2string = genString(team2);
  
  return {
    embed: {
      title: "Valorant - Matching",
      description: `Here is next round's matchup based on ${tag}'s last match:`,
      fields: [
        {
          name: "Team 1:",
          value: t1string,
          inline: true
        },
        {
          name: "Team 2:",
          value: t2string,
          inline: true
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
    thumbnail: { url: `${config.express.external_URL}/static/valorant-logo.png` },
    description: "Oops! There was an error getting your stats!",
    footer: { text: e }
  }};
}

module.exports = { matchTemplate, missingUserEmebed, genericError }