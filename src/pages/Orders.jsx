import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import adminApi from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch orders on component mount and set up polling
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.orders.getAll();
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      const response = await adminApi.orders.updateStatus(orderId, newStatus);

      if (response.data) {
        // Update local state with the updated order from the response
        setOrders(
          orders.map((order) =>
            order._id === orderId ? response.data.order : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setIsUpdating(true);
      const response = await adminApi.orders.updateStatus(orderId, "cancelled");

      if (response.data) {
        // Update local state with the updated order from the response
        setOrders(
          orders.map((order) =>
            order._id === orderId ? response.data.order : order
          )
        );
        toast.success("Order cancelled successfully");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        {/* <h1 className="text-3xl font-bold">Orders Management</h1> */}
        <h1 className="text-3xl font-bold text-black-500">Orders Management</h1>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-red-600 text-white rounded-md  disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                        disabled={
                          isUpdating ||
                          order.status === "cancelled" ||
                          order.status === "delivered"
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">
                          Out for Delivery
                        </option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.deliveryDate)} at{" "}
                      {formatTime(order.deliveryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View Details
                      </button>
                      {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isUpdating}
                          >
                            Cancel
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold">Order Information</h3>
                <p>Order ID: #{selectedOrder._id.slice(-6)}</p>
                <p>Customer: {selectedOrder.user?.name || "N/A"}</p>
                <p>Email: {selectedOrder.user?.email || "N/A"}</p>
                <p>Phone: {selectedOrder.user?.phone || "N/A"}</p>
                <p>Order Date: {formatDate(selectedOrder.createdAt)}</p>
                <p>Delivery Date: {formatDate(selectedOrder.deliveryDate)}</p>
                <p>Delivery Time: {formatTime(selectedOrder.deliveryTime)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Delivery Information</h3>
                <p>
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </p>
                <p>Payment Status: {selectedOrder.paymentStatus}</p>
                {selectedOrder.driver && (
                  <>
                    <p>Driver: {selectedOrder.driver?.name || "N/A"}</p>
                    <p>Driver Phone: {selectedOrder.driver?.phone || "N/A"}</p>
                  </>
                )}
                <p>
                  Address: {selectedOrder.deliveryAddress?.street},{" "}
                  {selectedOrder.deliveryAddress?.city},{" "}
                  {selectedOrder.deliveryAddress?.state} -{" "}
                  {selectedOrder.deliveryAddress?.pincode}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Products</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left">Product</th>
                    <th className="text-left">Quantity</th>
                    <th className="text-left">Price</th>
                    <th className="text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.name || "N/A"}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>₹{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right font-semibold">
                      Total Amount:
                    </td>
                    <td className="font-semibold">
                      ₹{selectedOrder.totalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {selectedOrder.notes && (
              <div className="mb-4">
                <h3 className="font-semibold">Notes</h3>
                <p className="text-gray-600">{selectedOrder.notes}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
