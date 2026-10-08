# Gator - Blog Aggregator in TypeScript

Gator is a multi-user CLI RSS feed aggregator built in TypeScript and PostgreSQL.

## Prerequisites
- Node.js (v18+)
- PostgreSQL

## Configuration
Gator stores user session and database configuration in `~/.gatorconfig.json`:
```json
{
  "dbUrl": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable",
  "currentUserName": "boots"
}
```

## Available Commands
- `npm run start login <username>`: Log in as an existing user
- `npm run start register <username>`: Register and switch to a new user
- `npm run start reset`: Reset the database and clear all users/feeds
- `npm run start users`: List all registered users
- `npm run start agg`: Fetch and aggregate RSS feeds
- `npm run start addfeed <name> <url>`: Add a new RSS feed
- `npm run start feeds`: List all registered feeds
- `npm run start follow <url>`: Follow an existing feed
- `npm run start following`: List followed feeds for the current user
- `npm run start unfollow <url>`: Unfollow a feed
