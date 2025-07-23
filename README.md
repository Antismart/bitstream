# BitStream 🔥

> **Programmable Bitcoin Payment Streams with Smart Conditions and Oracle Integration**

BitStream is a revolutionary decentralized application built on the Internet Computer Protocol (ICP) that enables automated, conditional Bitcoin payments through programmable streams. Create recurring payments, implement complex financial logic, and integrate real-world data through oracles—all secured by the Internet Computer blockchain.

## 🌟 Key Features

### 🚀 **Automated Payment Streams**
- Create recurring Bitcoin payments (daily, weekly, monthly)
- Set start/end dates and payment amounts
- Real-time balance tracking and analytics

### 🧠 **Smart Conditions**
- Price-based triggers (pay when BTC > $100k)
- Time-based conditions (pay on specific dates)
- Oracle data integration (weather, stock prices, APIs)
- Complex logical operations (AND/OR conditions)

### 🔮 **Oracle Integration**
- Connect to external APIs and data feeds
- Price feeds from major exchanges
- Weather data, stock prices, and custom endpoints
- Failsafe mechanisms for unreliable data sources

### 🔐 **Internet Identity Authentication**
- Secure, passwordless authentication
- Privacy-preserving user management
- Seamless wallet integration

### 📊 **Advanced Analytics**
- Real-time payment tracking
- Cash flow projections
- Performance metrics and insights
- Visual charts and dashboards

## 🏗️ Architecture

BitStream is built with a modern, scalable architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   External      │
│   (Next.js)     │◄──►│   (Motoko)       │◄──►│   Oracles       │
│                 │    │                  │    │                 │
│ • React 19      │    │ • Payment Logic  │    │ • Price Feeds   │
│ • TypeScript    │    │ • Stream Mgmt    │    │ • Weather APIs  │
│ • Tailwind CSS  │    │ • User Auth      │    │ • Custom Data   │
│ • shadcn/ui     │    │ • Analytics      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Backend (Motoko Smart Contracts)
- **`server/paymentStream.mo`**: Core payment streaming logic with Bitcoin integration
- **`server/app.mo`**: Main application entry point and routing

### Frontend (Next.js Application)
- **Modern React 19** with TypeScript for type safety
- **Tailwind CSS** + **shadcn/ui** for beautiful, responsive design
- **Internet Computer integration** via @dfinity packages

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Blockchain** | Internet Computer Protocol (ICP) |
| **Backend** | Motoko Smart Contracts |
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Authentication** | Internet Identity |
| **Package Manager** | pnpm |
| **Development** | dfx (DFINITY SDK) |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **dfx** (DFINITY SDK) - [Installation Guide](https://internetcomputer.org/docs/current/developer-docs/setup/install/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Antismart/bitstream.git
   cd bitstream
   ```

2. **Install dependencies**
   ```bash
   # Install Motoko packages
   mops install
   
   # Install frontend dependencies
   cd client
   pnpm install
   ```

3. **Start local Internet Computer replica**
   ```bash
   dfx start --clean --background
   ```

4. **Deploy the canisters**
   ```bash
   dfx deploy
   ```

5. **Start the frontend development server**
   ```bash
   cd client
   pnpm dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 Usage Guide

### Creating Your First Payment Stream

1. **Connect with Internet Identity**
   - Click "Connect with Internet Identity"
   - Follow the authentication flow

2. **Navigate to Streams**
   - Go to Dashboard → Streams
   - Click "Create New Stream"

3. **Configure Your Stream**
   ```javascript
   {
     name: "Monthly Rent Payment",
     amount: "0.025", // BTC
     frequency: "monthly",
     recipient: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
     conditions: [
       {
         type: "price",
         operator: ">=",
         value: "95000", // USD
         oracle: "coinbase"
       }
     ]
   }
   ```

4. **Monitor and Manage**
   - Track payments in real-time
   - View analytics and cash flow
   - Pause/resume streams as needed

### Adding Oracle Conditions

BitStream supports various oracle types:

- **Price Oracles**: Coinbase, Binance, CoinGecko
- **Weather Data**: OpenWeatherMap
- **Custom APIs**: Any REST endpoint
- **Time-based**: Specific dates and intervals

## 🔧 Development

### Project Structure

```
bitstream/
├── dfx.json                 # IC project configuration
├── mops.toml               # Motoko package manager
├── server/                 # Backend (Motoko)
│   ├── app.mo             # Main application
│   └── paymentStream.mo   # Payment logic
├── client/                # Frontend (Next.js)
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── lib/             # API and utilities
│   └── hooks/           # Custom React hooks
└── README.md           # This file
```

### Development Commands

```bash
# Backend development
dfx start                    # Start local replica
dfx deploy                   # Deploy canisters
dfx canister call <name> <method>  # Call canister methods

# Frontend development
cd client
pnpm dev                     # Start dev server
pnpm build                   # Build for production
pnpm lint                    # Run ESLint
```

### Environment Variables

Create `client/.env.local`:

```env
NEXT_PUBLIC_CANISTER_ID_SERVER=your_backend_canister_id
DFX_NETWORK=local # or 'ic' for mainnet
```

## 🌐 Deployment

### Mainnet Deployment

1. **Switch to mainnet**
   ```bash
   dfx deploy --network ic
   ```

2. **Update frontend configuration**
   ```bash
   # Update canister IDs in client/.env.production
   NEXT_PUBLIC_CANISTER_ID_SERVER=your_mainnet_canister_id
   DFX_NETWORK=ic
   ```

3. **Build and deploy frontend**
   ```bash
   cd client
   pnpm build
   # Deploy to your preferred hosting (Vercel, Netlify, etc.)
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Write tests** (if applicable)
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [bitstream.app](https://bitstream.app) *(coming soon)*
- **Documentation**: [docs.bitstream.app](https://docs.bitstream.app) *(coming soon)*
- **Internet Computer**: [internetcomputer.org](https://internetcomputer.org)
- **Motoko Language**: [sdk.dfinity.org/docs/language-guide/motoko.html](https://sdk.dfinity.org/docs/language-guide/motoko.html)

## 🙏 Acknowledgments

- **DFINITY Foundation** for the Internet Computer Protocol
- **Next.js Team** for the amazing React framework
- **shadcn** for the beautiful UI components
- **Tailwind CSS** for utility-first styling

## 📞 Support

Need help? Reach out to us:

- **GitHub Issues**: [Create an issue](https://github.com/Antismart/bitstream/issues)
- **Documentation**: [Check our docs](https://docs.bitstream.app) *(coming soon)*
- **Community**: [Join our Discord](https://discord.gg/bitstream) *(coming soon)*

---

**Built with ❤️ on the Internet Computer**

*BitStream - Making Bitcoin payments programmable, one stream at a time.*
