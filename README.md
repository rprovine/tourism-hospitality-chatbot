# LeniLani Tourism & Hospitality AI Chatbot

🌺 **AI-powered customer service chatbot solution for Hawaii's tourism and hospitality industry**

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Overview

LeniLani Tourism & Hospitality AI Chatbot is a white-label SaaS solution designed specifically for Hawaii's hospitality businesses. It provides intelligent, 24/7 customer service through AI-powered chat interfaces, helping hotels, tour operators, and vacation rentals enhance guest experiences while reducing operational costs.

### Key Features

- 🤖 **Claude AI Integration** - Powered by Anthropic's Claude 3.5 Sonnet/Haiku for sophisticated, context-aware responses
- 💼 **Multi-Tenant Architecture** - Supports multiple businesses with data isolation
- 🎨 **Customizable Branding** - White-label solution with custom colors and messaging
- 📊 **Analytics Dashboard** - Track conversations, satisfaction, and metrics
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 💳 **4-Tier Pricing** - Starter, Professional, Premium, and Enterprise plans
- 🌏 **Multi-Language Support** - Up to 10+ languages depending on tier
- 📱 **Responsive Design** - Works seamlessly on all devices
- ✨ **Interactive Demos** - Live tier demonstrations with mock business data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Anthropic API Key (recommended for enhanced AI responses)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rprovine/tourism-hospitality-chatbot.git
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
   ANTHROPIC_API_KEY="your-claude-api-key"
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
│   └── page.tsx            # Landing page with interactive demos
├── components/              # React components
│   ├── chatbot/            # Chat widget components
│   └── ui/                 # Reusable UI components
├── lib/                     # Utility libraries
│   ├── ai/                 # Claude AI integration
│   ├── auth/               # Authentication utilities
│   ├── data/               # Static data & mock business data
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
├── prisma/                  # Database schema
│   └── schema.prisma       # Prisma schema definition
├── public/                  # Static assets
└── styles/                  # Global styles
```

## 💼 Pricing Tiers

### 🌟 Starter Plan - $299/month
- ✅ Up to 1,000 conversations/month
- ✅ Basic FAQ responses
- ✅ English only
- ✅ Email support
- ✅ Standard analytics
- ⚠️ Limited AI capabilities - directs complex queries to phone support

### 🚀 Professional Plan - $899/month *(Most Popular)*
- ✅ Unlimited conversations
- ✅ Real-time booking assistance
- ✅ 2 languages (English + Japanese)
- ✅ Advanced AI with context awareness
- ✅ Priority phone & email support
- ✅ Advanced analytics & insights
- ✅ Restaurant reservations
- ✅ Activity recommendations

### ✨ Premium Plan - $2,499/month
- ✅ Everything in Professional, plus:
- ✅ Luxury concierge-level service
- ✅ 5 languages (English, Japanese, Chinese, Spanish, Korean)
- ✅ VIP guest experiences (yacht charters, helicopter tours)
- ✅ Personalized recommendations
- ✅ Suite and luxury accommodation booking
- ✅ Private chef and spa arrangements
- ✅ White-glove service coordination

### 🏢 Enterprise Plan - Custom Pricing
- ✅ Everything in Premium, plus:
- ✅ Multi-property management across 7+ locations
- ✅ 10+ languages with cultural customization
- ✅ Group and conference booking management
- ✅ Corporate travel arrangements
- ✅ Real-time business analytics (RevPAR, ADR, occupancy)
- ✅ Loyalty program integration (125,000+ members)
- ✅ Advanced revenue optimization
- ✅ Dedicated account management
- ✅ Custom integrations and API access

## 🎭 Interactive Demos

The landing page features live demonstrations of each tier's capabilities:

- **Demo Disclaimer**: All responses clearly indicate they're using sample data
- **Realistic Mock Data**: Shows actual hotel scenarios (budget inn → luxury resort → hotel chain)
- **Language Capabilities**: Demonstrates multilingual support for each tier
- **Business Intelligence**: Enterprise tier shows real-time analytics and revenue data

Try the demos at [http://localhost:3000](http://localhost:3000) - click on different tier demo buttons to see the capabilities in action!

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `ANTHROPIC_API_KEY` | Claude API key for enhanced AI | Recommended |
| `STRIPE_SECRET_KEY` | Stripe API key (for payments) | No |
| `SMTP_HOST` | Email server host | No |
| `SMTP_PORT` | Email server port | No |
| `SMTP_USER` | Email username | No |
| `SMTP_PASS` | Email password | No |

### AI Models by Tier

- **Starter**: Claude 3.5 Haiku (fast, economical, 200 tokens)
- **Professional**: Claude 3.5 Sonnet (balanced, 500 tokens)
- **Premium**: Claude 3.5 Sonnet (advanced, 1000 tokens)
- **Enterprise**: Claude 3.5 Sonnet (maximum capability, 2000 tokens)

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
- `POST /api/chat` - Send message and get AI response (supports all 4 tiers)
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

### In Progress
- [x] 4-tier pricing system with realistic demos
- [x] Multi-language support (up to 10+ languages)
- [x] Claude AI integration with tier-specific models
- [x] Interactive demo system with mock business data

### Upcoming Features
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Advanced knowledge base management
- [ ] Conversation export (CSV/PDF)
- [ ] Real-time chat features with WebSockets
- [ ] Mobile-responsive PWA
- [ ] Advanced analytics dashboard
- [ ] Webhook support for integrations
- [ ] Voice assistant integration
- [ ] Multi-tenant admin portal

## 🎯 Demo Mode Features

The application includes a comprehensive demo system that showcases tier differences:

- **Mock Business Data**: Realistic hotel, resort, and hotel chain data
- **Tier-Specific Responses**: Each tier demonstrates different capabilities
- **Demo Disclaimers**: Clear messaging that production uses actual business data
- **Language Demonstrations**: Shows multilingual capabilities per tier
- **Business Intelligence**: Enterprise tier includes analytics and revenue data

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
- Powered by Next.js 15 and Anthropic Claude 3.5
- UI components from shadcn/ui
- Icons from Lucide React
- Animations by Framer Motion

## 📞 Support

For support, email support@lenilani.com or open an issue in this repository.

---

<p align="center">Made with ❤️ for Hawaii's Tourism Industry</p>