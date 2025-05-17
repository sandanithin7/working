import { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    setLoading(true);
    try {
      const res = await adminApi.auth.forgotPassword({ email });
      toast.success(res.data.message || "Reset link sent to your email");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-red-600">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
          >
            {loading ? "Sending..." : "RESET PASSWORD"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <span className="text-gray-700">Remembered your password?</span>{" "}
          <Link
            to="/login"
            className="text-red-500 font-semibold hover:underline"
          >
            Back to Login →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
