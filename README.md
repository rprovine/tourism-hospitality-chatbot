# LeniLani Tourism & Hospitality AI Chatbot

🌺 **Enterprise-grade AI chatbot platform for Hawaii's tourism and hospitality industry**

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13-2D3748)](https://www.prisma.io/)
[![Claude AI](https://img.shields.io/badge/Claude-3.5-purple)](https://anthropic.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Overview

LeniLani is a production-ready, white-label AI chatbot SaaS platform specifically designed for Hawaii's hospitality industry. Powered by Anthropic's Claude AI, it provides intelligent, multilingual customer service 24/7, helping hotels, resorts, and tour operators enhance guest experiences while reducing operational costs by up to 70%.

### 🏆 Why Choose LeniLani?

- **Claude AI Advantage** - Superior to generic chatbots with Anthropic's advanced models
- **85% Automation Rate** - Handle most guest inquiries automatically
- **15-30% More Direct Bookings** - Reduce OTA commissions
- **ROI in 60 Days** - Proven cost savings and revenue increase

## ✨ Key Features

### Core Capabilities
- 🤖 **Claude 3.5 Integration** - Haiku for Starter, Sonnet for Professional+
- 💼 **Multi-Tenant SaaS** - Secure data isolation per business
- 🎨 **White-Label Solution** - Full branding customization
- 📊 **Executive Analytics** - ROI tracking, strategic insights
- 🔐 **Enterprise Security** - JWT auth, bcrypt, rate limiting
- 💳 **Flexible Billing** - Monthly/annual with 20-25% discounts
- 🌏 **10+ Languages** - Based on tier selection
- 📱 **Mobile Responsive** - Perfect on all devices
- 📧 **Email Automation** - Welcome, billing, usage alerts
- 🔄 **API Access** - RESTful API for integrations

### Tier Features

| Feature | Starter ($299) | Professional ($699) | Premium ($2,499) | Enterprise |
|---------|---------------|-------------------|------------------|------------|
| Conversations | 1,000/mo | Unlimited | Unlimited | Unlimited |
| AI Model | Claude Haiku | Claude Sonnet | Claude Sonnet+ | Custom |
| Languages | English | English & Japanese | Choose 5 | 10+ |
| Knowledge Base | 100 Q&As | Unlimited Q&As | Document Learning | Multi-property |
| Support | Email | 24/7 Priority | Dedicated Manager | Success Team |
| Setup | Instant | Instant | 2-3 days | 5-10 days |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Anthropic API Key (for Claude AI)
- SendGrid API Key (for emails) or SMTP credentials

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
   # Edit .env with your API keys
   ```

4. **Initialize database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-secret-key-minimum-32-chars"

# Claude AI
ANTHROPIC_API_KEY="sk-ant-..."

# Email (Choose one)
SENDGRID_API_KEY="SG...."  # Recommended
# OR
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your@email.com"
SMTP_PASS="app-password"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Optional Integrations

- **HubSpot** - Payment processing
- **Stripe** - Alternative payments
- **Google Analytics** - Usage tracking
- **Sentry** - Error monitoring

## 📁 Project Structure

```
tourism-hospitality-chatbot/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── (public)/          # Public pages
├── components/            # React components
│   ├── admin/            # Admin UI components
│   ├── chatbot/          # Chat widget
│   └── pricing/          # Pricing components
├── lib/                   # Core libraries
│   ├── ai/               # Claude AI integration
│   ├── auth/             # Authentication
│   ├── email/            # Email services
│   └── data/             # Data models
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🔐 Security

### Best Practices Implemented

- ✅ **Authentication**: JWT with secure httpOnly cookies
- ✅ **Password Security**: Bcrypt with salt rounds
- ✅ **Rate Limiting**: API request throttling
- ✅ **Input Validation**: Zod schema validation
- ✅ **SQL Injection Prevention**: Prisma ORM
- ✅ **XSS Protection**: React automatic escaping
- ✅ **CORS Configuration**: Proper origin validation
- ✅ **Environment Variables**: Sensitive data isolation
- ✅ **Tier-Based Access Control**: Feature gating

### Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS for your domain
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Regular dependency updates
- [ ] Implement backup strategy

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t lenilani-chatbot .
docker run -p 3000:3000 --env-file .env lenilani-chatbot
```

### Traditional Hosting

```bash
npm run build
npm start
```

## 📊 API Documentation

### Authentication

```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Chat API

```bash
POST /api/chat
{
  "message": "string",
  "sessionId": "string",
  "tier": "starter|professional|premium|enterprise"
}
```

### Knowledge Base

```bash
GET /api/knowledge-base
POST /api/knowledge-base
PUT /api/knowledge-base/:id
DELETE /api/knowledge-base/:id
```

### Admin

```bash
GET /api/admin/analytics
GET /api/admin/conversations
POST /api/admin/settings
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📈 Performance

- **Response Time**: < 1 second average
- **Uptime**: 99.9% SLA (Premium+)
- **Concurrent Users**: 10,000+
- **Message Throughput**: 1,000/minute

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 💬 Support

- **Documentation**: [docs.lenilani.com](https://docs.lenilani.com)
- **Email**: support@lenilani.com
- **Discord**: [Join our community](https://discord.gg/lenilani)

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) - Claude AI
- [Vercel](https://vercel.com) - Hosting
- [Next.js](https://nextjs.org) - Framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Prisma](https://prisma.io) - Database ORM

---

Built with ❤️ in Hawaii by LeniLani Consulting