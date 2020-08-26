module.exports = {
  webpackDevMiddleware: config => {
    // poll all the different files from our project
    // directory automatically every 300ms
    config.watchOptions.poll = 300;
    return config;
  }
};