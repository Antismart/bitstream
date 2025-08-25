import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { User, Shield, Bell, Wallet, Globe, Key, Smartphone, Mail } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your account and BitStream preferences</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-6">
                <User className="h-6 w-6 text-lime-400" />
                <h3 className="text-lg font-semibold text-white">Profile Information</h3>
              </div>
              <div className="flex items-center space-x-6 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="bg-orange-500 text-white text-xl">SM</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                    Change Photo
                  </Button>
                  <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    Remove
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">First Name</label>
                  <Input
                    defaultValue="Sarah"
                    className="bg-gray-800 border-gray-700 text-white focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Last Name</label>
                  <Input
                    defaultValue="Moller"
                    className="bg-gray-800 border-gray-700 text-white focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Email</label>
                  <Input
                    defaultValue="sarah.moller@email.com"
                    className="bg-gray-800 border-gray-700 text-white focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Role</label>
                  <Input
                    defaultValue="Developer"
                    className="bg-gray-800 border-gray-700 text-white focus:border-lime-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-6">
                <Shield className="h-6 w-6 text-lime-400" />
                <h3 className="text-lg font-semibold text-white">Security</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="font-medium text-white">Two-Factor Authentication</div>
                      <div className="text-sm text-white/60">Add an extra layer of security</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="font-medium text-white">SMS Notifications</div>
                      <div className="text-sm text-white/60">Receive alerts via SMS</div>
                    </div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="font-medium text-white">Email Notifications</div>
                      <div className="text-sm text-white/60">Get notified about important events</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-6">
                <Bell className="h-6 w-6 text-lime-400" />
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Stream Payments</div>
                    <div className="text-sm text-white/60">Get notified when payments are executed</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Stream Updates</div>
                    <div className="text-sm text-white/60">Notifications about data source changes</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Security Alerts</div>
                    <div className="text-sm text-white/60">Important security notifications</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Marketing</div>
                    <div className="text-sm text-white/60">Product updates and news</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Wallet Settings */}
          <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-4">
                <Wallet className="h-6 w-6 text-lime-400" />
                <h3 className="text-lg font-semibold text-white">Wallet</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-xl">
                  <div className="text-sm text-white/60 mb-1">Bitcoin Balance</div>
                  <div className="text-xl font-bold text-white">2.513₿</div>
                  <Badge className="mt-2 bg-lime-400/20 text-lime-400">Active</Badge>
                </div>
                <Button className="w-full bg-lime-400 text-black hover:bg-lime-500">Manage Wallet</Button>
              </div>
            </CardContent>
          </Card>

          {/* Network Settings */}
          <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-4">
                <Globe className="h-6 w-6 text-lime-400" />
                <h3 className="text-lg font-semibold text-white">Network</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">ICP Network</span>
                  <Badge className="bg-lime-400/20 text-lime-400">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Bitcoin Network</span>
                  <Badge className="bg-lime-400/20 text-lime-400">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Lightning Network</span>
                  <Badge className="bg-yellow-400/20 text-yellow-400">Optional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                >
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                >
                  Backup Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-600/10 bg-transparent"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
