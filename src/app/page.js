"use client"
import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"

export default function Home() {
  const [activeTab, setActiveTab] = useState("user")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <Navbar />
      
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>

      <motion.div
        className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-32 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="mb-16 text-center" variants={itemVariants}>
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700">
              LastMile
            </span>
          </motion.h1>
          <motion.p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed" variants={itemVariants}>
            Optimize the last mile with smart neighborhood deliveries
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-4" variants={itemVariants}>
            {[
              {
                text: "Save Money",
                color: "emerald",
                icon: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
              },
              {
                text: "Reduce Emissions",
                color: "blue",
                icon: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
              },
            ].map((badge, index) => (
              <motion.span
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-${badge.color}-100 to-${badge.color}-200 text-${badge.color}-800 shadow-lg border border-${badge.color}-200`}
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={badge.icon} clipRule="evenodd" />
                </svg>
                {badge.text}
              </motion.span>
            ))}
          </motion.div>
        </motion.header>

        <motion.div
          className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 mb-16"
          variants={itemVariants}
        >
          <div className="flex border-b border-gray-200/50">
            {[
              {
                key: "user",
                label: "Neighborhood User",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
              },
              {
                key: "walmart",
                label: "Admin Portal",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                className={`flex-1 py-6 text-center font-bold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                    : "bg-gray-50/50 text-gray-700 hover:bg-gray-100/50"
                }`}
                onClick={() => setActiveTab(tab.key)}
                whileHover={{ scale: activeTab !== tab.key ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="p-10">
            <AnimatePresence mode="wait">
              {activeTab === "user" ? (
                <motion.div
                  key="user"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Join Your Neighborhood Network</h3>
                    <p className="text-gray-600">Connect with neighbors and save on deliveries</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Link href="/auth/login">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                        Log In
                      </motion.div>
                    </Link>
                    <Link href="/auth/register">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        Create Account
                      </motion.div>
                    </Link>
                  </div>
                  <div className="text-sm text-gray-500 text-center pt-6 border-t border-gray-200">
                    Join LastMile to coordinate bulk orders with neighbors and save on delivery costs while reducing
                    carbon emissions.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h3>
                    <p className="text-gray-600">Manage deliveries and optimize routes</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Link href="/auth/login">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                        Admin Login
                      </motion.div>
                    </Link>
                  </div>
                  <div className="text-sm text-gray-500 text-center pt-6 border-t border-gray-200">
                    Secure access for authorized personnel only. Manage delivery cycles, optimize pricing, and
                    coordinate community deliveries.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.section className="w-full max-w-6xl mx-auto mb-16 px-4" variants={itemVariants}>
          <motion.h2 className="text-4xl font-bold text-center text-gray-800 mb-12" variants={itemVariants}>
            How LastMile Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                title: "1. Join a Community",
                description: "Connect with neighbors in your area who want to save on delivery costs",
                color: "emerald",
              },
              {
                icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
                title: "2. Shop Together",
                description: "Coordinate bulk orders with your community for maximum efficiency",
                color: "blue",
              },
              {
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "3. Save Money",
                description: "Enjoy reduced delivery fees and contribute to lower carbon emissions",
                color: "amber",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
                variants={itemVariants}
              >
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br from-${step.color}-100 to-${step.color}-200 rounded-2xl flex items-center justify-center mb-6 text-${step.color}-600 shadow-lg`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Additional Features Section */}
        <motion.section className="w-full max-w-6xl mx-auto mb-16 px-4" variants={itemVariants}>
          <motion.h2 className="text-4xl font-bold text-center text-gray-800 mb-12" variants={itemVariants}>
            Why Choose LastMile?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Save Up to 40%",
                description: "Bulk ordering reduces individual delivery costs",
                color: "green",
              },
              {
                icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Eco-Friendly",
                description: "Reduce carbon footprint by 60% with shared deliveries",
                color: "emerald",
              },
              {
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                title: "Community Driven",
                description: "Connect with neighbors and build stronger communities",
                color: "blue",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Smart Logistics",
                description: "AI-powered route optimization for faster deliveries",
                color: "purple",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 text-center"
                variants={itemVariants}
              >
                <motion.div
                  className={`w-12 h-12 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 rounded-xl flex items-center justify-center mb-4 text-${feature.color}-600 shadow-md mx-auto`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section className="w-full max-w-4xl mx-auto mb-16 px-4" variants={itemVariants}>
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center shadow-2xl">
            <motion.h2 className="text-3xl font-bold mb-8" variants={itemVariants}>
              Making a Real Impact
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { number: "2,500+", label: "Community Members" },
                { number: "15,000+", label: "Successful Deliveries" },
                { number: "30%", label: "Average CO₂ Reduction" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                  variants={itemVariants}
                >
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-emerald-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.footer
          className="text-center text-gray-500 border-t border-gray-200/50 pt-12 pb-8"
          variants={itemVariants}
        >
          <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
            {[
              { text: "Reduced Carbon Footprint", color: "emerald" },
              { text: "Group Savings", color: "blue" },
              { text: "Community Building", color: "amber" },
            ].map((feature, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} className="flex items-center">
                <div
                  className={`w-5 h-5 bg-gradient-to-r from-${feature.color}-400 to-${feature.color}-600 rounded-full mr-3 shadow-md`}
                ></div>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          <p className="mb-4 text-lg">
            © {new Date().getFullYear()} LastMile - Optimizing the neighborhood delivery experience
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((link, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.05, color: "#059669" }}
                className="text-gray-500 hover:text-emerald-600 transition-colors duration-200"
              >
                {link}
              </motion.a>
            ))}
          </div>
        </motion.footer>
      </motion.div>
    </div>
  )
}
