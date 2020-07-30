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
            If you're a guest of a ${config.discord.employeeRoleName}, please have the member run '!guest ${member.user.id} in the designated guest chat!`);
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