const { socketURL, accessToken } = require(`../env/${process.env.ENV}.js`);
const io = require("socket.io-client");
const { handleCreateEvent, handleAppointmentCreateEvent, handleUpdateEvent, handleDeleteEvent } = require('../controllers/socket');

const socket = io.connect(socketURL, {
    query: `access_token=${accessToken}`,
    transports: ["websocket"],
});

module.exports = () => {
    // client.on('event', data => { /* … */ });

    socket.on('connect', (s) => {
        console.log("We are listening socket.")
    });

    socket.on('error', (error) => {
        console.log(`Socket error: ${error}`);
    });

    socket.on('mobimed:App\\Events\\EntityWasCreated', (data) => {
        handleCreateEvent(data);
    });

    socket.on('mobimed:App\\Events\\AppointmentWasCreated', (data) => {
        handleAppointmentCreateEvent(data);
    });

    socket.on('mobimed:App\\Events\\EntityWasUpdated', (data) => {
        handleUpdateEvent(data);
    });

    socket.on("mobimed:App\\Events\\EntityWasDeleted", (data) => {
        handleDeleteEvent(data);
    });

}


