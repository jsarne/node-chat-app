const socket = io();

const $msgForm = document.querySelector('#message-form');
const $msgInput = document.querySelector('#message-input');
const $msgFormButton = $msgForm.querySelector('button');
const $shareLocButton = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
  const $latestMessage = $messages.lastElementChild;
  const latestMessageHeight = 
    $latestMessage.offsetHeight + 
    parseInt(getComputedStyle($latestMessage).marginBottom) +
    parseInt(getComputedStyle($latestMessage).marginTop);

  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;
  const scrollOffset = $messages.scrollTop + visibleHeight;  // how far down from top of message list have I scrolled?
  
  // if I'm near the bottom, autoscroll down to show the latest message. otherwise do nothing (don't interrupt reading history)
  if (containerHeight - latestMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('locationMessage', (message) => {
  const msg = {
    message: message.url,
    createdAt: moment(message.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    username: message.username
  };
  const html = Mustache.render(locationTemplate, msg);
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('message', (message) => {
  const msg = {
    message: message.text,
    createdAt: moment(message.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    username: message.username
  };
  const html = Mustache.render(messageTemplate, msg);
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', (roomData) => {
  const html = Mustache.render(sidebarTemplate, roomData);
  document.querySelector('#sidebar').innerHTML = html;
});

$msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $msgFormButton.setAttribute('disabled', 'disabled');
  const messageText = $msgInput.value;
  $msgInput.value = '';
  $msgInput.focus();
  socket.emit('sendMessage', messageText, (msg) => {
    $msgFormButton.removeAttribute('disabled');
  });
});

$shareLocButton.addEventListener('click', (e) => {
  if (!navigator.geolocation) {
    return alert('geolocation not supported by your browser');
  } else {
    $shareLocButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((pos) => {
      socket.emit('sendLocation', {lat: pos.coords.latitude, long: pos.coords.longitude}, (ack) => {
        $shareLocButton.removeAttribute('disabled');
      });
    }, (error) => {
      alert(error.message);
      $shareLocButton.removeAttribute('disabled');
    });
  }
});

socket.emit('join', {username, room}, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});