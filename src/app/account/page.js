"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import OrdersList from "@/components/OrdersList"
import { useToast } from "@/components/Toast"
import {
  FaUserEdit,
  FaLeaf,
  FaShoppingBag,
  FaUsers,
  FaClipboardList,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa"
import { API_URL } from "@/utils/apiConfig"

export default function Account() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [carbonStats, setCarbonStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [editMode, setEditMode] = useState(false)
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchUserData()
  }, [router])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      const userResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUser(userResponse.data)
      setFormData({
        name: userResponse.data.name || "",
        email: userResponse.data.email || "",
        address: userResponse.data.address || "",
        phone: userResponse.data.phone || "",
      })

      const ordersResponse = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setOrders(ordersResponse.data)

      const carbonResponse = await axios.get(`${API_URL}/api/orders/carbon-stats/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setCarbonStats(carbonResponse.data)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load user data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      await axios.put(`${API_URL}/api/users/me`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUser({
        ...user,
        ...formData,
      })

      const localUser = JSON.parse(localStorage.getItem("user") || "{}")
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...localUser,
          name: formData.name,
          email: formData.email,
        }),
      )

      setEditMode(false)
      showToast("Profile updated successfully!", "success")
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast("Failed to update profile. Please try again.", "error")
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Navbar />

      <motion.div
        className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center">
              <span className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-xl mr-4 text-emerald-600 shadow-lg">
                <FaUserEdit className="h-7 w-7" />
              </span>
              My Account
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Manage your profile and explore your order history</p>
          </motion.div>

          {!loading && !error && user && (
            <motion.div
              className="mt-6 md:mt-0"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-xl shadow-lg border border-emerald-200">
                <span className="font-bold text-xl">{user.communities?.length || 0}</span>
                <span className="mx-3 text-emerald-400">•</span>
                <span className="flex items-center font-medium">
                  <FaUsers className="mr-2" /> Communities
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {loading ? (
          <motion.div
            className="flex flex-col justify-center items-center h-64 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-6"></div>
            <p className="text-gray-600 font-medium text-lg">Loading your account information...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl shadow-lg mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        ) : user ? (
          <div>
            {/* Enhanced Tabs */}
            <div className="flex flex-wrap bg-white/80 backdrop-blur-xl rounded-t-2xl shadow-xl border border-white/50 overflow-hidden mb-0">
              {[
                { key: "profile", label: "Profile", icon: FaUserEdit },
                { key: "orders", label: "My Orders", icon: FaShoppingBag },
                { key: "impact", label: "Environmental Impact", icon: FaLeaf },
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  className={`px-8 py-5 font-bold text-sm flex items-center transition-all duration-300 ${
                    activeTab === tab.key
                      ? "text-emerald-700 border-b-4 border-emerald-600 bg-gradient-to-t from-emerald-50 to-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50/50"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon
                    className={`mr-3 h-5 w-5 ${
                      activeTab === tab.key ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-b-2xl shadow-xl p-8 border border-white/50 border-t-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div className="flex items-center mb-6 md:mb-0">
                    <div className="h-16 w-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                      <FaUserEdit className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                  </div>

                  {!editMode && (
                    <motion.button
                      className="flex items-center text-sm bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-6 py-3 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-200 shadow-md border border-emerald-200"
                      onClick={() => setEditMode(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaUserEdit className="mr-2" /> Edit Profile
                    </motion.button>
                  )}
                </div>

                {editMode ? (
                  <motion.form
                    onSubmit={handleUpdateProfile}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { name: "name", label: "Full Name", type: "text", icon: FaUserEdit },
                        { name: "email", label: "Email Address", type: "email", icon: FaEnvelope, readOnly: true },
                        { name: "address", label: "Address", type: "text", icon: FaMapMarkerAlt },
                        { name: "phone", label: "Phone Number", type: "tel", icon: FaPhone },
                      ].map((field) => (
                        <div key={field.name}>
                          <label className="block text-gray-700 font-semibold mb-3 text-lg">
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              required
                              readOnly={field.readOnly}
                              className={`w-full px-6 py-4 pl-14 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg ${
                                field.readOnly ? "bg-gray-50 text-gray-500" : "bg-white"
                              }`}
                              placeholder={`Enter your ${field.label.toLowerCase()}`}
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <field.icon className="text-gray-400 h-5 w-5" />
                            </div>
                          </div>
                          {field.readOnly && (
                            <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                      <motion.button
                        type="button"
                        className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                        onClick={() => {
                          setEditMode(false)
                          setFormData({
                            name: user.name || "",
                            email: user.email || "",
                            address: user.address || "",
                            phone: user.phone || "",
                          })
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </motion.button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    className="rounded-2xl border border-gray-100 overflow-hidden shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      {[
                        { icon: FaUserEdit, label: "Full Name", value: user.name },
                        { icon: FaEnvelope, label: "Email Address", value: user.email },
                        { icon: FaMapMarkerAlt, label: "Address", value: user.address || "Not provided" },
                        { icon: FaPhone, label: "Phone Number", value: user.phone || "Not provided" },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`p-6 ${
                            index % 2 === 0 ? "md:border-r" : ""
                          } ${index < 2 ? "border-b" : ""} border-gray-100 hover:bg-gray-50/50 transition-colors duration-200`}
                        >
                          <div className="flex items-center mb-3">
                            <item.icon className="text-emerald-500 mr-3 h-5 w-5" />
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                              {item.label}
                            </h3>
                          </div>
                          <p className="font-semibold text-xl text-gray-800">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-gray-50/50">
                      <div className="p-6 md:border-r border-gray-100">
                        <div className="flex items-center mb-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-emerald-500 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Account Created
                          </h3>
                        </div>
                        <p className="font-semibold text-xl text-gray-800">{formatDate(user.createdAt)}</p>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center mb-3">
                          <FaUsers className="text-emerald-500 mr-3 h-5 w-5" />
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Communities
                          </h3>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 text-xl font-bold px-4 py-2 rounded-xl shadow-md">
                            {user.communities?.length || 0}
                          </span>
                          <span className="ml-3 text-gray-600 font-medium">active communities</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white/80 backdrop-blur-xl rounded-b-2xl shadow-xl border border-white/50 border-t-0">
                <OrdersList />
              </div>
            )}

            {/* Environmental Impact Tab */}
            {activeTab === "impact" && (
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-b-2xl shadow-xl p-8 border border-white/50 border-t-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div className="flex items-center mb-6 md:mb-0">
                    <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                      <FaLeaf className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Your Environmental Impact</h2>
                  </div>
                </div>

                {carbonStats ? (
                  <motion.div
                    className="space-y-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          value: Math.round(carbonStats.totalSaved || 0),
                          label: "kg CO2 Saved",
                          color: "green",
                          icon: FaLeaf,
                        },
                        {
                          value: carbonStats.ordersPlaced || 0,
                          label: "Total Orders Placed",
                          color: "gray",
                          icon: FaShoppingBag,
                        },
                        {
                          value: carbonStats.communityOrdersCount || 0,
                          label: "Community Orders",
                          color: "blue",
                          icon: FaUsers,
                        },
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-2xl p-8 text-center shadow-xl border border-${stat.color}-200`}
                        >
                          <div
                            className={`mb-6 rounded-2xl bg-${stat.color}-200/50 h-20 w-20 mx-auto flex items-center justify-center shadow-lg`}
                          >
                            <stat.icon className={`text-${stat.color}-600 text-4xl`} />
                          </div>
                          <div className={`text-4xl font-bold text-${stat.color}-700 mb-2`}>{stat.value}</div>
                          <div className={`text-sm font-semibold text-${stat.color}-800`}>{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Additional impact details would go here */}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="inline-flex h-24 w-24 rounded-2xl bg-gray-100 p-6 mb-6">
                      <FaLeaf className="h-full w-full text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">No impact data yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
                      Place an order to start tracking your environmental impact. Each order through LastMile helps
                      reduce carbon emissions.
                    </p>
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center mx-auto shadow-lg"
                      onClick={() => router.push("/dashboard")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Start Shopping
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-12 text-center border border-white/50">
            <h3 className="text-2xl font-bold mb-4">User not found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              There was a problem loading your account information.
            </p>
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
              onClick={() => router.push("/auth/login")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Login
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
