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

const { Listener } = require('discord-akairo');
const logger = require('node-color-log');
const config = require('../config');

class ReactionListener extends Listener {
  constructor() {
    super('reaction', {
      emitter: 'client',
      event: 'messageReactionAdd'
    });
  }

  async exec(reaction, user) {
    
    var guild = this.client.persistents.guild;

    logger.debug(`[Discord] [Reacion] Received Reaction: ${reaction.emoji.name}`);

    logger.debug(`[Discord] [Reaction] Resolving reaction`)
    if(reaction.partial) {
      try { await reaction.fetch() }
      catch (error) {
        logger.error(`There was an error when trying to fetch the reaction: `, error)
        return;
      }
    }

    logger.debug(`[Discord] [Reaction] Validating Guild`);
    if (reaction.message.guild != guild)
      return;
    
    logger.debug(`[Discord] [Reaction] Matching Channel`);
    if (reaction.message.channel != this.client.persistents.onboardingChannel)
      return;

    logger.debug(`[Discord] [Reaction] Matching to a role`);
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
        logger.debug(`[Discord] [Reaction] Didn't match a regionRole. Tossing.`)
        return;
    }

    guild.members.resolve(user).roles.add(regionRole);
  }
}

module.exports = ReactionListener;