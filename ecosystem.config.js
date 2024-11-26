module.exports = {
  apps: [{
    name: "clinical-trial-symphony",
    script: "./server.js",
    instances: 1,
    exec_mode: "cluster",
    node_args: "--max-old-space-size=8192",
    env: {
      NODE_ENV: "production",
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
} 