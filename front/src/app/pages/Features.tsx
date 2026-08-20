import { Link } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import {
  Scan,
  Zap,
  Activity,
  Microscope,
  Sparkles,
  Shield,
  Bot,
  Grid,
  Calendar,
  FileText,
  Database,
  Cpu,
  Layers,
} from "lucide-react";

export default function Features() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#1F6FEB] px-4 py-2 rounded-full mb-6 text-xs font-bold border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Dual Ecosystem: Consumer Scan App + Doctor Clinical Operating System</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900">
            Powerful{" "}
            <span className="bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] bg-clip-text text-transparent">
              AI Clinical Features
            </span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Discover how Ora AI combines 6-class deep learning disease classification with an enterprise-grade Doctor Command Center, FDI anatomical charting, and Vector DB RAG note indexing.
          </p>
        </div>
      </section>

      {/* Main 6-Feature Platform Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card variant="hover" className="p-6 border border-slate-200 bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Scan className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Automated 6-Class Disease Detection</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                FastAPI Python AI microservice running EfficientNet transfer learning models trained to classify Calculus, Caries, Gingivitis, Hypodontia, Discoloration, and Ulcers in under 3 seconds.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">EfficientNet CNN</span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">FastAPI Microservice</span>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card variant="hover" className="p-6 border border-slate-200 bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Grid className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Interactive FDI Anatomical Odontogram</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Interactive 32-tooth anatomical SVG chart supporting FDI two-digit notation (11–48) and common anatomical names (e.g. Tooth 36 Lower Left 1st Molar) with 5 surface zones per tooth.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">FDI 11–48 Notation</span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">Anatomical SVG Graphics</span>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card variant="hover" className="p-6 border border-slate-200 bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. 7-Step Evidence Pipeline & Comparator</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Assembles tooth state, clinical events, doctor notes, medical conditions, knowledge base, and PubMed research. Includes side-by-side scan vs historical evidence comparator.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg">7 Evidence Groups</span>
                <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg">Side-by-Side Comparator</span>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card variant="hover" className="p-6 border border-slate-200 bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">4. Vector DB & RAG Chat Memory</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Doctor notes auto-embedded with vector IDs (`vec_note_...`) for RAG retrieval. Chat assistant references indexed notes, uploaded PDFs, and generates structured Markdown reports.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">Vector DB RAG</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">Markdown Report Drafts</span>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card variant="hover" className="p-6 border border-slate-200 bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">5. Doctor Command Center & Calendar</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                8-card live dashboard with attention flag radar, AI report review queue, supply marketplace alerts, doctor scratchpad, and interactive calendar with instant status quick toggles.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">8-Card Command Center</span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">Interactive Calendar</span>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card variant="hover" className="p-6 border border-slate-200 bg-white">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Cpu className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">6. 3-Tier Monorepo Infrastructure</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Clean architectural separation: React 18 + Vite frontend, Express + Mongoose REST API backend, and FastAPI Python AI microservice with single stub plug-in contracts.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg">3-Tier Monorepo</span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg">Single Stub Plug-in</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Card
            variant="glass"
            className="text-center bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-10 rounded-3xl"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to Experience the Clinical Workspace?
            </h2>
            <p className="text-slate-300 text-base mb-8 max-w-xl mx-auto">
              Test our AI scan engine or launch the doctor command center directly in your browser.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/ai-tool">
                <Button variant="glass" size="lg" className="bg-blue-600 text-white hover:bg-blue-700 border-none font-bold">
                  <Sparkles className="w-5 h-5" />
                  Try Free AI Scan
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold">
                  <Grid className="w-5 h-5" />
                  Launch Doctor Command Center
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
