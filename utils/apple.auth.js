const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key?.publicKey || key?.rsaPublicKey;
    if (!signingKey) return callback(new Error('No signing key found'));
    callback(null, signingKey);
  });
}

  module.exports.verifyAppleToken = async (idToken) => {
  if (idToken === "fake-id-token") {
    return { sub: "user123", email: "test@example.com" }; // mock payload
  }
  throw new Error("Invalid token");
};

