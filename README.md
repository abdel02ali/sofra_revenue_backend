# Coffee Shop Backend API

Backend server for Coffee Shop Revenue Calculator using Express.js and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coffee_shop
NODE_ENV=development
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coffee_shop
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Entries
- `GET /api/entries` - Get all entries
- `GET /api/entries/:id` - Get entry by ID
- `POST /api/entries` - Create new entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry
- `DELETE /api/entries` - Delete all entries

### Customer Credits
- `GET /api/credits` - Get all credits
- `GET /api/credits/by-entry?date=YYYY-MM-DD&group=Group&time_group=7am to 2pm` - Get credits by entry criteria
- `GET /api/credits/:id` - Get credit by ID
- `POST /api/credits` - Create new credit
- `PUT /api/credits/:id` - Update credit
- `DELETE /api/credits/:id` - Delete credit
- `DELETE /api/credits` - Delete all credits

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Health Check
- `GET /api/health` - Check server status

