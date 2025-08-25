# BitStream 🔥

> **Simple, Automated Bitcoin Payment Streams on Internet Computer**

BitStream is a decentralized application built on the Internet Computer Protocol (ICP) that enables automated Bitcoin payments through programmable streams using ckBTC. Create recurring payments, schedule transfers, and manage your Bitcoin cash flow—all secured by the Internet Computer blockchain and powered by native Bitcoin integration.

## 🌟 Key Features

### ⚡ **ckBTC Integration**
- Native Bitcoin integration through Chain-Key Bitcoin (ckBTC)
- No need for wrapped tokens or bridges
- Direct Bitcoin transactions on Internet Computer

### 🚀 **Automated Payment Streams**
- Create recurring Bitcoin payments (daily, weekly, monthly)
- Set start/end dates and payment amounts
- Real-time balance tracking and analytics

### ⏰ **Flexible Scheduling**
- Time-based payment triggers
- Custom payment frequencies
- Start and end date management

### 🔐 **Internet Identity Authentication**
- Secure, passwordless authentication
- Privacy-preserving user management
- Seamless integration with IC ecosystem

### 📊 **Payment Analytics**
- Real-time payment tracking
- Cash flow projections
- Stream performance metrics
- Visual charts and dashboards

## 🏗️ Architecture

BitStream is built with a modern, scalable architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   ckBTC         │
│   (Next.js)     │◄──►│   (Motoko)       │◄──►│   Integration   │
│                 │    │                  │    │                 │
│ • React 19      │    │ • Payment Logic  │    │ • Bitcoin Ledger│
│ • TypeScript    │    │ • Stream Mgmt    │    │ • ckBTC Minter  │
│ • Tailwind CSS  │    │ • User Auth      │    │ • Native BTC    │
│ • shadcn/ui     │    │ • Analytics      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Backend (Motoko Smart Contracts)
- **`server/paymentStream.mo`**: Core payment streaming logic with ckBTC integration

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
     name: "Monthly Salary Payment",
     amount: "0.025", // BTC
     frequency: "monthly",
     recipient: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
     startDate: "2024-01-01",
     endDate: "2024-12-31"
   }
   ```

4. **Monitor and Manage**
   - Track payments in real-time
   - View analytics and cash flow
   - Pause/resume streams as needed

### ckBTC Integration

BitStream leverages Internet Computer's native Bitcoin integration:

- **Chain-Key Bitcoin (ckBTC)**: 1:1 backed Bitcoin tokens on IC
- **Native Bitcoin Network**: Direct interaction with Bitcoin blockchain
- **Secure Custody**: Cryptographically secure Bitcoin management
- **Fast Settlement**: Near-instant transactions with finality

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
- **ckBTC Documentation**: [internetcomputer.org/docs/build-on-btc](https://internetcomputer.org/docs/build-on-btc)
- **ckBTC Examples**: [github.com/dfinity/examples/tree/master/motoko/ic-pos](https://github.com/dfinity/examples/tree/master/motoko/ic-pos)
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
