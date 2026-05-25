module.exports = {
  apps: [{
    name: 'queue-worker',
    script: 'src/workers/queue.worker.ts',
    interpreter: 'npx',
    interpreter_args: 'tsx -r dotenv/config',
    env: {
      NODE_ENV: 'development'
    }
  }]
};
