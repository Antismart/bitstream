import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bitcoin, Shield, CheckCircle, ArrowUpDown } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>

      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bitcoin className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">BitStream®</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Streams
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Analytics
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Docs
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Partners
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Log in
              </Button>
              <Button className="bg-white text-emerald-900 hover:bg-white/90 font-semibold">Get started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-40 px-6 pt-12 pb-20">
        <div className="container mx-auto text-center">
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <CheckCircle className="h-4 w-4 text-white" />
              <span className="text-sm text-white">Native Bitcoin integration</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <CheckCircle className="h-4 w-4 text-white" />
              <span className="text-sm text-white">Real-world data streams</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <CheckCircle className="h-4 w-4 text-white" />
              <span className="text-sm text-white">Programmable payments</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            LIVE IN BITCOIN
            <br />
            PAYMENT STREAMS
            <br />
            WITH BITSTREAM
          </h1>

          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Since 2025, we've pioneered programmable Bitcoin payments that execute automatically based on real-world
            conditions
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-white text-emerald-900 hover:bg-white/90 font-semibold px-8 py-4 text-lg">
              Get started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
            >
              More info
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section className="relative z-30 px-6 pb-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Zero Bridge Risk Card */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl">
              <CardContent className="p-0">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">ZERO BRIDGE RISK</h3>
                  <p className="text-white/70 text-sm">
                    We provide native Bitcoin integration eliminating the need to worry about having crypto bridges or
                    wrapped tokens
                  </p>
                </div>

                {/* Large Zero Graphic */}
                <div className="relative mb-6">
                  <div className="text-[120px] font-bold text-white/20 leading-none">0</div>
                  <div className="absolute top-4 right-4">
                    <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-emerald-300" />
                    </div>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-end justify-between h-16">
                    {[3, 6, 4, 8, 7, 9, 5, 8].map((height, i) => (
                      <div
                        key={i}
                        className="bg-emerald-400 rounded-t"
                        style={{ height: `${height * 6}px`, width: "8px" }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Value Card */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl">
              <CardContent className="p-0">
                <div className="mb-6">
                  <div className="text-sm text-white/70 mb-1">Total value</div>
                  <div className="text-4xl font-bold text-white mb-2">2.455 BTC</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-300 text-sm">+ ₿2 609.87</span>
                    <span className="text-emerald-300 text-sm">• 3.95%</span>
                    <span className="text-white/50 text-sm">for today</span>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                  <div className="flex items-end justify-between h-20">
                    {[
                      { height: 30, color: "bg-emerald-400" },
                      { height: 45, color: "bg-emerald-400" },
                      { height: 35, color: "bg-emerald-400" },
                      { height: 60, color: "bg-emerald-400" },
                      { height: 50, color: "bg-emerald-400" },
                      { height: 70, color: "bg-emerald-300" },
                      { height: 40, color: "bg-emerald-400" },
                      { height: 55, color: "bg-emerald-400" },
                    ].map((bar, i) => (
                      <div
                        key={i}
                        className={`${bar.color} rounded-t transition-all duration-300`}
                        style={{ height: `${bar.height}px`, width: "12px" }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>$8k</span>
                    <span>$6k</span>
                    <span>$7k</span>
                    <span>$11k</span>
                    <span>$5k</span>
                    <span>$8k</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$11k</div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards & Trading Card */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl">
              <CardContent className="p-0">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">RECEIVE UP TO 15%</h3>
                  <h4 className="text-lg font-semibold text-white mb-2">IN ANNUAL</h4>
                  <p className="text-white/70 text-sm">
                    Earn rewards by holding cryptocurrencies in your account. Effortlessly.
                  </p>
                </div>

                {/* Bitcoin Coin Visual */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                      <Bitcoin className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-900">₿</span>
                    </div>
                  </div>
                </div>

                {/* Trading Interface */}
                <div className="bg-white/5 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Swap</span>
                    <div className="flex items-center space-x-2">
                      <Bitcoin className="h-4 w-4 text-orange-400" />
                      <span className="text-white text-sm font-medium">Bitcoin</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">13.3607</div>
                    <div className="text-white/50 text-sm">Available $16,307.05</div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <ArrowUpDown className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Buy</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm font-medium">USDT</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">24,406</div>
                    <div className="text-white/50 text-sm">Estimated Fee $24,406.85</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Logo */}
      <footer className="relative z-20 px-6 pb-8">
        <div className="container mx-auto">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-emerald-900 font-bold text-sm">B</span>
              </div>
              <span className="text-white font-bold text-lg">BITSTREAM</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
