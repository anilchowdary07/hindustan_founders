# Founder Network

A social networking platform for founders and entrepreneurs to connect, share ideas, and collaborate.

## Features

- User authentication and profiles
- News feed with posts and comments
- Real-time messaging system with read receipts
- Networking and connections
- Notifications
- Job board and startup pitches
- Investor connections

## Development

### Prerequisites

- Node.js 20.x
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=your_database_url
   SESSION_SECRET=your_session_secret
   ```
4. Initialize the database:
   ```
   npm run db:init
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Deployment to Netlify

### Prerequisites

- Netlify account
- Git repository pushed to GitHub, GitLab, or Bitbucket

### Option 1: Using the Deployment Script

1. Make the deployment script executable:
   ```
   chmod +x deploy-to-netlify.sh
   ```

2. Run the deployment script:
   ```
   ./deploy-to-netlify.sh
   ```

3. Follow the prompts to log in to Netlify and select your site.

### Option 2: Manual Deployment

1. Install Netlify CLI locally:
   ```
   npm install --save-dev netlify-cli
   ```

2. Build the project:
   ```
   npm run build
   ```

3. Login to Netlify:
   ```
   npx netlify login
   ```

4. Initialize a new Netlify site (first time only):
   ```
   npx netlify init
   ```

5. Deploy to Netlify:
   ```
   npx netlify deploy --prod
   ```

### Option 3: Continuous Deployment via Netlify UI

1. Log in to the [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
6. Click "Deploy site"

### Environment Variables

Set the following environment variables in the Netlify dashboard:

- `DATABASE_URL`: Your database connection string (Neon, Supabase, or other PostgreSQL provider)
- `SESSION_SECRET`: A secure random string for session encryption
- `NODE_ENV`: Set to `production`

### Troubleshooting

- If you encounter CORS issues, check the allowed origins in your Netlify function
- For session persistence issues, verify your session configuration in the Netlify function
- If the API endpoints return 404, ensure the redirects in netlify.toml are correctly configured

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/logout` - Logout the current user
- `GET /api/auth/me` - Get the current user's information

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update a user
- `GET /api/users/:id/profile` - Get a user's profile

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get a specific post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post

### Connections

- `GET /api/connections` - Get all connections for the current user
- `POST /api/connections` - Create a new connection request
- `PUT /api/connections/:id` - Update a connection status
- `GET /api/connections/requests` - Get connection requests for the current user
- `GET /api/connections/suggestions` - Get connection suggestions for the current user

### Messaging

- `GET /api/conversations` - Get all conversations for the current user
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/:id` - Get a specific conversation
- `GET /api/conversations/:id/messages` - Get messages for a conversation
- `POST /api/conversations/:id/messages` - Send a message in a conversation
- `PATCH /api/messages/:id/read` - Mark a message as read

### Notifications

- `GET /api/notifications` - Get all notifications for the current user
- `PATCH /api/notifications/:id/read` - Mark a notification as read

### Jobs

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/:id` - Get a specific job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job

### Pitches

- `GET /api/pitches` - Get all pitches
- `POST /api/pitches` - Create a new pitch
- `GET /api/pitches/:id` - Get a specific pitch
- `PUT /api/pitches/:id` - Update a pitch
- `DELETE /api/pitches/:id` - Delete a pitch

## License

MIT