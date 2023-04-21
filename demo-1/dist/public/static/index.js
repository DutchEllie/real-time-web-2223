var socket = io();

const messages = document.querySelector('.message-list');
const messageForm = document.querySelector('.message-form');
const channelList = document.querySelector('.channel-list');
const messageListWrapper = document.querySelector('.message-list-wrapper');
const userListWrapper = document.querySelector('.user-list-wrapper');
const input = document.querySelector('.message-form > input');
var currentChannel = "general";
var nickname = "Anonymous";
const uuid = window.localStorage.getItem('uuid') ?? null;

messageForm.addEventListener('submit', (event) => {
  event.preventDefault()
  if (input.value) {

    // Check for commands
    if (input.value.startsWith('/')) {
      const command = input.value.split(' ')[0].substring(1);
      const arguments = input.value.split(' ').slice(1);
      console.log(command);
      console.log(arguments);
      switch(command) {
        case 'nick':
          if (arguments.length == 1) {
            const oldNick = nickname;
            nickname = arguments[0];
            socket.emit('changeNick', oldNick, nickname);
            // socket.emit('message', currentChannel, `${nickname} changed their nickname to ${arguments[0]}`);
          }
          break;
      }

      input.value = ''
      return;
    }

    socket.emit('message', currentChannel, uuid , input.value)
    input.value = ''
  }
})

socket.on('connect', () => {
  if(uuid == null) {
    socket.emit('getUUID');
  } else {
    socket.emit('setUUID', uuid);
  }
});

socket.on('getUUID', (uuid) => {
  window.localStorage.setItem('uuid', uuid);
});

socket.on('disconnect', () => {
  
});
  

socket.on('availableChannels', (channels) => { 
  // Get the first channel in the list and set it as the current channel as default
  if (channels.length > 0) {
    currentChannel = channels[0];
    document.querySelector('.message-list-wrapper > h2').textContent = channels[0];
    socket.emit('channelSwitch', channels[0]);
  }

  // For each channel, create a list item and add it to the channel list
  channels.forEach((channel) => {
    const li = document.createElement('li');
    const a = document.createElement('a');

    a.addEventListener('click', (event) => {
      event.preventDefault();
      currentChannel = channel;
      document.querySelector('.message-list-wrapper > h2').textContent = channel;
      socket.emit('channelSwitch', channel);
    });

    a.textContent = channel;
    li.appendChild(a);
    channelList.append(li);
  });
});

socket.on('channelHistory', (channelHistory) => {
  messages.innerHTML = '';
  for(let i = 0; i < channelHistory.length; i++) {
    const li = document.createElement('li');
    li.textContent = `${channelHistory[i].user.nick}: ${channelHistory[i].message}`
    messages.append(li);
  }
});

socket.on('connectedUsers', (users) => {
  const userList = userListWrapper.querySelector('ul');
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user.nick;
    userList.append(li);
  });
});

socket.on('message', (channel, user, message) => { 
  if (channel == currentChannel) {
    const li = document.createElement('li');
    li.textContent = `${user.nick}: ${message}`;
    messages.append(li);
  }
  // const li = document.createElement('li');
  // li.textContent = message;
  // messages.append(li);
});

// // Message from the server that someone changed their nickname
// socket.on('changeNick', (newNickname) => {

// });