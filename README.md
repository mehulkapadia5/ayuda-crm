# Ayuda CRM

A modern Customer Relationship Management system built with Next.js, Supabase, and shadcn/ui components.

## Features

- **Lead Management**: Create, view, and manage leads
- **Activity Tracking**: Log and track all lead interactions
- **Follow-up System**: Schedule and manage follow-ups
- **WhatsApp Integration**: Send messages directly from the CRM
- **Google Forms Integration**: Automatically create leads from form submissions
- **Dashboard Analytics**: View key metrics and conversion data
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Icons**: Tabler Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ayuda-crm.git
   cd ayuda-crm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database**:
   - Run the SQL migrations in `supabase/migrations/`
   - Or apply them manually in your Supabase dashboard

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
my-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── leads/             # Leads pages
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── leads/            # Lead-specific components
│   └── ...
├── lib/                  # Utility functions
├── supabase/             # Database migrations
└── ...
```

## Key Components

- **Dashboard**: Overview of metrics, conversion matrix, and follow-ups
- **Leads Table**: List and filter all leads
- **Lead Detail**: Individual lead view with activities and actions
- **Add Lead Dialog**: Form to create new leads
- **Follow-up System**: Schedule and manage follow-ups
- **Activity Feed**: Timeline of all lead interactions

## Google Forms Integration

The CRM includes automated integration with Google Forms:

- **Webhook Endpoint**: `/api/webhooks/google-forms`
- **Automatic Lead Creation**: Form submissions create leads automatically
- **Duplicate Prevention**: Checks for existing emails
- **Activity Tracking**: Logs form submissions as activities

See [GOOGLE-FORMS-INTEGRATION.md](./GOOGLE-FORMS-INTEGRATION.md) for setup instructions.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## Database Schema

### Tables

- **leads**: Lead information (name, email, phone, source, stage)
- **activities**: Activity log (type, details, timestamp)
- **follow_ups**: Follow-up scheduling (date, notes, completion status)

### Migrations

- `0001_init.sql`: Initial schema with leads and activities tables
- `0002_follow_ups.sql`: Follow-ups table and triggers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation files
- Review the troubleshooting sections
- Open an issue on GitHub
