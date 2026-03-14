"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import 'animate.css';

const features = [
  {
    title: "Pokedex",
    description: "Browse and collect Pokemon, build your deck",
    href: "/pokedex",
    icon: "⚡",
    color: "from-yellow-400 to-orange-500",
  },
  {
    title: "Items",
    description: "Explore all Pokemon items and their details",
    href: "/items",
    icon: "🎒",
    color: "from-amber-600 to-brown-600",
  },
  {
    title: "Moves",
    description: "Discover all moves and which Pokemon can learn them",
    href: "/moves",
    icon: "💥",
    color: "from-red-500 to-pink-500",
  },
  {
    title: "Abilities",
    description: "Learn about Pokemon abilities",
    href: "/abilities",
    icon: "✨",
    color: "from-purple-500 to-indigo-500",
  },
  {
    title: "Types",
    description: "Type advantage chart and type details",
    href: "/types",
    icon: "🔰",
    color: "from-blue-400 to-cyan-400",
  },
  {
    title: "Stats",
    description: "Base stats for all Pokemon",
    href: "/stats",
    icon: "📊",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Evolution",
    description: "Pokemon evolution chains",
    href: "/evolution",
    icon: "🔄",
    color: "from-teal-500 to-green-500",
  },
  {
    title: "Berries",
    description: "All Pokemon berries and their effects",
    href: "/berries",
    icon: "🍓",
    color: "from-pink-400 to-rose-400",
  },
  {
    title: "Locations",
    description: "Where to find Pokemon in the wild",
    href: "/locations",
    icon: "🗺️",
    color: "from-slate-500 to-gray-600",
  },
  {
    title: "Natures",
    description: "Pokemon natures and their stat effects",
    href: "/natures",
    icon: "🌿",
    color: "from-lime-500 to-green-500",
  },
  {
    title: "Move Damage Calculator",
    description: "Calculate damage output between Pokemon",
    href: "/move-damage",
    icon: "⚔️",
    color: "from-red-600 to-orange-600",
  },
];

export default function DeckBuilder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">🎮</span>
          <h1 className="text-5xl font-bold text-white">Pokemon Hub</h1>
          <span className="text-5xl">🎮</span>
        </div>
        <p className="text-xl text-purple-200">
          Your ultimate Pokemon database and battle companion
        </p>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to Pokemon Hub
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Explore the complete Pokemon universe. Browse Pokemon, check types, 
            plan your team, calculate damage, and become the ultimate Pokemon Master!
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={feature.href}>
                <div className={`h-full p-6 rounded-xl bg-gradient-to-br ${feature.color} 
                  hover:scale-105 transition-transform cursor-pointer shadow-lg`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl">{feature.icon}</span>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-white/90 text-sm">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            Get Started
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pokedex">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 
                  rounded-full font-bold text-lg text-gray-900 shadow-lg"
              >
                Start Collecting Pokemon ⚡
              </motion.button>
            </Link>
            <Link href="/move-damage">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 
                  rounded-full font-bold text-lg text-white shadow-lg"
              >
                Battle Calculator ⚔️
              </motion.button>
            </Link>
            <Link href="/types">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-400 to-cyan-400 
                  rounded-full font-bold text-lg text-white shadow-lg"
              >
                Type Chart 🔰
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Footer Stats */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center text-purple-300"
        >
          <p>Data from The Pokemon Database</p>
          <p className="text-sm mt-2">© 2024 Pokemon Hub</p>
        </motion.footer>
      </main>
    </div>
  );
}
