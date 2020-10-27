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

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  exec() {

    this.client.persistents.guild = this.client.guilds.resolve(config.discord.guild);


    var guild = this.client.persistents.guild
    // Retrieve the Channel Instances
    this.client.persistents.botChannel = guild.channels.cache.find(
      channel => channel.id == config.discord.channels.botChannel);
    this.client.persistents.onboardingChannel = guild.channels.cache.find(
      channel => channel.id == config.discord.channels.onboardingChannel)

    // Retrieve Roles
    this.client.persistents.employeeRole = guild.roles.cache.find(
      role => role.name === config.discord.employeeRoleName);
    this.client.persistents.guestRole = guild.roles.cache.find(
      role => role.name === config.discord.guestRoleName);

    logger.info(`Discord Client Ready! Name: ${this.client.user.username}`)
  }
}

module.exports = ReadyListener;