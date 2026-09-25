# StudyMate

AI-powered study assistant for a B.Sc. Computer Science mini project.

Students can register, upload PDF notes, and generate summaries, quizzes, flashcards and chat answers from those notes. An admin panel is included for user and note management.

## Technology Stack

- TypeScript
- Next.js (App Router and API Routes)
- Tailwind CSS
- MongoDB Driver
- NextAuth and bcrypt
- pdf-parse
- Groq API

## How to Run

1. Copy `.env.example` to `.env.local` and fill in:

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GROQ_API_KEY`

2. Install packages:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

Open http://localhost:3000

## Default Admin

On first database connection, StudyMate creates an admin account from:

- `ADMIN_EMAIL` (default: `admin@studymate.local`)
- `ADMIN_PASSWORD` (default: `Admin@123`)

Change these values before any real use.

Admin login page: `/admin/login`

## Student Flow

1. Register at `/register`
2. Login at `/login`
3. Upload a PDF in My Notes
4. Open AI Summary, AI Quiz, AI Flashcards or Study Chat
5. Select the uploaded document and generate results

## Security Notes

- Passwords are hashed with bcrypt
- API routes check the NextAuth session
- Students can only access their own documents
- Admin pages and admin APIs require the admin role
- Groq API keys stay on the server
