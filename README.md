# School Management API

This is a Node.js API built using Express.js and Prisma (PostgreSQL). It provides endpoints to add schools and list them by proximity to specific geographic coordinates using the Haversine distance algorithm.

## Prerequisites
- Node.js
- `pnpm`
- A PostgreSQL database (e.g., Supabase, Neon, or local PostgreSQL)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase (or any PostgreSQL) database URL and standard port:
   ```bash
   cp .env.example .env
   ```

3. **Initialize the Database:**
   - Run Prisma db push to apply the schema to your database (Make sure `DATABASE_URL` is set in your `.env`):
   ```bash
   npx prisma db push
   ```
   - Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

4. **Start the Application:**
   ```bash
   node src/index.js
   ```
   The API will be accessible at `http://localhost:3000`.

## API Endpoints

### 1. Add a School
- **Endpoint**: `/addSchool`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "name": "Green Valley High",
    "address": "123 Oak Street",
    "latitude": 37.7749,
    "longitude": -122.4194
  }
  ```

### 2. List Schools
- **Endpoint**: `/listSchools`
- **Method**: `GET`
- **Query Parameters**:
  - `latitude`: User's latitude (e.g., `37.7500`)
  - `longitude`: User's longitude (e.g., `-122.4000`)
- **Example**:
  ```
  GET /listSchools?latitude=37.7500&longitude=-122.4000
  ```

## Testing Configuration
Included in the repository is a Postman collection (`School_Management_API.postman_collection.json`). You can import this file into Postman and test the APIs easily. Update the `baseUrl` variable within Postman depending on your deployment URL.

## Deployment Options
You can deploy this API to various platforms such as Render, Railway, or Heroku.
- For **Render**: Connect the GitHub repository and specify `pnpm install && npx prisma db push && npx prisma generate` as build command and `node src/index.js` as start command.
- Ensure the `DATABASE_URL` environment variable is exposed securely in your hosting platform.
