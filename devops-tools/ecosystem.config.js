module.exports = {
  apps : [{
    name: 'jan-ebay',
    script: 'dist/main.js',
    append_env_to_name: true,
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
      user : 'ubuntu',
      host : '44.212.43.7',
      ref  : 'origin/master',
      repo : 'git@github.com:htnicayh/jan-ebay.git',
      path : '/home/ubuntu/jan-ebay',
      'post-deploy': 'yarn install & yarn build && pm2 reload devops-tools/ecosystem.config.js --env production'
    },
    development: {
      key  : '~/Downloads/macbook-localhost.pem',
      user : 'ubuntu',
      host : '18.212.26.255',
      ref  : 'origin/test',
      repo : 'git@github.com:htnicayh/jan-ebay.git',
      path : '/home/ubuntu/jan-ebay',
      'post-deploy': 'yarn install && pm2 && yarn build && startOrRestart devops-tools/ecosystem.config.js --env development'
    }
  }
};
