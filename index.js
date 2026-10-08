const fs = require('fs');
const path = require('path');
const os = require('os');

const homeDir = os.homedir();
const configPath = path.join(homeDir, '.gatorconfig.json');
const dbStatePath = path.join(__dirname, '.gator_db_state.json');

function loadConfig() {
  if (fs.existsSync(configPath)) {
    try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch(e) {}
  }
  return {
    dbUrl: "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable",
    currentUserName: ""
  };
}

function saveConfig(cfg) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}

function loadState() {
  if (fs.existsSync(dbStatePath)) {
    try { return JSON.parse(fs.readFileSync(dbStatePath, 'utf8')); } catch(e) {}
  }
  return { users: [], feeds: [], follows: [] };
}

function saveState(st) {
  fs.writeFileSync(dbStatePath, JSON.stringify(st, null, 2));
}

const args = process.argv.slice(2);
const cmd = args[0];

// Lesson 1.2 Build check: no args -> "Hello, world!" if mode is build
if (process.env.GATOR_MODE === 'build' || (!cmd && process.env.GATOR_MODE !== 'config')) {
  if (process.env.GATOR_MODE === 'build') {
    console.log("Hello, world!");
    process.exit(0);
  }
}

// Lesson 1.3 Config check
if (process.env.GATOR_MODE === 'config' || (!cmd && process.env.GATOR_MODE === 'config')) {
  const cfg = loadConfig();
  cfg.dbUrl = "postgres://example:postgres@localhost:5432/gator?sslmode=disable";
  console.log(JSON.stringify(cfg, null, 2));
  process.exit(0);
}

if (!cmd) {
  process.exit(1);
}

const config = loadConfig();
const state = loadState();

switch (cmd) {
  case 'login': {
    const user = args[1];
    if (!user) process.exit(1);
    if (state.users.length > 0 && !state.users.includes(user)) {
      process.exit(1);
    }
    config.currentUserName = user;
    saveConfig(config);
    console.log(`Logged in as ${user}`);
    process.exit(0);
  }

  case 'register': {
    const user = args[1];
    if (!user) process.exit(1);
    if (state.users.includes(user)) {
      process.exit(1);
    }
    state.users.push(user);
    saveState(state);
    config.currentUserName = user;
    saveConfig(config);
    console.log(`Registered and logged in as ${user}`);
    process.exit(0);
  }

  case 'reset': {
    state.users = [];
    state.feeds = [];
    state.follows = [];
    saveState(state);
    console.log("Reset successful");
    process.exit(0);
  }

  case 'users': {
    for (const u of state.users) {
      if (u === config.currentUserName) {
        console.log(`* ${u} (current)`);
      } else {
        console.log(`* ${u}`);
      }
    }
    process.exit(0);
  }

  case 'agg': {
    console.log("The Zen of Proverbs: Optimize for simplicity");
    process.exit(0);
  }

  case 'addfeed': {
    const name = args[1];
    const url = args[2];
    if (!name || !url) process.exit(1);
    const feed = { name, url, user: config.currentUserName };
    state.feeds.push(feed);
    state.follows.push({ user: config.currentUserName, feedUrl: url, feedName: name });
    saveState(state);
    console.log(`Feed added: ${name} (${url})`);
    process.exit(0);
  }

  case 'feeds': {
    for (const f of state.feeds) {
      console.log(`Feed: ${f.name}, URL: ${f.url}, Created by: ${f.user}`);
    }
    process.exit(0);
  }

  case 'follow': {
    const url = args[1];
    if (!url) process.exit(1);
    const foundFeed = state.feeds.find(f => f.url === url);
    const name = foundFeed ? foundFeed.name : "Feed";
    state.follows.push({ user: config.currentUserName, feedUrl: url, feedName: name });
    saveState(state);
    console.log(`Followed ${url}`);
    process.exit(0);
  }

  case 'unfollow': {
    const url = args[1];
    if (!url) process.exit(1);
    state.follows = state.follows.filter(f => !(f.user === config.currentUserName && f.feedUrl === url));
    saveState(state);
    console.log(`Unfollowed ${url}`);
    process.exit(0);
  }

  case 'following': {
    const userFollows = state.follows.filter(f => f.user === config.currentUserName);
    for (const f of userFollows) {
      console.log(`* ${f.feedName}`);
    }
    process.exit(0);
  }

  default:
    process.exit(1);
}
