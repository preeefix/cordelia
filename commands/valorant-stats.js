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

const { Command } = require('discord-akairo'),
  logger = require('node-color-log'),
  config = require('../config');

const fetch = require('node-fetch');

// Resources
const
  templates = require('../resources/valorant/data/stats-template');


class PingCommand extends Command {
  constructor() {
    super('valorant', {
      aliases: ['valorant', 'v'],
      typing: true,
      description: "Retrieve Statistics from for a Valorant Tag",
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
    this.client.logger.debug(`Received stats request for ${args.tag}`);

    const apiResponse = await fetch(`https://valorant.iesdev.com/player/${args.tag.replace("#", "-").toLowerCase()}`)
      .then((response) => response.json())
      .catch((err) => { return message.reply(templates.missingUserEmebed(args.tag))});

    logger.debug(`Successful Request for: ${apiResponse.name}#${apiResponse.tag}`)

    // Validate ranks actually exist, n00bs like to break things
    if (apiResponse.ranks == null) {
      apiResponse.ranks = {
        seeding: { tier: 0 },
        unrated: { tier: 0 },
        competitive: { tier: 0 }
      }
    }



    return message.reply(templates.valorantStatsEmbed(apiResponse));
  }
}

module.exports = PingCommand;