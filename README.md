# AptoPay - Instant Crypto Payments with QR & Rewards

A modern, user-friendly cryptocurrency payment platform built on the Aptos blockchain that enables instant payments using QR codes and usernames with built-in reward systems.

- 🚀 **Deployment:** [aptopay.shubhh.xyz](https://aptopay.shubhh.xyz/)


![apto Logo](./public/home.png)

---

![apto Logo](./public/qrscan.png)

---

![apto Logo](./public/hehe.png)


## 🌟 Features

### Core Functionality
- **QR Code Payments**: Scan or share QR codes for instant, contactless payments
- **Username-Based Payments**: Send crypto using simple usernames instead of complex wallet addresses
- **Payment Rewards**: Earn exciting rewards and cashback on every transaction
- **Instant Payments**: Send and receive crypto in seconds with QR technology
- **Secure & Robust**: Military-grade security with reversible payment options
- **Request System**: Create and manage payment requests from other users

### User Experience
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Wallet Integration**: Seamless Aptos wallet connection
- **Transaction History**: Complete payment tracking and history
- **Real-time Updates**: Live updates for incoming requests and payments
- **Multi-tab Interface**: Organized sections for Pay, Receive, Request, History, and Rewards

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Aptos-compatible wallet (Petra recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Aptopay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   APTOS_API_KEY_MAINNET=your_aptos_api_key
   PHOTON_API_KEY=your_photon_rewards_api_key
   PHOTON_JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`



## 💻 Core Components

### Payment Flow
1. **User Registration**: Users register with wallet address and username
2. **Payment Creation**: Send payments via username or QR code scan
3. **On-chain Execution**: Transactions processed on Aptos blockchain
4. **Reward Distribution**: Automatic reward points for completed payments
5. **History Tracking**: All transactions stored in MongoDB

### Request System
- Create payment requests with custom amounts and memos
- Accept/reject incoming requests
- Automatic transaction execution on acceptance
- Real-time status updates

### Rewards Integration
- Integrated with Photon rewards platform
- Automatic user registration with Photon
- Event tracking for payment activities
- Custom reward calculation (100 points per 1 APT)

## 🔐 Security Features

- **Wallet Authentication**: Secure Aptos wallet integration
- **Input Validation**: Comprehensive form validation
- **Transaction Security**: On-chain verification
- **Error Handling**: Comprehensive error boundaries

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Smooth Animations**: Framer Motion transitions
- **Real-time Updates**: Live payment status
- **Intuitive Navigation**: Tab-based interface
- **Visual Feedback**: Toast notifications and loading states

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using Next.js and Aptos