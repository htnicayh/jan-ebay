module.exports = {
  apps : [{
    name: 'jan-ebay',
    script: 'dist/main.js',
    append_env_to_name: true,
    instance: 'max',
    autorestart: true,
    watch: true,
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
      key  : '/path/to/ssh-key.pem',
      user : 'USER',
      host : 'HOST',
      ref  : 'origin/master',
      repo : 'https://git.jancargo.com/phuongkhang/ebay-us-module.git',
      path : '/jan-ebay',
      'post-deploy': 'npm install & npm run build && pm2 reload devops-tools/ecosystem.config.js --env production'
    },
    development: {
      key  : '/path/to/ssh-key.pem',
      user : 'USER',
      host : 'HOST',
      ref  : 'origin/test',
      repo : 'https://git.jancargo.com/phuongkhang/ebay-us-module.git',
      path : '/jan-ebay',
      'post-deploy': 'npm install && npm run build && pm2 reload devops-tools/ecosystem.config.js --env development'
    }
  }
};
