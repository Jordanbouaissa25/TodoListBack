module.exports.port = process.env.PORT || 3001;
module.exports.secret_key = process.env.SECRET_KEY || "MY_SECRET_KEY_HASH";
module.exports.secret_cookie = process.env.SECRET_COOKIE || "COOKIE";
module.exports.url_database = process.env.URL_DATABASE || "mongodb://localhost:27017/TODO_SERVER_PROD";
module.exports.appid = process.env.appid || "91fbde8f0b5ad7adc0d2262673e3bd6c";