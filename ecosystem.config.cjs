module.exports = {
  apps: [{
    name: 'justapdf',
    script: 'backend/start.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production', HOST: '127.0.0.1', PORT: Number(process.env.PORT || 3000) },
    time: true,
    kill_timeout: 10000,
    listen_timeout: 10000
  }]
};
