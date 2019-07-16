const Discord = require('discord.js');
const https = require('https');
const axios = require('axios');
const fs = require('fs');

//main hub for connecting to Discord API
const bot = new Discord.Client();

const key = 'NTk5MzU3MDU1MDE0NTM1MTcz.XSkA2g.dC87VXoRDeg7YAjhgexHBB5zMDI';

//Essential prefix for commanding the bot
const PREFIX = '!';

const directories = getDirectories();

bot.on('ready', () => {
  console.log('This bot is online');
});

bot.on('message', msg => {
  //split input into individual words and making them lower case
  let args = msg.content.substring(PREFIX.length).split(" ");
  args = args.map(item => item.toLowerCase());

  switch(args[0]){
    case 'help':
      msg.channel.send('These are all my commands: weather, outfit, help, clear, add, addfolder, get{folders, images: folder: imageName}, delete{image:folder:imageName}');
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

    case 'addfolder':
      makeDirectory(args[1],msg);
    break;

    case 'get':
      if (args[1] == 'folders'){
        msg.channel.send('Here are all the directories: ' + directories.join(', '));
      }
      else if( args[1] == 'images'){
        if(directoryHelper(directories,args,msg)){
          msg.channel.send({files: [`./images/${args[2]}/${args[3]}`]});
        }
      }
    break;

    case 'delete':
      if(args[1] == 'image'){
        if(directoryHelper(directories,args,msg)){
          deleteImage(`./images/${args[2]}/${args[3]}`);
        }
      }
    break;
  }
});

// function to determine if the image in the directory exists
function directoryHelper(directories,args,msg){
  if(directories.includes(args[2])){
    let response = getImages(`./images/${args[2]}`);
    if(response.includes(args[3])){
      return true;
    }
    else if(args[3] != null){
      msg.channel.send('Sorry, this image does not exist');
    }
    else{
      msg.channel.send('Here are all the images in ' + args[2] + ': ' +response.join(', '));
  }
  }
}

function deleteImage(object){
  fs.unlinkSync(object);
}

function getImages(folder){
  let imageArray = [];
  fs.readdirSync(folder).forEach(file => {
    imageArray.push(file);
  });
  return imageArray;
}

function makeDirectory(name,msg){
  //regex to validate if the naming schema is valid
  let valid = new RegExp(/^[a-zA-Z].*/).test(name);
  if(!valid){
    msg.channel.send('Sorry, this is not a valid folder name');
  }
  else{
    let dir = `./images/${name}`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
  }
}

function getWeather(msg,command){
  let temp = 0;
  let response = '';
  axios.get('https://api.openweathermap.org/data/2.5/weather?q=waterloo,ca&appid=e04a364b8ddd6b7a71a355f64abf3f56')
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
  //let directories = getDirectories();
  if (directories.includes(folder)){
    msg.attachments.forEach(a => {
      const file = fs.createWriteStream(`./images/${folder}/${a.filename.toLowerCase()}`);
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
    let files = fs.readdirSync('./images/hot/');
    let random = Math.floor(Math.random() * files.length);
    msg.channel.send({files: [`./images/hot/${files[random]}`]})
  }
  else if ( temp > 5) {
    let files = fs.readdirSync('./images/temperate/');
    let random = Math.floor(Math.random() * files.length);
    msg.channel.send({files: [`./images/temperate/${files[random]}`]})
  }
  else {
    let files = fs.readdirSync('./images/cold/');
    let random = Math.floor(Math.random() * files.length);
    msg.channel.send({files: [`./images/cold/${files[random]}`]})
  }
}

bot.login(key);
