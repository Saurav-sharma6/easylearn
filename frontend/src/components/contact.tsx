import { useState } from "react";
import axios from "axios";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post("http://localhost:5000/api/contact", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to submit. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white py-10 px-6 max-w-2xl mx-auto rounded-lg shadow-lg to-black">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Contact Us</h2>

      {submitted ? (
        <div className="text-center text-green-600 text-lg font-medium">
          ✅ Thank you for contacting us! We’ll get back to you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block font-medium text-gray-700">
              Message
            </label>
            <textarea
              name="message"
              required
              rows={4}
              color="black"
              value={formData.message}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Type your message..."
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
