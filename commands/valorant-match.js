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

const { Command } = require('discord-akairo');
const logger = require('node-color-log');
const template = require('../resources/valorant/data/match-templates')

const fetch = require('node-fetch');

class VMatchCommand extends Command {
  constructor() {
    super('vmatch', {
      aliases: ['valorantmatch', 'vm', 'vmatch'],
      typing: true,
      description: "Suggest a team based on prior round info",
      editable: true,
      args:[
        {
          id: 'tag',
          type: 'lowercase'
        }
      ] 
    });
  }

  async exec(message, args) {

    function calculateTeamScore(team) {
      var sum = 0;
      for(var p=0; p < team.length; p++) {
        sum = sum + (team[p].stats.score / team[p].stats.roundsPlayed);
      }
      return sum;
    }

    try {
      this.client.logger.debug(`[Discord] [VMatch] Received match request for ${args.tag}`);

      const userResponse = await fetch(`https://valorant.iesdev.com/player/${args.tag.replace("#", "-").toLowerCase()}`)
        .then((response) => response.json())
        .catch((err) => { return message.reply(template.missingUserEmebed(args.tag))});


      var userTag = userResponse.name + '#' + userResponse.tag
      logger.debug(`[Discord] [VMatch] Successful Request for: ${userTag}`);

      // Retrieve the entire match history
      const matchResponse = await fetch(`https://valorant.iesdev.com/matches/${userResponse.id}?offset=0&queue=`)
        .then((response) => response.json())
        .catch((err) => { return message.reply(template.missingUserEmebed(args.tag))});

      const lastMatch = matchResponse.data[0];
      const playerList = lastMatch.players;

      playerList.sort((a, b) => {
        return b.stats.score - a.stats.score;
      })

      var team1 = [],
        team2 = [];

      var t1score, t2score;

      for (var i = 0; i < playerList.length; i++) {
        t1score = calculateTeamScore(team1);
        t2score = calculateTeamScore(team2);
    
        // Validate that the team count isn't maxed
        if (team1.length >= 5) {
          team2.push(playerList[i]);
        } else if (team2.length >= 5) {
          team1.push(playerList[i]);
        } else {
          // Determine the team to put the player on
          if (t1score < t2score) {
            team1.push(playerList[i]);
          } else {
            team2.push(playerList[i])
          }
        }
      }

      return message.reply(template.matchTemplate(team1, team2, userTag));

    } catch (err) {
      console.log(err)
      logger.error(err)
      message.reply(template.genericError("ENOPARSE"))
    }
  }
}

module.exports = VMatchCommand;