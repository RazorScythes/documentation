import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!email) {
      errors.email = "Email is required";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setFormErrors(errors);

    // Submit form if there are no errors
    if (Object.keys(errors).length === 0) {
      console.log("Form submitted");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="px-6 py-8">
            <div className="flex flex-col items-center mb-6">
              <FaEnvelope className="text-gray-400" size={24} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`mt-4 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.email
                    ? "border-red-500 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                } sm:text-sm`}
                placeholder="Email address"
              />
            </div>
            {formErrors.email && (
              <p className="mt-2 text-sm text-red-600" id="email-error">
                {formErrors.email}
              </p>
            )}
            <div className="flex flex-col items-center mt-6">
              <FaLock className="text-gray-400" size={24} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`mt-4 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.password
                    ? "border-red-500 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                } sm:text-sm`}
                placeholder="Password"
              />
            </div>
            {formErrors.password && (
              <p className="mt-2 text-sm text-red-600" id="password-error">
                {formErrors.password}
              </p>
            )}
            <div className="flex flex-col items-center mt-6">
              <FaLock className="text-gray-400" size={24} />
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                value={            confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`mt-4 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  formErrors.confirmPassword
                    ? "border-red-500 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                } sm:text-sm`}
                placeholder="Confirm Password"
              />
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600" id="confirm-password-error">
                {formErrors.confirmPassword}
              </p>
            )}
            <div className="mt-6">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
)}

export default RegisterForm