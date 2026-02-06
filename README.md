# Pokemon Viewer

A modern web application for browsing and viewing Pokemon data, built with Next.js and powered by a comprehensive Pokemon database.

## Features

- **Pokemon Grid View**: Browse Pokemon in a responsive grid layout on the homepage
- **Detailed Pokemon Pages**: View individual Pokemon details including stats, moves, and sprites
- **Fast Search and Navigation**: Quick access to Pokemon details via dynamic routing
- **Responsive Design**: Optimized for desktop and mobile devices using Tailwind CSS
- **Dark Mode Support**: Built-in dark mode compatibility
- **API Integration**: RESTful API endpoints for Pokemon data

## Technical Specifications

### Tech Stack

- **Framework**: Next.js 16.1.2 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM 7.2.0
- **UI Components**: React 19.2.3
- **Deployment**: Vercel-ready

### Architecture

- **Frontend**: Server-side rendered React components with Next.js App Router
- **Backend**: API routes for data fetching
- **Database**: Relational database schema based on Pokemon data models
- **Styling**: Utility-first CSS with Tailwind CSS
- **Type Safety**: Full TypeScript coverage

### Database Schema

The application uses a comprehensive Pokemon database schema including:

- Pokemon species, forms, and variants
- Moves, abilities, and items
- Types, stats, and evolution chains
- Locations, encounters, and game data
- Multi-language support for names and descriptions

### API Endpoints

- `GET /api/pokemon` - Retrieve list of Pokemon (limited to 20 for performance)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pokemon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Ensure PostgreSQL is running
   - Configure your database connection in `.env`
   - Run Prisma migrations:
     ```bash
     npx prisma migrate dev
     ```
   - Generate Prisma client:
     ```bash
     npx prisma generate
     ```

4. **Extract sprites**
   - Unzip `public/sprites.zip` to `public/sprites/` directory

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

- **Homepage**: View a grid of the first 20 Pokemon
- **Pokemon Details**: Click on any Pokemon to view detailed information including moves
- **Navigation**: Use browser back/forward or direct URLs (`/pokemon/{id}`)

## Database and Assets

The database schema and Pokemon data are sourced from the [PokeAPI](https://github.com/PokeAPI/pokeapi) project. PokeAPI is a comprehensive RESTful API for Pokemon data.

- **Database**: The Prisma schema is based on the PokeAPI database structure
- **Sprites**: Pokemon sprites are extracted from PokeAPI's sprite assets

## API

### Get Pokemon List
```http
GET /api/pokemon
```

Returns a JSON array of Pokemon objects with basic information.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [PokeAPI](https://github.com/PokeAPI/pokeapi) - The source of all Pokemon data and sprites
- [Next.js](https://nextjs.org) - The React framework used
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Vercel](https://vercel.com) - Deployment platform
