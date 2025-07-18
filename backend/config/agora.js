const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const generateRtcToken = (channelName, uid, role = RtcRole.PUBLISHER) => {
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  
  // Set token expiration time (in seconds)
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
  // Build the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID, 
    appCertificate, 
    channelName, 
    uid, 
    role, 
    privilegeExpiredTs
  );
  
  return token;
};

module.exports = { generateRtcToken };
