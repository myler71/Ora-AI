import { AlertCircle, Home } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/Button";
import { Footer } from "../components/Footer";

export default function NotFound() {
  return (
    <div className="pt-[72px]">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Page Not Found
          </h2>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button to="/" size="lg">
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
            <Button to="/ai-tool" variant="outline" size="lg">
              Try AI Scan
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
