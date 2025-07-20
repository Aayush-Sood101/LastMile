'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 to-teal-900/10"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
      
      <motion.div 
        className="container mx-auto px-4 sm:px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <motion.div className="md:col-span-1" variants={itemVariants}>
            <Link href="/" className="inline-flex items-center group">
              <motion.div 
                className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center text-white mr-4 shadow-2xl group-hover:shadow-emerald-500/25"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-emerald-200 to-teal-200">
                LastMile
              </span>
            </Link>
            <p className="mt-6 text-gray-300 leading-relaxed text-lg">
              Optimizing the last mile with smart neighborhood deliveries that save costs and reduce emissions.
            </p>
            <div className="flex space-x-4 mt-8">
              {[
                { icon: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z", label: "Facebook" },
                { icon: "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z", label: "Instagram" },
                { icon: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84", label: "Twitter" }
              ].map((social, index) => (
                <motion.a 
                  key={index}
                  href="#" 
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-white transition-all duration-300 bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl hover:bg-gradient-to-br hover:from-emerald-600 hover:to-teal-600 border border-gray-700 hover:border-emerald-500 shadow-lg hover:shadow-emerald-500/25"
                >
                  <span className="sr-only">{social.label}</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d={social.icon} clipRule="evenodd" />
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-6 text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-teal-200">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { href: "/dashboard", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", text: "Products" },
                { href: "/communities", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", text: "Communities" },
                { href: "/how-it-works", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", text: "How It Works" },
                { href: "/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", text: "My Orders" }
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <motion.div
                      whileHover={{ x: 5, scale: 1.02 }}
                      className="text-gray-300 hover:text-emerald-400 transition-all duration-300 flex items-center group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                      </svg>
                      {link.text}
                    </motion.div>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-6 text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-teal-200">Resources</h3>
            <ul className="space-y-4">
              {[
                { href: "/faq", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", text: "FAQ" },
                { href: "/blog", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", text: "Blog" },
                { href: "/contact", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "Contact Support" },
                { href: "/guidelines", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Community Guidelines" }
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <motion.div
                      whileHover={{ x: 5, scale: 1.02 }}
                      className="text-gray-300 hover:text-emerald-400 transition-all duration-300 flex items-center group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                      </svg>
                      {link.text}
                    </motion.div>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-6 text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-teal-200">Stay Connected</h3>
            <p className="text-gray-300 mb-6 leading-relaxed text-lg">
              Get updates on community events and new features to optimize your neighborhood deliveries.
            </p>
            <form className="space-y-4">
              <div className="relative">
                <input 
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-gray-800/50 backdrop-blur-sm text-white px-6 py-4 rounded-xl focus:outline-none border border-gray-700 focus:border-emerald-500 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/20 placeholder-gray-400"
                  aria-label="Email address"
                />
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-emerald-500/25"
                  aria-label="Subscribe"
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-xs text-gray-400">We respect your privacy. No spam, ever.</p>
            </form>
            
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-3 mr-4">
                {[
                  "https://randomuser.me/api/portraits/women/12.jpg",
                  "https://randomuser.me/api/portraits/men/32.jpg",
                  "https://randomuser.me/api/portraits/women/45.jpg"
                ].map((src, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="w-10 h-10 rounded-full border-3 border-gray-800 relative overflow-hidden shadow-lg"
                  >
                    <Image
                      className="rounded-full"
                      src={src || "/placeholder.svg"}
                      alt="User"
                      width={40}
                      height={40}
                    />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-gray-400 font-medium">Join 2,500+ community members</p>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-16 pt-8 border-t border-gray-800"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[
              { title: "Delivery Areas", text: "Currently serving select neighborhoods in Chicago, Seattle, Portland, Austin, and more." },
              { title: "Carbon Impact", text: "Our coordinated deliveries have helped reduce carbon emissions by over 30% in participating communities." },
              { title: "Partnerships", text: "We partner with local retailers and delivery services to maximize efficiency." }
            ].map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-all duration-300"
              >
                <h4 className="text-emerald-300 font-bold mb-3 text-lg">{item.title}</h4>
                <p className="text-gray-400 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
            <p className="text-gray-400">© {new Date().getFullYear()} LastMile Delivery Networks, Inc. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-400">
              {["Privacy Policy", "Terms of Service", "Cookie Preferences", "Accessibility"].map((link, index) => (
                <motion.a 
                  key={index}
                  href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                  whileHover={{ scale: 1.05, color: "#10b981" }}
                  className="hover:text-emerald-400 transition-colors duration-200"
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
