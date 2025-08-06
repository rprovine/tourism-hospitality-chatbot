# LeniLani Tourism & Hospitality AI Chatbot

🌺 **AI-powered customer service chatbot solution for Hawaii's tourism and hospitality industry**

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Overview

LeniLani Tourism & Hospitality AI Chatbot is a white-label SaaS solution designed specifically for Hawaii's hospitality businesses. It provides intelligent, 24/7 customer service through AI-powered chat interfaces, helping hotels, tour operators, and vacation rentals enhance guest experiences while reducing operational costs.

### Key Features

- 🤖 **Intelligent AI Responses** - Context-aware conversations with guests
- 💼 **Multi-Tenant Architecture** - Supports multiple businesses with data isolation
- 🎨 **Customizable Branding** - White-label solution with custom colors and messaging
- 📊 **Analytics Dashboard** - Track conversations, satisfaction, and metrics
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 💳 **Tiered Pricing** - Starter ($299/mo) and Professional ($899/mo) plans
- 🌏 **Multi-Language Support** - Ready for international guests
- 📱 **Responsive Design** - Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tourism-hospitality-chatbot.git
   cd tourism-hospitality-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tourism-hospitality-chatbot/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── chat/           # Chat conversation endpoints
│   │   ├── conversations/  # Conversation management
│   │   └── analytics/      # Analytics endpoints
│   ├── admin/              # Admin dashboard
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Landing page
├── components/              # React components
│   ├── chatbot/            # Chat widget components
│   └── ui/                 # Reusable UI components
├── lib/                     # Utility libraries
│   ├── auth/               # Authentication utilities
│   ├── data/               # Static data
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
├── prisma/                  # Database schema
│   └── schema.prisma       # Prisma schema definition
├── public/                  # Static assets
└── styles/                  # Global styles
```

## 💼 Pricing Tiers

### Starter Plan - $299/month
- ✅ Up to 1,000 conversations/month
- ✅ Basic AI responses
- ✅ Email support
- ✅ Standard analytics
- ✅ Single language

### Professional Plan - $899/month
- ✅ Unlimited conversations
- ✅ Advanced AI with context awareness
- ✅ Priority phone & email support
- ✅ Advanced analytics & insights
- ✅ Multi-language support
- ✅ Custom integrations
- ✅ API access
- ✅ White-label options

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key (for payments) | No |
| `SMTP_HOST` | Email server host | No |
| `SMTP_PORT` | Email server port | No |
| `SMTP_USER` | Email username | No |
| `SMTP_PASS` | Email password | No |

### Database Schema

The application uses Prisma ORM with the following main models:

- **Business** - Registered businesses/organizations
- **Subscription** - Subscription and billing information
- **Conversation** - Chat conversation sessions
- **Message** - Individual chat messages
- **KnowledgeBase** - Q&A pairs for AI responses
- **Analytics** - Usage and performance metrics

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma db push   # Push schema changes to database
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open Prisma Studio GUI

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new business
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PATCH /api/auth/profile` - Update profile

#### Chat
- `POST /api/chat` - Send message and get AI response
- `GET /api/conversations` - Get conversations
- `PATCH /api/conversations` - Update conversation (satisfaction, resolved status)

#### Analytics
- `GET /api/analytics` - Get analytics data
- `POST /api/analytics` - Generate daily analytics

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t lenilani-chatbot .

# Run container
docker run -p 3000:3000 --env-file .env lenilani-chatbot
```

### Traditional Hosting

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 📈 Roadmap

- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Advanced knowledge base management
- [ ] Conversation export (CSV/PDF)
- [ ] Mobile app (React Native)
- [ ] Voice assistant integration
- [ ] Webhook support
- [ ] Advanced AI training interface
- [ ] Multi-tenant admin portal
- [ ] Real-time collaboration features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Hawaii's hospitality industry
- Powered by Next.js and OpenAI
- UI components from shadcn/ui
- Icons from Lucide React

## 📞 Support

For support, email support@lenilani.com or open an issue in this repository.

---

<p align="center">Made with ❤️ for Hawaii's Tourism Industry</p>