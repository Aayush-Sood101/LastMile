"use client"
import { useState, useEffect, useCallback } from "react"
import React from "react"

import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { Dialog, Transition } from "@headlessui/react"
import toast, { Toaster } from "react-hot-toast"
import clsx from "clsx"
import { API_URL } from "@/utils/apiConfig"
import {
  FaUsers,
  FaUserCheck,
  FaChartLine,
  FaBoxes,
  FaLeaf,
  FaStore,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
  FaShoppingCart,
  FaEdit,
  FaTrash,
  FaPlus,
  FaImage,
  FaDollarSign,
  FaTag,
  FaTruck,
} from "react-icons/fa"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js"
import { Doughnut, Line } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dashboardData, setDashboardData] = useState(null)
  const [communityRequests, setCommunityRequests] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Animation variants for page elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  }

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  }

  // Product form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    ecoFriendly: false,
    inventory: "",
  })
  const [productFormErrors, setProductFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if walmart admin is logged in
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!token || user.role !== "walmart") {
      router.push("/auth/login")
      return
    }

    // Check URL params for tab selection and specific actions
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get("tab")

      // If a tab is specified in the URL, set it as active
      if (tabParam) {
        setActiveTab(tabParam)
      }
    }

    // Verify token validity with the server
    const verifyToken = async () => {
      try {
        // Use the dashboard endpoint that we know exists to verify the token
        await axios.get(`${API_URL}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        // If successful, load initial data
        loadTabData(activeTab)
      } catch (error) {
        console.error("Token verification failed:", error)
        toast.error("Your session has expired. Please login again.")
        // If token is invalid, redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/auth/login")
      }
    }

    verifyToken()
  }, [router, activeTab, API_URL])

  const loadTabData = useCallback(
    async (tab) => {
      setLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token")

        // Check URL for specific community ID when on communities tab
        let highlightCommunityId = null
        if (typeof window !== "undefined" && tab === "communities") {
          const urlParams = new URLSearchParams(window.location.search)
          highlightCommunityId = urlParams.get("communityId")
        }

        switch (tab) {
          case "dashboard":
            // Fetch both dashboard data and user stats
            const [dashboardResponse, userStatsResponse] = await Promise.all([
              axios.get(`${API_URL}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
              axios.get(`${API_URL}/api/admin/user-stats`, { headers: { Authorization: `Bearer ${token}` } }),
            ])

            // Merge the dashboard data with user stats
            setDashboardData({
              ...dashboardResponse.data,
              userStats: {
                total: userStatsResponse.data.totalUsers,
                communityUsers: userStatsResponse.data.communityUsers,
                nonCommunityUsers: userStatsResponse.data.nonCommunityUsers,
                newThisMonth: userStatsResponse.data.newThisMonth || 0, // This might not be provided by the API
              },
            })
            break

          case "communities":
            const communitiesResponse = await axios.get(`${API_URL}/api/admin/community-requests`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            // If a specific community ID is provided in URL, highlight it
            if (highlightCommunityId) {
              const allRequests = communitiesResponse.data
              const targetCommunity = allRequests.find((c) => c._id === highlightCommunityId)

              if (targetCommunity) {
                // Put the highlighted community at the top of the list
                const filteredRequests = allRequests.filter((c) => c._id !== highlightCommunityId)
                setCommunityRequests([targetCommunity, ...filteredRequests])
              } else {
                setCommunityRequests(allRequests)
              }
            } else {
              setCommunityRequests(communitiesResponse.data)
            }
            break

          case "orders":
            const ordersResponse = await axios.get(`${API_URL}/api/admin/orders`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            setOrders(ordersResponse.data)
            break

          case "products":
            console.log("Loading products with token:", token)

            // For Walmart admin, use the regular products endpoint
            const productsResponse = await axios.get(`${API_URL}/api/products`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            setProducts(productsResponse.data)
            break
        }
      } catch (error) {
        console.error("Error loading admin data:", error)
        setError("Failed to load data. Please try again later.")
        toast.error("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    },
    [API_URL, setCommunityRequests, setDashboardData, setError, setLoading, setOrders, setProducts],
  )

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    loadTabData(tab)
  }

  const handleApproveCommunity = async (communityId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      await axios.put(
        `${API_URL}/api/communities/${communityId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      toast.success("Community approved successfully")

      // Refresh community requests data
      loadTabData("communities")
    } catch (error) {
      console.error("Error approving community:", error)
      toast.error("Failed to approve community")
    } finally {
      setLoading(false)
    }
  }

  const handleRejectCommunity = async (communityId) => {
    try {
      // Ask for rejection reason
      const reason = prompt("Please provide a reason for rejecting this community:")
      if (reason === null) return // User cancelled

      setLoading(true)
      const token = localStorage.getItem("token")
      await axios.put(
        `${API_URL}/api/communities/${communityId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      toast.success("Community rejected successfully")

      // Refresh community requests data
      loadTabData("communities")
    } catch (error) {
      console.error("Error rejecting community:", error)
      toast.error("Failed to reject community")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  // Reset the product form to default values
  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      ecoFriendly: false,
      inventory: "",
    })
    setIsEditing(false)
    setCurrentProduct(null)
  }

  // Handle opening the add product modal
  const handleAddProduct = () => {
    resetProductForm()
    setIsModalOpen(true)
  }

  // Handle opening the edit product modal
  const handleEditProduct = (product) => {
    setCurrentProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category || "",
      imageUrl: product.imageUrl || "",
      ecoFriendly: product.ecoFriendly || false,
      inventory: product.inventory ? product.inventory.toString() : "100", // Default to 100 if not provided
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProductForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Validate product form fields
  const validateProductForm = () => {
    const errors = {}

    if (!productForm.name.trim()) {
      errors.name = "Product name is required"
    }

    if (!productForm.price.trim()) {
      errors.price = "Valid price is required"
    }

    if (!productForm.inventory.trim()) {
      errors.inventory = "Valid inventory amount is required"
    }

    if (productForm.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long"
    }

    if (productForm.imageUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(productForm.imageUrl)) {
      errors.imageUrl = "Image URL must be a valid image link (jpg, jpeg, png, gif)"
    }

    setProductFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission (create or update)
  const handleProductSubmit = async (e) => {
    e.preventDefault()

    if (!validateProductForm()) {
      return
    }

    // Verify token exists
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Authentication token not found. Please log in again.")
      router.push("/auth/login")
      return
    }
    // Get user role for additional verification
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.role !== "walmart") {
      toast.error("You do not have permission to perform this action.")
      return
    }

    setIsSubmitting(true)

    try {
      const productData = {
        ...productForm,
        price: Number.parseFloat(productForm.price),
        inventory: Number.parseInt(productForm.inventory),
      }

      // Add proper headers with token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      if (isEditing && currentProduct) {
        // Update existing product
        console.log("Updating product with ID:", currentProduct._id)
        console.log("Using token:", token)
        console.log("Product data:", productData)

        // For Walmart admin, use the regular products endpoint but with token
        await axios.put(`${API_URL}/api/products/${currentProduct._id}`, productData, config)

        toast.success("Product updated successfully!")
      } else {
        // Create new product
        console.log("Creating new product")
        console.log("Using token:", token)
        console.log("Product data:", productData)

        // For Walmart admin, use the regular products endpoint but with token
        await axios.post(`${API_URL}/api/products`, productData, config)

        toast.success("Product created successfully!")
      }

      // Close modal and refresh products
      setIsModalOpen(false)
      resetProductForm()
      loadTabData("products")
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error(error.response?.data?.message || "Failed to save product. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    // Verify token exists
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Authentication token not found. Please log in again.")
      router.push("/auth/login")
      return
    }

    // Verify user role
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.role !== "walmart") {
      toast.error("You do not have permission to perform this action.")
      return
    }

    setLoading(true)

    try {
      // Add proper headers with token - remove content-type for DELETE requests
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      console.log("Deleting product with ID:", productId)
      console.log("Using token:", token)

      // For Walmart admin, use the regular products endpoint but with token
      await axios.delete(`${API_URL}/api/products/${productId}`, config)

      // Refresh products list
      loadTabData("products")
      toast.success("Product deleted successfully!")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error(error.response?.data?.message || "Failed to delete product. Please try again.")
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, color, delay = 0 }) => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay }}
      className="group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl"></div>
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-4xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
              {value}
            </h3>
          </div>
          <div
            className={clsx("p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110", {
              "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600": color === "blue",
              "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600": color === "emerald",
              "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600": color === "purple",
              "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600": color === "amber",
            })}
          >
            <Icon className="h-8 w-8" />
          </div>
        </div>
        <div className="flex items-center text-sm">
          <div
            className={clsx("px-3 py-1 rounded-full text-xs font-semibold mr-3 transition-all duration-300", {
              "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700": color === "blue",
              "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700": color === "emerald",
              "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700": color === "purple",
              "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700": color === "amber",
            })}
          >
            {change.split(" ")[0]}
          </div>
          <span className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
            {change.split(" ").slice(1).join(" ")}
          </span>
        </div>
      </div>
    </motion.div>
  )

  const TabButton = ({ isActive, onClick, icon: Icon, label, children }) => (
    <motion.button
      className={clsx(
        "flex items-center space-x-4 w-full p-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group",
        isActive ? "text-emerald-700 font-semibold shadow-xl" : "hover:shadow-lg text-gray-700 hover:text-gray-900",
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 8 }}
      whileTap={{ scale: 0.98 }}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabBg"
          className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/50 rounded-2xl"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <div
        className={clsx(
          "relative p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
          isActive
            ? "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 shadow-lg"
            : "bg-gray-100 group-hover:bg-gray-200",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="relative text-lg font-medium">{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute right-4 w-1 h-12 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      {children}
    </motion.button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      />

      {/* Enhanced Sidebar */}
      <div className="w-80 bg-white/90 backdrop-blur-xl text-gray-700 h-screen sticky top-0 hidden md:flex md:flex-col shadow-2xl border-r border-white/50">
        <div className="p-8">
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 rounded-3xl mb-5 inline-flex shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <FaStore className="h-8 w-8" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              LastMile Admin
            </h2>
            <p className="text-gray-500 text-lg">Sustainability Dashboard</p>
          </motion.div>

          <motion.nav className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
            <TabButton
              isActive={activeTab === "dashboard"}
              onClick={() => handleTabChange("dashboard")}
              icon={FaChartLine}
              label="Dashboard"
            />
            <TabButton
              isActive={activeTab === "communities"}
              onClick={() => handleTabChange("communities")}
              icon={FaUsers}
              label="Communities"
            />
            <TabButton
              isActive={activeTab === "orders"}
              onClick={() => handleTabChange("orders")}
              icon={FaBoxes}
              label="Orders"
            />
            <TabButton
              isActive={activeTab === "products"}
              onClick={() => handleTabChange("products")}
              icon={FaStore}
              label="Products"
            />

            <div className="pt-6 border-t border-gray-200/50">
              <motion.a
                href="/admin/price-optimizer"
                className="flex items-center space-x-4 w-full p-4 rounded-2xl text-left hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-gray-900 group"
                whileHover={{ scale: 1.02, x: 8 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all duration-300 group-hover:scale-110">
                  <FaDollarSign className="h-5 w-5" />
                </div>
                <span className="text-lg font-medium">Price Optimizer</span>
              </motion.a>

              <motion.a
                href="/admin/logistics-optimizer"
                className="flex items-center space-x-4 w-full p-4 rounded-2xl text-left hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-gray-900 group"
                whileHover={{ scale: 1.02, x: 8 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all duration-300 group-hover:scale-110">
                  <FaTruck className="h-5 w-5" />
                </div>
                <span className="text-lg font-medium">Logistics Optimizer</span>
              </motion.a>
            </div>
          </motion.nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-200/50">
          <motion.button
            className="flex items-center space-x-4 w-full p-4 rounded-2xl text-left text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-3 bg-red-50 rounded-xl text-red-500 group-hover:bg-red-100 transition-all duration-300">
              <FaSignOutAlt className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Log Out</span>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-xl text-gray-800 z-50 border-b border-white/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-3 rounded-2xl mr-3 shadow-lg">
              <FaStore className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              LastMile Admin
            </h2>
          </div>

          <motion.button
            className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 shadow-md"
            onClick={() => document.getElementById("mobileMenu").classList.toggle("hidden")}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </div>

        <div id="mobileMenu" className="hidden">
          <div className="p-4 space-y-2 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
            {[
              { key: "dashboard", label: "Dashboard", icon: FaChartLine },
              { key: "communities", label: "Communities", icon: FaUsers },
              { key: "orders", label: "Orders", icon: FaBoxes },
              { key: "products", label: "Products", icon: FaStore },
            ].map((item) => (
              <motion.button
                key={item.key}
                className={clsx(
                  "flex items-center space-x-3 w-full p-4 rounded-2xl transition-all duration-300",
                  activeTab === item.key
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-lg"
                    : "hover:bg-gray-50 text-gray-700 hover:shadow-md",
                )}
                onClick={() => {
                  handleTabChange(item.key)
                  document.getElementById("mobileMenu").classList.add("hidden")
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={clsx(
                    "p-3 rounded-xl transition-all duration-300",
                    activeTab === item.key ? "bg-emerald-100 text-emerald-600" : "bg-gray-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}

            <motion.a
              href="/admin/price-optimizer"
              className="flex items-center space-x-3 w-full p-4 rounded-2xl hover:bg-gray-50 text-gray-700 hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-3 rounded-xl bg-gray-100">
                <FaDollarSign className="h-5 w-5" />
              </div>
              <span className="font-medium">Price Optimizer</span>
            </motion.a>

            <motion.a
              href="/admin/logistics-optimizer"
              className="flex items-center space-x-3 w-full p-4 rounded-2xl hover:bg-gray-50 text-gray-700 hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-3 rounded-xl bg-gray-100">
                <FaTruck className="h-5 w-5" />
              </div>
              <span className="font-medium">Logistics Optimizer</span>
            </motion.a>

            <motion.button
              className="flex items-center space-x-3 w-full p-4 rounded-2xl text-red-600 hover:bg-red-50 mt-6 transition-all duration-300"
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-3 bg-red-50 rounded-xl text-red-500">
                <FaSignOutAlt className="h-5 w-5" />
              </div>
              <span className="font-semibold">Log Out</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 md:ml-0 md:mt-0 mt-16 min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 pb-12">
        {loading ? (
          <motion.div
            className="flex flex-col justify-center items-center h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-emerald-500 mb-8"></div>
              <div
                className="absolute inset-0 rounded-full h-20 w-20 border-t-4 border-b-4 border-teal-300 animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <motion.p
              className="text-emerald-600 font-semibold text-xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              Loading dashboard data...
            </motion.p>
          </motion.div>
        ) : error ? (
          <motion.div className="p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-red-50/80 backdrop-blur-xl border border-red-200/50 text-red-700 px-8 py-6 rounded-3xl flex items-start shadow-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-4 mt-0.5 flex-shrink-0"
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
              <div>
                <p className="font-semibold text-lg">Error Loading Data</p>
                <p className="mt-2">{error}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Enhanced Dashboard Tab */}
            {activeTab === "dashboard" && dashboardData && (
              <motion.div className="p-8" variants={containerVariants} initial="hidden" animate="visible">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                  <motion.div variants={itemVariants}>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 mb-4">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-600 text-xl">Monitor and manage your LastMile operations</p>
                  </motion.div>

                  <motion.div
                    className="mt-6 md:mt-0 flex items-center bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-white/50"
                    variants={itemVariants}
                  >
                    <div className="text-sm text-gray-500 px-4 font-medium">Last updated:</div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg">
                      {new Date().toLocaleString()}
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                  <StatCard
                    title="Total Users"
                    value={dashboardData.userStats?.total || "N/A"}
                    change={`+${dashboardData.userStats?.newThisMonth || 0} new this month`}
                    icon={FaUsers}
                    color="blue"
                    delay={0.1}
                  />
                  <StatCard
                    title="Communities"
                    value={dashboardData.communityStats?.total || dashboardData.pendingCommunitiesCount || 0}
                    change={`${dashboardData.communityStats?.pending || dashboardData.pendingCommunitiesCount || 0} pending approval`}
                    icon={FaUserCheck}
                    color="emerald"
                    delay={0.2}
                  />
                  <StatCard
                    title="Total Orders"
                    value={
                      dashboardData.orderStats?.total ||
                      (dashboardData.orderStats?.individual?.count || 0) + (dashboardData.orderStats?.group?.count || 0)
                    }
                    change={`$${(dashboardData.orderStats?.totalRevenue || (dashboardData.orderStats?.individual?.totalValue || 0) + (dashboardData.orderStats?.group?.totalValue || 0)).toLocaleString()} revenue`}
                    icon={FaShoppingCart}
                    color="purple"
                    delay={0.3}
                  />
                  <StatCard
                    title="Carbon Saved"
                    value={`${Math.round(dashboardData.carbonStats?.totalSaved || dashboardData.totalCarbonFootprintSaved || 0)} kg`}
                    change={`= ${Math.round((dashboardData.carbonStats?.totalSaved || dashboardData.totalCarbonFootprintSaved || 0) * 2.4)} miles not driven`}
                    icon={FaLeaf}
                    color="amber"
                    delay={0.4}
                  />
                </div>

                {/* Enhanced Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <motion.div
                    className="relative overflow-hidden"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl"></div>
                    <div className="relative p-8">
                      <h3 className="text-2xl font-bold mb-8 text-gray-800">Carbon Footprint Impact</h3>
                      <div className="h-80">
                        <Doughnut
                          data={{
                            labels: ["Carbon Saved", "Carbon Used"],
                            datasets: [
                              {
                                data: [
                                  dashboardData.carbonStats?.totalSaved || dashboardData.totalCarbonFootprintSaved || 0,
                                  dashboardData.carbonStats?.totalUsed || 0,
                                ],
                                backgroundColor: [
                                  "linear-gradient(135deg, #10b981, #059669)",
                                  "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                                ],
                                borderColor: ["#10b981", "#cbd5e1"],
                                borderWidth: 3,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "bottom",
                                labels: {
                                  padding: 20,
                                  font: {
                                    size: 14,
                                    weight: "bold",
                                  },
                                },
                              },
                            },
                          }}
                        />
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
                        <p className="font-semibold">Total Deliveries: {dashboardData.orderStats.total}</p>
                        <p>Individual Deliveries Saved: {dashboardData.orderStats.individualDeliveriesSaved}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative overflow-hidden"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.6 }}
                  >
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl"></div>
                    <div className="relative p-8">
                      <h3 className="text-2xl font-bold mb-8 text-gray-800">Orders Over Time</h3>
                      <div className="h-80">
                        <Line
                          data={{
                            labels: (dashboardData.orderStats?.timeline || []).map((item) => item?.month || ""),
                            datasets: [
                              {
                                label: "Orders",
                                data: (dashboardData.orderStats?.timeline || []).map((item) => item?.count || 0),
                                fill: true,
                                backgroundColor: "rgba(16, 185, 129, 0.1)",
                                borderColor: "#10b981",
                                borderWidth: 3,
                                tension: 0.4,
                                pointBackgroundColor: "#10b981",
                                pointBorderColor: "#ffffff",
                                pointBorderWidth: 3,
                                pointRadius: 6,
                                pointHoverRadius: 8,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  precision: 0,
                                  font: {
                                    weight: "bold",
                                  },
                                },
                                grid: {
                                  color: "rgba(0, 0, 0, 0.05)",
                                },
                              },
                              x: {
                                ticks: {
                                  font: {
                                    weight: "bold",
                                  },
                                },
                                grid: {
                                  color: "rgba(0, 0, 0, 0.05)",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Enhanced Community Activity Table */}
                <motion.div
                  className="relative overflow-hidden"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.7 }}
                >
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl"></div>
                  <div className="relative p-8">
                    <h3 className="text-2xl font-bold mb-8 text-gray-800">Top Communities</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200/50">
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Community Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Members
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Orders
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Carbon Saved
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Location
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {(dashboardData.topCommunities || dashboardData.communityCarbonData || []).map(
                            (community, index) => (
                              <motion.tr
                                key={community._id}
                                className="hover:bg-gray-50/50 transition-colors duration-200"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-gray-900">{community.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-600 font-medium">
                                    {community.memberCount || "N/A"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-600 font-medium">
                                    {community.orderCount || "N/A"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-emerald-600 font-bold">
                                    {(community.carbonSaved || community.totalCarbonFootprintSaved || 0).toFixed(2)} kg
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-600">
                                    {typeof community.location === "object"
                                      ? `${community.location.address || ""} ${community.location.city || ""} ${community.location.state || ""} ${community.location.zipCode || ""}`.trim()
                                      : community.location || "N/A"}
                                  </div>
                                </td>
                              </motion.tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Enhanced Communities Tab */}
            {activeTab === "communities" && (
              <motion.div
                className="p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h1
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Community Management
                </motion.h1>

                {communityRequests.length > 0 ? (
                  <motion.div
                    className="relative overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl"></div>
                    <div className="relative">
                      <div className="px-8 py-6 border-b border-gray-200/50">
                        <h3 className="text-xl font-bold text-gray-800">Pending Community Approval Requests</h3>
                      </div>

                      <div className="divide-y divide-gray-200/50">
                        {communityRequests.map((request, index) => {
                          const isHighlighted =
                            typeof window !== "undefined" &&
                            new URLSearchParams(window.location.search).get("communityId") === request._id

                          return (
                            <motion.div
                              key={request._id}
                              className={clsx(
                                "p-8 transition-all duration-300",
                                isHighlighted
                                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400"
                                  : "hover:bg-gray-50/50",
                              )}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                            >
                              {isHighlighted && (
                                <motion.div
                                  className="mb-4 text-amber-700 bg-amber-100 px-4 py-2 rounded-xl inline-block text-sm font-semibold shadow-md"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  New request from notification
                                </motion.div>
                              )}
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                  <h4 className="text-xl font-bold text-gray-800 mb-2">{request.name}</h4>
                                  <p className="text-gray-600 text-sm mb-3 font-medium">
                                    {typeof request.location === "object"
                                      ? `${request.location.address || ""} ${request.location.city || ""} ${request.location.state || ""} ${request.location.zipCode || ""}`.trim()
                                      : request.location}
                                  </p>
                                  <p className="text-gray-700 mb-4 leading-relaxed">{request.description}</p>

                                  {request.createdBy && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                      <span className="text-sm text-gray-600 font-medium">
                                        Requested by:{" "}
                                        <span className="font-bold text-gray-800">{request.createdBy.name}</span> (
                                        {request.createdBy.email})
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex space-x-4">
                                  <motion.button
                                    className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-semibold shadow-lg transition-all duration-300"
                                    onClick={() => handleApproveCommunity(request._id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaCheck className="mr-2" /> Approve
                                  </motion.button>

                                  <motion.button
                                    className="flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-semibold shadow-lg transition-all duration-300"
                                    onClick={() => handleRejectCommunity(request._id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaTimes className="mr-2" /> Reject
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="relative overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl"></div>
                    <div className="relative p-12 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaUsers className="h-12 w-12 text-emerald-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-800">No pending community requests</h3>
                      <p className="text-gray-600 text-lg">All community requests have been processed</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Enhanced Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                className="p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h1
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Order Management
                </motion.h1>

                <motion.div
                  className="relative overflow-hidden"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl"></div>
                  <div className="relative">
                    <div className="px-8 py-6 border-b border-gray-200/50">
                      <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-200/50">
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Community
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Carbon Saved
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {orders.map((order, index) => (
                            <motion.tr
                              key={order._id}
                              className="hover:bg-gray-50/50 transition-colors duration-200"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + index * 0.05 }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                  {order._id.substring(0, 8)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {order.user?.name || "Unknown"}
                                </div>
                                <div className="text-sm text-gray-500">{order.user?.email || "No email"}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-medium">
                                  {order.community?.name || "Individual Order"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600 font-medium">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">
                                  ${order.totalAmount?.toFixed(2) || "0.00"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={clsx("px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full", {
                                    "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800":
                                      order.status === "processing",
                                    "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800":
                                      order.status === "delivered",
                                    "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800":
                                      order.status !== "processing" && order.status !== "delivered",
                                  })}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-emerald-600 font-bold">
                                  {order.carbonSaved?.toFixed(2) || "0.00"} kg
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Enhanced Products Tab */}
            {activeTab === "products" && (
              <motion.div
                className="p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <motion.h1
                    className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Product Management
                  </motion.h1>

                  <motion.button
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-semibold shadow-xl transition-all duration-300"
                    onClick={handleAddProduct}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FaPlus className="mr-2" />
                    Add New Product
                  </motion.button>
                </div>

                <motion.div
                  className="relative overflow-hidden"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl"></div>
                  <div className="relative">
                    <div className="px-8 py-6 border-b border-gray-200/50 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">All Products</h3>
                      <div className="text-gray-600 font-semibold">Total: {products.length} products</div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-200/50">
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Image
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Inventory
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Eco-Friendly
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-600 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {products.map((product, index) => (
                            <motion.tr
                              key={product._id}
                              className="hover:bg-gray-50/50 transition-colors duration-200"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + index * 0.05 }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-16 w-16 rounded-2xl bg-gray-100 overflow-hidden shadow-md">
                                  {product.imageUrl ? (
                                    <img
                                      src={product.imageUrl || "/placeholder.svg"}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                      <FaImage className="text-gray-400 h-6 w-6" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                                  {product.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600 font-medium">
                                  {product.category || "Uncategorized"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600 font-medium">{product.inventory || "N/A"}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {product.ecoFriendly ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 shadow-md">
                                      <FaLeaf className="mr-1" /> Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                                      No
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-3">
                                  <motion.button
                                    onClick={() => handleEditProduct(product)}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl font-semibold hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 shadow-md"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaEdit className="mr-1" />
                                    Edit
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-xl font-semibold hover:from-red-200 hover:to-pink-200 transition-all duration-300 shadow-md"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaTrash className="mr-1" />
                                    Delete
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {products.length === 0 && (
                      <div className="p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <FaStore className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">No products found</h3>
                        <p className="text-gray-600 mb-6 text-lg">Start by adding your first product</p>
                        <motion.button
                          onClick={handleAddProduct}
                          className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-semibold shadow-xl transition-all duration-300 mx-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaPlus className="mr-2" />
                          Add New Product
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Enhanced Add/Edit Product Modal */}
                <Transition appear show={isModalOpen} as={React.Fragment}>
                  <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                      as={React.Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                      <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                          as={React.Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 scale-95"
                          enterTo="opacity-100 scale-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100 scale-100"
                          leaveTo="opacity-0 scale-95"
                        >
                          <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl p-0 text-left align-middle shadow-2xl transition-all border border-white/50">
                            <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-emerald-50 to-teal-50">
                              <Dialog.Title as="h3" className="text-2xl font-bold text-gray-800">
                                {isEditing ? "Edit Product" : "Add New Product"}
                              </Dialog.Title>
                            </div>

                            <form onSubmit={handleProductSubmit} className="p-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                                  <input
                                    name="name"
                                    value={productForm.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    required
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm transition-all duration-200 font-medium"
                                  />
                                  {productFormErrors.name && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{productFormErrors.name}</p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                  <textarea
                                    name="description"
                                    value={productForm.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter product description"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm transition-all duration-200 font-medium resize-none"
                                  />
                                  {productFormErrors.description && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">
                                      {productFormErrors.description}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <FaDollarSign className="text-gray-400" />
                                    </div>
                                    <input
                                      name="price"
                                      type="number"
                                      step="0.01"
                                      value={productForm.price}
                                      onChange={handleInputChange}
                                      placeholder="0.00"
                                      required
                                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm transition-all duration-200 font-medium"
                                    />
                                  </div>
                                  {productFormErrors.price && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{productFormErrors.price}</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <FaTag className="text-gray-400" />
                                    </div>
                                    <input
                                      name="category"
                                      value={productForm.category}
                                      onChange={handleInputChange}
                                      placeholder="Enter product category"
                                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm transition-all duration-200 font-medium"
                                    />
                                  </div>
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <FaImage className="text-gray-400" />
                                    </div>
                                    <input
                                      name="imageUrl"
                                      value={productForm.imageUrl}
                                      onChange={handleInputChange}
                                      placeholder="Enter image URL"
                                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm transition-all duration-200 font-medium"
                                    />
                                  </div>
                                  {productFormErrors.imageUrl && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">
                                      {productFormErrors.imageUrl}
                                    </p>
                                  )}

                                  {productForm.imageUrl && (
                                    <div className="mt-4">
                                      <div className="h-32 w-32 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-md">
                                        <img
                                          src={productForm.imageUrl || "/placeholder.svg"}
                                          alt="Product preview"
                                          onError={(e) => {
                                            e.target.onerror = null
                                            e.target.src = "https://via.placeholder.com/150?text=Preview"
                                          }}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                      <p className="text-xs text-gray-500 mt-2 font-medium">Image preview</p>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Inventory</label>
                                  <input
                                    name="inventory"
                                    type="number"
                                    value={productForm.inventory}
                                    onChange={handleInputChange}
                                    placeholder="Enter inventory amount"
                                    required
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm transition-all duration-200 font-medium"
                                  />
                                  {productFormErrors.inventory && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">
                                      {productFormErrors.inventory}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <div className="flex items-center">
                                    <input
                                      id="ecoFriendly"
                                      name="ecoFriendly"
                                      type="checkbox"
                                      checked={productForm.ecoFriendly}
                                      onChange={handleInputChange}
                                      className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                    />
                                    <label htmlFor="ecoFriendly" className="ml-3 text-sm font-bold text-gray-700">
                                      This product is eco-friendly
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-8 flex justify-end space-x-4">
                                <motion.button
                                  type="button"
                                  onClick={() => setIsModalOpen(false)}
                                  className="px-6 py-3 border-2 border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300 shadow-md"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Cancel
                                </motion.button>
                                <motion.button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-semibold transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                      {isEditing ? "Updating..." : "Creating..."}
                                    </>
                                  ) : (
                                    <>{isEditing ? "Update Product" : "Create Product"}</>
                                  )}
                                </motion.button>
                              </div>
                            </form>
                          </Dialog.Panel>
                        </Transition.Child>
                      </div>
                    </div>
                  </Dialog>
                </Transition>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
