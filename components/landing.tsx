"use client"
import { ArrowRight, FileText, Users, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingProps {
  onGetStarted: () => void
}

export function Landing({ onGetStarted }: LandingProps) {
  const features = [
    {
      icon: FileText,
      title: "Smart Document Management",
      description: "Organize, share, and discover documents with intelligent categorization and powerful search.",
    },
    {
      icon: Users,
      title: "Social Collaboration",
      description: "Connect with creators, follow your favorite authors, and build a knowledge community.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your documents are protected with enterprise-grade security and privacy controls.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Upload, search, and access your documents instantly with our optimized platform.",
    },
  ]

  // *TODO: DATA* - Replace with real statistics from server
  const stats = []

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FileHub</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                About
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Pricing
              </a>
              <Button
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Share Knowledge,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Build Community
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              The modern platform for document sharing, discovery, and collaboration. Connect with creators, explore
              knowledge, and build your digital library.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
              <Button
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Start Sharing Today
                <ArrowRight size={20} className="ml-2" />
              </Button>
              <Button className="border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accessible for Everyone Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-white border-4 border-white flex items-center justify-center">
                <img
                  src="https://media.istockphoto.com/id/1389937723/vector/cartoon-planet-earth-3d-vector-icon-on-white-background.jpg?s=612x612&w=0&k=20&c=hntEYVS5xepGQi1AIpRipUTYnH2Tp_S1TXS5M-pQe3A="
                  alt="Cartoon Planet Earth 3D Icon"
                  className="w-full h-full object-contain p-8"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-blue-600 font-semibold text-lg">Global Access</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Accessible for
                <br />
                <span className="text-blue-600">Everyone</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                FileHub breaks down barriers to knowledge sharing. Whether you're a student, researcher, professional,
                or creator, our platform is designed to be inclusive, intuitive, and accessible to users worldwide.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">Multi-language support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">Screen reader compatible</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">Mobile-first design</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">Free tier available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to share, discover, and collaborate on documents in one beautiful platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                    <Icon size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of creators, researchers, and professionals who trust FileHub for their document sharing
            needs.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={onGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Get Started
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-6">Free to start. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold text-white">FileHub</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The modern platform for document sharing and knowledge collaboration.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  API
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  About
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Careers
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">© 2024 FileHub. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
