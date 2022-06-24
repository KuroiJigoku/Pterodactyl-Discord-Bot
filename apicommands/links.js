const Discord = require("discord.js");

exports.run = (client, message, api, focused, prefix, panellink, color, footername, footerimage) => {
  if (focused == "none") {
    let embed = new Discord.MessageEmbed()
      .setAuthor("Links")
      .setColor(color)
      .setDescription("> `Account Options`\n**Panel/Servers**: " + panellink + "\n**Account Page**: " + panellink + "/account\n**Security Options**: " + panellink + "/account/security\n**Account API**: " + panellink + "/account/api\n> `Server Options`\nYou must focus a server to see the server option links.")
      .setFooter(footername, footerimage)
    message.channel.send(embed);
    return    
  } else {
    let serverdir = actualpanellink + "/server/" + focused + "/"
    let embed = new Discord.MessageEmbed()
      .setAuthor("Links")
      .setColor(color)
      .setDescription("> `Account Options`\n**Panel/Servers**: " + panellink + "\n**Account Page**: " + panellink + "/account\n**Security Options**: " + panellink + "/account/security\n**Account API**: " + panellink + "/account/api\n> `Server Options`\n**Console**: " + serverdir + "\n**Console Only**: " + serverdir + "console\n**File Management**: " + serverdir + "files\n**Subusers**: " + serverdir + "users\n" + "**Schedule Manager**: " + serverdir + "schedules\n**Databases**: " + serverdir + "databases\n**Server Name**: " + serverdir + "settings/name\n**Server Allocations**: " + serverdir + "settings/allocation\n**SFTP Settings**: " + serverdir + "settings/sftp\n**Startup Parameters**: " + serverdir + "settings/startup")
      .setFooter(footername, footerimage)
    message.channel.send(embed);
    return
  }
}