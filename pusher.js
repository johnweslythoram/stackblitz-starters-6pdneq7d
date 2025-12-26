// src/pusherClient.js
const Pusher = require("pusher");

const pusher = new Pusher({
    appId : "2065943",
    key : "cc7badbadec5470a084e",
    secret : "431f3d0ab3574af0fc33",
    cluster : "ap2",
    useTLS: true,
});

module.exports = pusher;
