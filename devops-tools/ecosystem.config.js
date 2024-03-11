module.exports = {
  apps : [{
    name: 'jan-ebay',
    script: 'dist/main.js',
    instance: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }],

  deploy : {
    production : {
      key  : '~/Downloads/macbook-localhost.pem',
      user : 'root',
      host : '44.212.43.7',
      ref  : 'git-origin/master',
      repo : 'git@github.com:htnicayh/jan-ebay.git',
      path : '/var/www/html/demo-pm2',
      'post-deploy': 'yarn install && pm2 startOrRestart ecosystem.config.js --env production'
    },
    development: {
      key  : '~/Downloads/macbook-localhost.pem',
      user : 'root',
      host : '18.212.26.255',
      ref  : 'git-origin/test',
      repo : 'git@github.com:htnicayh/jan-ebay.git',
      path : '/var/www/html/demo-pm2',
      'post-deploy': 'yarn install && pm2 startOrRestart ecosystem.config.js --env development'
    }
  }
};
