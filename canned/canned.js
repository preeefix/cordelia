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

const Discord = require('discord.js');
const config = require('../config');


// Discord Embed: Initial message for when a user joins the server.
function firstWelcome(member) {
    return new Discord.MessageEmbed()
        .setColor(config.discord.embed.colour)
        .setFooter(config.discord.embed.footer, config.discord.embed.footerImg)
        .setTitle('Welcome Agent!')
        .setDescription(`Welcome to the ${config.discord.guildName} Discord! Because this is a semi-private Discord. I'm going to need you to provide some information.\n
            If you are a ${config.discord.employeeRoleName}, please click this link and sign in with you @${config.validation.emailBase} account: ${config.express.external_URL}/auth/google. \n
            If you're a guest of a ${config.discord.employeeRoleName}, please have the member run '!guest ${member.id} in the designated guest chat!`);
};

function memberAuthenticated(member) {
    return new Discord.MessageEmbed()
        .setColor(config.discord.embed.colour)
        .setFooter(config.discord.embed.footer, config.discord.embed.footerImg)
        .setTitle('Successfully Authenticated!')
        .setDescription(`We're glad to have you ${member.user.tag}! Some next steps: \n
        - Head over to #onboarding to get setup with a region and rank tracking.\n
        - Checkout #announcements to see what events are being planned!\n\n
        See you out in the field!`)
} 

module.exports = {
    firstWelcome,
    memberAuthenticated
}