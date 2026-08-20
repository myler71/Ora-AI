import { Heart, Lightbulb, Target } from "lucide-react";
import { Card } from "../components/Card";

export default function About() {
  return (
    <div>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] bg-clip-text text-transparent">
              Ora AI
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We're on a mission to make dental health accessible to everyone
            through the power of artificial intelligence and cutting-edge
            technology.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Ora AI, we believe that everyone deserves access to quality
                dental health insights. Our AI-powered platform democratizes
                dental care by providing instant, accurate analysis that was
                previously only available through expensive professional
                consultations.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We're bridging the gap between technology and healthcare, making
                it easier for people to take proactive steps in maintaining
                their dental health.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1758653500342-5476c8ec3da6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50aXN0JTIwcHJvZmVzc2lvbmFsJTIwbWVkaWNhbHxlbnwxfHx8fDE3NzM0MzQ4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Dental Professional"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">What drives us every day</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="hover">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Accuracy First</h3>
              <p className="text-gray-600">
                We're committed to providing the most accurate AI-powered dental
                analysis, validated by dental professionals.
              </p>
            </Card>

            <Card variant="hover">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Patient Care</h3>
              <p className="text-gray-600">
                Every feature we build is designed with patient well-being and
                accessibility at the forefront.
              </p>
            </Card>

            <Card variant="hover">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously push the boundaries of AI technology to deliver
                better dental health solutions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Our AI Technology</h2>
            <p className="text-xl text-gray-600">
              Powered by cutting-edge machine learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1761305135372-bc5c84c402d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3klMjBmdXR1cmlzdGljJTIwaW50ZXJmYWNlfGVufDF8fHx8MTc3MzMyNTA4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="AI Technology"
                className="rounded-3xl shadow-2xl"
              />
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-6">
                Advanced Deep Learning Models
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our AI models are trained on millions of dental images, reviewed
                and validated by certified dental professionals. Using
                state-of-the-art computer vision and deep learning techniques,
                we can detect:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#3FA9F5] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Early-stage cavities with 98% accuracy
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#3FA9F5] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Gum inflammation and disease indicators
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#3FA9F5] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Plaque buildup and cleaning recommendations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#3FA9F5] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Tooth alignment and smile improvement suggestions
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
