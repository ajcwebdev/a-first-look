module.exports = {
  apps : [{
    name: "ajcwebdev-pm2",
    script: "./index.js",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
