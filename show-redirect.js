const { makeRedirectUri } = require("expo-auth-session");

// Prints the Expo proxy redirect URI to register in Google Cloud
console.log(makeRedirectUri({ useProxy: true }));
