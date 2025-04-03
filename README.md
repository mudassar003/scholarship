# ScholarSync

ScholarSync is a comprehensive web application designed to help students and researchers efficiently manage scholarship applications, professor communications, and academic opportunities.

## Overview

This platform streamlines the scholarship application process by providing tools to:

- Track communication with professors
- Manage scholarship application deadlines
- Organize university and country information
- Monitor application statuses and follow-ups

Built with Next.js, React, TypeScript, and Supabase, ScholarSync offers a modern, responsive interface with real-time data synchronization.

## Key Features

### Email Tracking
- Monitor the status of emails sent to professors (Pending, Replied, Rejected)
- Set reminders for follow-ups
- Store email screenshots and proposal documents
- Receive notifications for emails requiring attention

### Scholarship Management
- Track application deadlines
- Filter scholarships by status and deadline
- Store detailed scholarship information
- Organize scholarships by country

### University and Country Organization
- Maintain a database of universities and their details
- Organize institutions by country
- Access university website links and contact information

### Dashboard Analytics
- View key metrics and insights
- Track response rates
- Monitor upcoming deadlines
- See distribution of applications by country

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Styling**: Tailwind CSS with custom components
- **Animation**: Framer Motion for smooth UI transitions
- **Icons**: Lucide Icons

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/scholarsync.git
   cd scholarsync
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
scholarsync/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── countries/        # Countries management
│   │   ├── dashboard/        # Dashboard and analytics
│   │   ├── notifications/    # Notification center
│   │   ├── professors/       # Professor communications
│   │   ├── scholarships/     # Scholarship management
│   │   └── universities/     # Universities database
│   ├── components/           # Shared React components
│   ├── services/             # API and service functions
│   ├── lib/                  # Utility libraries
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
└── ...config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.