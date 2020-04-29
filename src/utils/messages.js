const generateMessage = (text, user) => {
  return {
    text,
    createdAt: new Date().getTime(),
    username: user.username
  }
}

const generateLocationMessage = (url, user) => {
  return {
    url,
    createdAt: new Date().getTime(),
    username: user.username
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}