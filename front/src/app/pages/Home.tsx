import {
  Award,
  FileCheck,
  Scan,
  Sparkles,
  Star,
  Upload,
  Users,
  Grid,
  Bot,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FAQ } from "../components/FAQ";
import { goToElementById } from "../utils/helper";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* AI Model Status Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-100 text-[#1F6FEB] px-4 py-2 rounded-full mb-6 text-xs font-bold border border-blue-200 shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>AI Model v1.2 Active • 6 Conditions • Sub-50ms Latency</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-slate-900">
                Next-Gen AI Dental Analysis &{" "}
                <span className="bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] bg-clip-text text-transparent">
                  Clinical Workspace
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Upload intraoral photos for instant automated disease classification or launch the doctor command center for full patient workspace management, FDI odontograms, and RAG chat.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button to="/ai-tool" size="lg">
                  <Upload className="w-5 h-5" />
                  Try Free AI Scan
                </Button>
                <Button to="/dashboard" variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 font-bold">
                  <Grid className="w-5 h-5" />
                  Launch Doctor Command Center
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1769559893692-c6d0623bf8e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBzbWlsZSUyMHRlZXRoJTIwY2hlY2t1cHxlbnwxfHx8fDE3NzM0MzQ4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Dental Analysis"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Dentists & Clinical Workspace Feature Banner */}
      <section className="py-16 px-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="bg-blue-500/20 text-blue-300 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-blue-400/30">
              For Dental Professionals & DSOs
            </span>
            <h2 className="text-3xl font-extrabold">Complete Doctor Clinical Operating System</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Equip your dental practice with real-time command center analytics, 10-tab patient workspaces, interactive FDI teeth charting, Vector DB RAG note indexing, and automated PubMed evidence assembly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/patients" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md">
              Explore Patient Workspace
            </Link>
            <Link to="/chat" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md flex items-center gap-2">
              <Bot className="h-4 w-4" /> Open RAG Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Patient-to-Clinic Flywheel Ecosystem Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Patient-to-Clinic Connected Ecosystem</h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              How Ora AI bridges consumer intraoral photo scans directly into doctor clinical workspace workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card variant="hover" className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 mb-2">1. Photo Scan Intake</h3>
              <p className="text-xs text-slate-600">Patient uploads intraoral photo via smartphone or web app.</p>
            </Card>

            <Card variant="hover" className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 mb-2">2. AI Inference</h3>
              <p className="text-xs text-slate-600">EfficientNet classifies 6 conditions with instant confidence scores.</p>
            </Card>

            <Card variant="hover" className="p-6 text-center">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 mb-2">3. Doctor Workspace</h3>
              <p className="text-xs text-slate-600">Scan auto-links to patient record, FDI Tooth 36, and 10 workspace tabs.</p>
            </Card>

            <Card variant="hover" className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h3 className="font-bold text-slate-900 mb-2">4. 7-Step Evidence Plan</h3>
              <p className="text-xs text-slate-600">Doctor reviews AI report, approves treatment plan, and schedules follow-up.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* 6 Oral Disease Classifications Grid */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">6 Automated Disease Classifications</h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Our FastAPI AI engine runs transfer learning models trained to detect key oral conditions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Caries</h4>
              <p className="text-slate-600 text-xs">Detects early-stage fissure decay, enamel cavities, and margin stains.</p>
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Calculus</h4>
              <p className="text-slate-600 text-xs">Identifies supragingival and subgingival tartar deposits along tooth margins.</p>
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Gingivitis</h4>
              <p className="text-slate-600 text-xs">Monitors localized cervical gum inflammation and redness.</p>
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Tooth Discoloration</h4>
              <p className="text-slate-600 text-xs">Evaluates enamel fluorosis, extrinsic coffee/tea stains, and mottling.</p>
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                5
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Ulcers</h4>
              <p className="text-slate-600 text-xs">Surfaces oral mucosal lesions and recurrent aphthous stomatitis.</p>
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                6
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Hypodontia</h4>
              <p className="text-slate-600 text-xs">Flags missing tooth positions for orthodontic evaluation.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Verified Doctor Testimonials & Endorsements */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Trusted by Dental Professionals</h2>
            <p className="text-slate-600 text-base">Hear how Ora AI is streamlining practice workflows.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="hover" className="p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 text-sm italic mb-6">
                "The 7-step evidence pipeline and FDI Odontogram give my patients visual confidence in their treatment plans. It saves me 1.5 hours of note-writing every day!"
              </p>
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Dr. Alex Vance, DDS</h4>
                  <p className="text-xs text-slate-500">Lead Restorative Dentist</p>
                </div>
              </div>
            </Card>

            <Card variant="hover" className="p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 text-sm italic mb-6">
                "Having Vector DB RAG indexing built directly into our doctor notes means I can ask the AI assistant about any patient history item instantly."
              </p>
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Dr. Sarah Jenkins</h4>
                  <p className="text-xs text-slate-500">Periodontal Specialist</p>
                </div>
              </div>
            </Card>

            <Card variant="hover" className="p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 text-sm italic mb-6">
                "The Doctor Command Center dashboard keeps our 3 clinic locations operating seamlessly. Appointments, AI reviews, and supply alerts all in one place."
              </p>
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Dr. Michael Chang</h4>
                  <p className="text-xs text-slate-500">DSO Practice Director</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  );
}
