const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/User");
const Patient = require("../models/Patient");
const ClinicalEvent = require("../models/ClinicalEvent");
const Appointment = require("../models/Appointment");
const AIReport = require("../models/AIReport");
const DoctorNote = require("../models/DoctorNote");
const Notification = require("../models/Notification");
const connectDB = require("../config/db");

const seedClinicalData = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    // 1. Create or find Demo Doctor
    let doctor = await User.findOne({ email: "doctor@ora.ai" });
    if (!doctor) {
      doctor = await User.create({
        name: "Dr. Alex Vance",
        email: "doctor@ora.ai",
        password: "Password123!",
        role: "dentist",
      });
      console.log("Created demo doctor: doctor@ora.ai");
    }

    // 2. Clear existing clinical data for clean seed
    await Patient.deleteMany({ doctor: doctor._id });
    await ClinicalEvent.deleteMany({ doctor: doctor._id });
    await Appointment.deleteMany({ doctor: doctor._id });
    await AIReport.deleteMany({});
    await DoctorNote.deleteMany({ doctor: doctor._id });
    await Notification.deleteMany({ user: doctor._id });

    // 3. Patient 1: Sara Smith (Tooth 36 Demo Patient)
    const sara = await Patient.create({
      doctor: doctor._id,
      firstName: "Sara",
      lastName: "Smith",
      dob: new Date("1995-04-12"),
      gender: "female",
      phone: "+1 (555) 234-5678",
      email: "sara.smith@example.com",
      teeth: [
        {
          toothId: "36",
          state: { condition: "caries", restoration: "composite", surface: "occlusal", attention: true },
          notes: "Tooth 36 presents occlusal caries and margin stain. High priority for AI diagnostic evaluation.",
          updatedAt: new Date(),
        },
        {
          toothId: "16",
          state: { condition: "healthy", restoration: "amalgam", surface: "distal", attention: false },
          notes: "Sound amalgam restoration placed 2024.",
        },
        {
          toothId: "21",
          state: { condition: "healthy", restoration: "none", surface: "sound", attention: false },
          notes: "Central incisor in good alignment.",
        },
      ],
      medicalHistory: [
        { condition: "Asthma", diagnosedAt: new Date("2020-01-15"), status: "active", notes: "Uses Albuterol inhaler before pre-op sedation" },
        { condition: "Seasonal Allergies", diagnosedAt: new Date("2019-05-10"), status: "active", notes: "Mild antihistamine usage" },
      ],
      medications: [
        { name: "Albuterol Inhaler", dosage: "90mcg", frequency: "As needed", notes: "Confirm inhaler present prior to procedures" },
        { name: "Multivitamin", dosage: "1 Tablet", frequency: "Daily" },
      ],
      allergies: [
        { allergen: "Penicillin", reaction: "Severe skin rash & dyspnea", severity: "severe", notes: "STRICT WARNING: Do not prescribe Amoxicillin" },
      ],
      attachments: [
        { fileName: "Tooth_36_Intraoral_Scan.jpg", url: "assets/predict/1787152349806-872f36fc772e2bd9.jpg", tag: "intraoral-scan" },
        { fileName: "ADA_Clinical_Guidelines_2025.pdf", url: "assets/patient/ADA_Guidelines_Sample.pdf", mimeType: "application/pdf", tag: "pdf-reference" },
      ],
      research: [
        { title: "Class I Composite Restoration of Lower First Molars (Tooth 36)", url: "https://pubmed.ncbi.nlm.nih.gov/34521099/", source: "PubMed", summary: "Evidence-based guidelines for lower molar restorative dentistry." },
        { title: "Impact of Systemic Asthma Inhalers on Oral Mucosa Health", url: "https://pubmed.ncbi.nlm.nih.gov/38910221/", source: "PubMed", summary: "Clinical management of xerostomia and mucosal irritation in asthmatic patients." },
      ],
      notes: [
        { text: "Patient flagged Tooth 36 occlusal surface stain. Caries risk assessment completed.", category: "diagnosis", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_sara_01", author: doctor._id },
        { text: "Pre-op sedation check: Albuterol inhaler verified OK.", category: "treatment", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_sara_02", author: doctor._id },
      ],
    });

    // 4. Patient 2: John Doe (Gingivitis & Tooth 46)
    const john = await Patient.create({
      doctor: doctor._id,
      firstName: "John",
      lastName: "Doe",
      dob: new Date("1988-11-20"),
      gender: "male",
      phone: "+1 (555) 876-5432",
      email: "john.doe@example.com",
      teeth: [
        { toothId: "46", state: { condition: "gingivitis", restoration: "none", surface: "cervical", attention: true }, notes: "Localized cervical gingival inflammation around lower right molar." },
      ],
      medicalHistory: [{ condition: "Hypertension", diagnosedAt: new Date("2021-03-10"), status: "active", notes: "Monitored, blood pressure 125/82" }],
      medications: [{ name: "Lisinopril", dosage: "10mg", frequency: "Once daily" }],
      allergies: [{ allergen: "Latex", reaction: "Local contact dermatitis", severity: "moderate", notes: "Use nitrile examination gloves" }],
      research: [{ title: "Periodontal Debridement & Subgingival Scaling Protocol 2025", url: "https://pubmed.ncbi.nlm.nih.gov/37621008/", source: "PubMed", summary: "Efficacy of ultrasonic vs hand scaling in localized adult gingivitis." }],
      notes: [{ text: "Gingival probing depth < 3mm. Periodontal scaling scheduled.", category: "treatment", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_john_01", author: doctor._id }],
    });

    // 5. Patient 3: Emily Davis (Routine Checkup)
    const emily = await Patient.create({
      doctor: doctor._id,
      firstName: "Emily",
      lastName: "Davis",
      dob: new Date("2001-08-05"),
      gender: "female",
      phone: "+1 (555) 345-6789",
      email: "emily.davis@example.com",
      teeth: [{ toothId: "11", state: { condition: "healthy", restoration: "none", surface: "sound", attention: false }, notes: "Healthy incisor" }],
      research: [{ title: "Preventive Pediatric & Young Adult Fluoride Varnish Guidelines", url: "https://pubmed.ncbi.nlm.nih.gov/35619087/", source: "PubMed", summary: "Bi-annual 5% NaF varnish efficacy in preventing smooth surface caries." }],
      notes: [{ text: "Routine 6-month prophylaxis and oral hygiene review.", category: "general", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_emily_01", author: doctor._id }],
    });

    // 6. Patient 4: Marcus Vance (Crown & Tooth 26)
    const marcus = await Patient.create({
      doctor: doctor._id,
      firstName: "Marcus",
      lastName: "Vance",
      dob: new Date("1979-02-14"),
      gender: "male",
      phone: "+1 (555) 901-2345",
      email: "marcus.vance@example.com",
      teeth: [{ toothId: "26", state: { condition: "healthy", restoration: "crown", surface: "occlusal", attention: false }, notes: "Zirconia crown placed 2025" }],
      research: [{ title: "Zirconia vs E-Max All-Ceramic Crown Longevity Study", url: "https://pubmed.ncbi.nlm.nih.gov/38210982/", source: "PubMed", summary: "10-year clinical retention rates for posterior monolithic zirconia crowns." }],
      notes: [{ text: "Zirconia crown on Tooth 26 checked and margins well sealed.", category: "treatment", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_marcus_01", author: doctor._id }],
    });

    // 7. Patient 5: Hannah Abbott (Tooth Discoloration)
    const hannah = await Patient.create({
      doctor: doctor._id,
      firstName: "Hannah",
      lastName: "Abbott",
      dob: new Date("1999-12-01"),
      gender: "female",
      phone: "+1 (555) 432-1098",
      email: "hannah.abbott@example.com",
      teeth: [{ toothId: "12", state: { condition: "discoloration", restoration: "none", surface: "facial", attention: true }, notes: "Enamel fluorosis stain" }],
      research: [{ title: "Enamel Microabrasion & Bleaching Outcomes in Fluorosis", url: "https://pubmed.ncbi.nlm.nih.gov/36712091/", source: "PubMed", summary: "Minimally invasive aesthetic management of mild anterior enamel mottling." }],
      notes: [{ text: "Enamel microabrasion and bleaching discussed.", category: "diagnosis", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_hannah_01", author: doctor._id }],
    });

    // 8. Patient 6: David Miller (Tooth 14 Premolar Caries)
    const david = await Patient.create({
      doctor: doctor._id,
      firstName: "David",
      lastName: "Miller",
      dob: new Date("1984-06-30"),
      gender: "male",
      phone: "+1 (555) 678-9012",
      email: "david.miller@example.com",
      teeth: [{ toothId: "14", state: { condition: "caries", restoration: "none", surface: "mesial", attention: true }, notes: "Interproximal caries on upper right 1st premolar" }],
      notes: [{ text: "Class II bite-wing radiograph confirms mesial caries on Tooth 14.", category: "diagnosis", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_david_01", author: doctor._id }],
    });

    // 9. Patient 7: Sophia Martinez (Ulcers)
    const sophia = await Patient.create({
      doctor: doctor._id,
      firstName: "Sophia",
      lastName: "Martinez",
      dob: new Date("1993-09-18"),
      gender: "female",
      phone: "+1 (555) 789-0123",
      email: "sophia.martinez@example.com",
      teeth: [{ toothId: "31", state: { condition: "ulcers", restoration: "none", surface: "lingual", attention: true }, notes: "Aphthous ulcer on labial mucosa near lower incisor" }],
      research: [{ title: "Topical Corticosteroid Management in Recurrent Aphthous Stomatitis", url: "https://pubmed.ncbi.nlm.nih.gov/34190822/", source: "PubMed", summary: "Accelerating ulcer healing with Triamcinolone acetonide dental paste." }],
      notes: [{ text: "Prescribed Triamcinolone paste for aphthous ulcer relief.", category: "treatment", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_sophia_01", author: doctor._id }],
    });

    // 10. Patient 8: James Wilson (Tooth 44 Restoration)
    const james = await Patient.create({
      doctor: doctor._id,
      firstName: "James",
      lastName: "Wilson",
      dob: new Date("1975-01-22"),
      gender: "male",
      phone: "+1 (555) 890-1234",
      email: "james.wilson@example.com",
      teeth: [{ toothId: "44", state: { condition: "healthy", restoration: "composite", surface: "occlusal", attention: false }, notes: "Composite restoration Tooth 44" }],
      notes: [{ text: "Routine follow-up for lower right premolar restoration.", category: "general", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_james_01", author: doctor._id }],
    });

    // 11. Patient 9: Olivia Taylor (Tooth 21 Veneer)
    const olivia = await Patient.create({
      doctor: doctor._id,
      firstName: "Olivia",
      lastName: "Taylor",
      dob: new Date("2003-03-14"),
      gender: "female",
      phone: "+1 (555) 901-3456",
      email: "olivia.taylor@example.com",
      teeth: [{ toothId: "21", state: { condition: "healthy", restoration: "crown", surface: "facial", attention: false }, notes: "Porcelain veneer Tooth 21" }],
      notes: [{ text: "Porcelain veneer shade match A1 confirmed.", category: "treatment", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_olivia_01", author: doctor._id }],
    });

    // 12. Patient 10: Alexander White (Wisdom Tooth 38)
    const alexander = await Patient.create({
      doctor: doctor._id,
      firstName: "Alexander",
      lastName: "White",
      dob: new Date("1996-07-09"),
      gender: "male",
      phone: "+1 (555) 012-3456",
      email: "alexander.white@example.com",
      teeth: [{ toothId: "38", state: { condition: "caries", restoration: "none", surface: "distal", attention: true }, notes: "Impacted lower left 3rd molar with pericoronitis risk" }],
      notes: [{ text: "Surgical extraction referral evaluated for Tooth 38.", category: "diagnosis", isRagIndexed: true, ragStatus: "indexed", vectorDbId: "vec_note_alexander_01", author: doctor._id }],
    });

    // 13. Clinical Events
    await ClinicalEvent.create([
      { patient: sara._id, toothId: "36", doctor: doctor._id, date: new Date("2025-05-10"), type: "diagnosis", title: "Initial Occlusal Fissure Caries Detection", description: "Detected initial fissure caries on lower left first molar (Tooth 36)." },
      { patient: sara._id, toothId: "36", doctor: doctor._id, date: new Date("2025-05-20"), type: "procedure", title: "Class I Composite Resin Restoration", description: "Completed composite resin restoration on Tooth 36 occlusal surface." },
      { patient: sara._id, toothId: "36", doctor: doctor._id, date: new Date("2026-08-01"), type: "ai-analysis", title: "AI Photo Analysis (Caries 86.0%)", description: "Scan linked to Tooth 36. Margin discoloration noted." },
      { patient: john._id, toothId: "46", doctor: doctor._id, date: new Date("2026-08-10"), type: "procedure", title: "Periodontal Scaling & Debridement", description: "Ultrasonic scaling completed around lower right molars." },
      { patient: marcus._id, toothId: "26", doctor: doctor._id, date: new Date("2025-11-15"), type: "procedure", title: "Zirconia Crown Placement", description: "Permanent crown cemented on Tooth 26." },
      { patient: david._id, toothId: "14", doctor: doctor._id, date: new Date("2026-08-12"), type: "diagnosis", title: "Class II Bite-wing Radiograph Caries Confirmation", description: "Interproximal enamel radiolucency observed." },
      { patient: sophia._id, toothId: "31", doctor: doctor._id, date: new Date("2026-08-14"), type: "treatment", title: "Topical Oral Corticosteroid Application", description: "Applied Triamcinolone paste to mucosa." },
    ]);

    // 14. Appointments (Multi-date coverage)
    const today = new Date();
    const todayMorning = new Date(today); todayMorning.setHours(9, 30, 0, 0);
    const todayAfternoon = new Date(today); todayAfternoon.setHours(14, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(10, 0, 0, 0);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 5); nextWeek.setHours(11, 30, 0, 0);
    const past = new Date(today); past.setDate(past.getDate() - 7); past.setHours(15, 0, 0, 0);

    await Appointment.create([
      { patient: sara._id, doctor: doctor._id, dateTime: todayMorning, type: "AI Tooth Analysis & Clean", reason: "Tooth 36 examination", status: "checked-in" },
      { patient: john._id, doctor: doctor._id, dateTime: todayAfternoon, type: "Periodontal Check", reason: "Gingivitis follow-up", status: "scheduled" },
      { patient: emily._id, doctor: doctor._id, dateTime: tomorrow, type: "Routine Checkup", reason: "Six-month cleaning", status: "scheduled" },
      { patient: marcus._id, doctor: doctor._id, dateTime: nextWeek, type: "Consultation", reason: "Crown evaluation", status: "scheduled" },
      { patient: david._id, doctor: doctor._id, dateTime: todayAfternoon, type: "Composite Restoration", reason: "Tooth 14 mesial caries fill", status: "scheduled" },
      { patient: hannah._id, doctor: doctor._id, dateTime: past, type: "Consultation", reason: "Discoloration assessment", status: "completed" },
    ]);

    // 15. AI Reports
    await AIReport.create([
      { patient: sara._id, scope: "tooth", toothId: "36", status: "awaiting-review", contextSnapshot: { toothId: "36", patientName: "Sara Smith" }, result: { mockDiagnosis: "Mild Caries & Surface Discoloration on Tooth 36", confidence: 0.89, recommendedProcedure: "Fluoride Sealant & Composite Polishing" } },
      { patient: john._id, scope: "patient", status: "pending", contextSnapshot: { patientName: "John Doe", scope: "Full Arch Scan" } },
      { patient: david._id, scope: "tooth", toothId: "14", status: "awaiting-review", contextSnapshot: { toothId: "14", patientName: "David Miller" }, result: { mockDiagnosis: "Interproximal Caries Tooth 14", confidence: 0.92, recommendedProcedure: "Class II Composite Fill" } },
    ]);

    // 16. Doctor Scratchpad Notes
    await DoctorNote.create([
      { doctor: doctor._id, text: "Review Tooth 36 AI analysis results for Sara Smith before afternoon session.", pinned: true },
      { doctor: doctor._id, text: "Order new composite resin supplies (A2 shade running low).", pinned: false },
      { doctor: doctor._id, text: "Confirm nitrile gloves in stock for John Doe (Latex allergy).", pinned: true },
      { doctor: doctor._id, text: "Schedule bite-wing radiograph follow-up for David Miller Tooth 14.", pinned: false },
    ]);

    // 17. Notifications
    await Notification.create([
      { user: doctor._id, title: "Sara Smith — Appointment Today", message: "Tooth 36 examination at 9:30 AM", type: "appointment", read: false },
      { user: doctor._id, title: "Tooth 36 AI Analysis Ready", message: "Mild Caries report waiting for doctor review", type: "ai_report", read: false },
      { user: doctor._id, title: "Tooth 14 Interproximal Caries Detected", message: "David Miller AI report generated (92.0% confidence)", type: "ai_report", read: false },
      { user: doctor._id, title: "Low Stock Alert: Composite Resin", message: "Qty: 4 (Threshold: 10)", type: "inventory", read: false },
    ]);

    console.log("Massive clinical seeding complete across 10 patients, appointments, PubMed research, and AI reports!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedClinicalData();
