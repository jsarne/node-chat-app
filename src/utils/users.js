const users = [];

const addUser = (user) => {
  const username = user.username.trim().toLowerCase();
  const room = user.room.trim().toLowerCase();
  if (!username || !room) {
    return {error: "Username and Room are required"}
  } 
  
  const existingUser = users.find((u) => u.room === room && u.username === username);
  if (existingUser) {
    return {error: "Username is in use"}
  }

  const newUser = {id: user.id, username, room}
  users.push(newUser);
  return {user};
}

const removeUser = (userId) => {
  const index = users.findIndex((u) => u.id === userId);
  if (index > -1) {
    return users.splice(index, 1)[0];
  }
}

const getUser = (userId) => {
  return users.find((u) => u.id === userId);
}

const getUsersInRoom = (room) => {
  const rm = room.trim().toLowerCase();
  return users.filter((u) => u.room === rm);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}