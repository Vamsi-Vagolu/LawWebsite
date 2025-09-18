"use client";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-gray-700 mb-8">
        Have questions or need assistance? Reach out to us using the form below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="mb-2"><span className="font-medium">Email:</span> info@lawfirmedu.com</p>
          <p className="mb-2"><span className="font-medium">Phone:</span> +91 98765 43210</p>
          <p><span className="font-medium">Address:</span> Hyderabad, India</p>
        </div>

        {/* Contact Form */}
        <form className="space-y-4 p-6 bg-white rounded shadow">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Message"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <button className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
