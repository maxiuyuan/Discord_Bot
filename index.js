const Discord = require('discord.js');
const https = require('https');
const axios = require('axios');
const fs = require('fs');

const bot = new Discord.Client();

const key = 'NTk5MzU3MDU1MDE0NTM1MTcz.XSkA2g.dC87VXoRDeg7YAjhgexHBB5zMDI';

const PREFIX = '!';

bot.on('ready', () => {
  console.log('This bot is online');
});

bot.on('message', msg => {
  let args = msg.content.substring(PREFIX.length).split(" ");

  switch(args[0]){
    case 'help':
      msg.channel.send('These are all my commands: weather, outfit, help, clear, add, addFolder, get{folders, images: folder: imageName}');
    break

    case 'weather':
    case 'outfit':
      getWeather(msg,args[0]);
    break;

    case 'clear':
      if(!args[1]){
        msg.channel.send('Please define amount of messages to clear');
      }
      else{
        msg.channel.bulkDelete(args[1]);
      }
    break;

    case 'add':
      addImage(msg,args[1]);
    break;

    case 'addFolder':
      makeDirectory(args[1]);
    break;

    case 'get':
      let directories = getDirectories();

      if (args[1] == 'folders'){
        msg.channel.send('Here are all the directories: ' + directories.join(', '));
      }
      else if( args[1] == 'images'){
        if(directories.includes(args[2])){
          let folderName = `./images/${args[2]}`;
          let response = getImages(folderName);
          if(response.includes(args[3])){
            msg.channel.send({files: [`${folderName}/${args[3]}`]});
          }
          else{
          msg.channel.send('Here are all the images in ' + args[2] + ': ' +response.join(', '));
        }
        }
      }
    break;
  }
});

function getImages(folder){
  let imageArray = [];
  fs.readdirSync(folder).forEach(file => {
    imageArray.push(file);
  });
  return imageArray;
}

function makeDirectory(name){
  var dir = `./images/${name}`;

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
}

function getWeather(msg,command){
  let temp = 0;
  let response = '';
  axios.get('https://api.openweathermap.org/data/2.5/weather?q=Waterloo,ca&appid=e04a364b8ddd6b7a71a355f64abf3f56')
    .then(response => {

      temp = (parseInt(response.data.main.temp) - 273.15).toFixed(2);

      response = 'The current temperature in ' + response.data.name + ' is ' + String(temp) + ' °C. The current weather condition is: ' + response.data.weather[0].main;
      msg.channel.send(response);

      if(command === 'outfit'){
        getOutfit(msg,temp);
      }
    })
    .catch(error => {
      console.log(error);
    });
}

function addImage(msg,folder){
  let directories = getDirectories();
  if (directories.includes(folder)){
    msg.attachments.forEach(a => {
      const file = fs.createWriteStream(`./images/${folder}/${a.filename}`);
      const request = https.get(a.url, response => {
        response.pipe(file);
      });
    });
  }
  else{
    msg.channel.send('Sorry please add to one of these directories: ' + directories.join(', '));
  }
}

function getDirectories() {
  return fs.readdirSync('./images').filter(function (file) {
    return fs.statSync('./images/'+file).isDirectory();
  });
}

function getOutfit(msg,temp){
  if(temp > 20){
    let files = fs.readdirSync('./images/Hot/');
    let random = Math.floor(Math.random() * files.length);
    msg.channel.send({files: [`./images/Hot/${files[random]}`]})
  }
  else if ( temp > 5) {
    let files = fs.readdirSync('./images/Temperate/');
    let random = Math.floor(Math.random() * files.length);
    msg.channel.send({files: [`./images/Temperate/${files[random]}`]})
  }
  else {
    let files = fs.readdirSync('./images/Cold/');
    let random = Math.floor(Math.random() * files.length);
    msg.channel.send({files: [`./images/Cold/${files[random]}`]})
  }
}

bot.login(key);
