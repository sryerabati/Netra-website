# Netra

Netra is an AI-powered screening assistant that helps nurses and field workers quickly detect signs of diabetic retinopathy in rural areas. Using existing retina scanners, they capture fundus images that Netra analyzes locally — no internet or cloud needed — and classifies on a 0-to-4 severity scale. Doctors can then review the AI’s result, see the image, and instantly add notes or next-step recommendations. This workflow speeds up mass screenings, reduces doctor workload, and brings early eye-disease detection to communities that often lack access to ophthalmologists. Netra streamlines care and helps prevent avoidable blindness.

## Why Netra
- **Bridge the care gap:** Deliver diabetic eye screenings in locations without on-site specialists.
- **Work offline:** Run inference on the edge so connectivity never blocks care.
- **Support collaborative care:** Give physicians the context they need to validate AI predictions and guide treatment.

## Core Workflow

| Step | Field Team Experience | Physician Experience |
|------|-----------------------|----------------------|
| 1. Capture | Upload retinal fundus imagery captured via portable cameras. | Receive immediate access to the new case from the clinician dashboard. |
| 2. Analyze | Netra processes the image and returns a DR grade (0–4) with confidence. | Review the AI prediction alongside the original image and supporting heatmaps (when available). |
| 3. Act | Nurses view triage guidance, flag critical cases, and log notes from the field. | Add clinical notes, recommendations, and follow-up plans that sync back to the frontline team. |

## Feature Highlights

### Frontline Screening Tools
- Guided uploader for JPG/PNG/JPEG fundus images with real-time previews.
- Automatic preprocessing (resize, normalization) before sending to the inference service.
- Offline-first design goals for future mobile and PWA deployments.

### Physician & Specialist Dashboard
- Case queues with filters by severity, location, and submission time.
- Full-screen image review with zoom/pan and optional Grad-CAM overlays.
- Structured note taking with urgency tags (Routine / Monitor / Immediate Action).

### Shared Platform Services
- Role-based authentication with verification for licensed medical staff.
- Longitudinal patient timelines showing historical scans and DR trends.
- Notifications for new submissions, updated notes, and scheduled follow-ups.

## Architecture Overview
- **Frontend:** React + TypeScript + Tailwind CSS (Vite) providing a responsive glassmorphism-inspired interface.
- **State & Animation:** Framer Motion for UI micro-interactions and contextual animations.
- **API Layer:** Service stubs in `src/services/api.ts` demonstrate how retinal images will be sent to the inference backend.
- **Planned Backend:** Django REST Framework connected to a TensorFlow/PyTorch model host (AWS or Colab), with storage on S3 and a PostgreSQL database for user, scan, and note records.

```
Netra-website/
├── src/
│   ├── components/        # Reusable UI building blocks (navbar, uploader, results)
│   ├── contexts/          # Future shared state providers
│   ├── services/          # API wrappers (currently mocked inference)
│   ├── App.tsx            # Primary application layout and workflow logic
│   └── index.css          # Tailwind directives and theme tokens
├── public/
└── ...
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+ (or pnpm/yarn with equivalent scripts)

### Installation
```bash
# install dependencies
npm install

# start the local development server
npm run dev
```
Visit the URL printed in the terminal (defaults to http://localhost:5173) to view the application.

### Additional Scripts
- `npm run build` – Create a production build with Vite.
- `npm run preview` – Serve the production build locally for smoke testing.
- `npm run lint` – Run ESLint across the project.
- `npm run typecheck` – Execute TypeScript in no-emit mode to ensure typings stay sound.

## Roadmap
- Integrate secure image upload backed by HIPAA-aligned storage.
- Connect to the cloud-hosted inference service and surface Grad-CAM overlays.
- Launch doctor-patient messaging threads with audit logging.
- Ship multilingual support tailored to local screening teams.
- Expand analytics for population-level DR trends and program impact.

## Contributing
We welcome issues and pull requests that strengthen Netra’s ability to deliver fast, reliable screenings in the communities that need them most. Please include context about the environment where the application will run (clinic, mobile unit, etc.) so improvements remain field-ready.
# Netra — Intelligent Retinal Screening Platform

Netra is an AI-powered web application that supports the early detection and monitoring of Diabetic Retinopathy (DR). Patients can securely upload retinal fundus images for automated analysis, while doctors review AI-assisted predictions, provide medical feedback, and track each case over time.

## Patient Experience

### Account & Profile
- Secure authentication via email or Google OAuth
- Personalized dashboard with medical context (age, diabetes type, last exam)
- Profile management for updating personal details and credentials

### Retinal Scan Submission
- Guided uploader for JPG and PNG fundus images
- Real-time preview and progress indicators
- Automated preprocessing pipeline (resizing, normalization) prior to inference
- Seamless routing to the DR classification model

### AI Diagnosis Results
- Displays DR classification levels (0–4: No DR → Proliferative DR)
- Confidence score for transparency
- Optional Grad-CAM heatmap overlay highlighting affected regions
- Side-by-side comparison with historical scans

### Health History & Reports
- Chronological timeline of prior scans and diagnoses
- Interactive chart visualizing DR progression
- Downloadable PDF summaries
- Integrated doctor recommendations and status updates

### Doctor Interaction
- Direct view of doctor comments and treatment suggestions per scan
- Ability to acknowledge feedback as reviewed
- Secure patient-doctor discussion thread (planned enhancement)

## Doctor Experience

### Account & Verification
- Dedicated sign-up flow for medical professionals
- Verification fields including license number, institution, and specialization
- Role-restricted access for approved doctors

### Patient & Case Dashboard
- Unified view of assigned and public patient cases
- Advanced filtering by severity, submission date, or patient name
- Instant visibility into new scan submissions

### Case Review Interface
- Full-screen fundus viewer with zoom and pan controls
- AI-generated classification and heatmap overlay toggles
- Access to patient history and previous scans

### Medical Notes & Recommendations
- Rich comments and recommendations for each scan
- Urgency tagging (Routine / Monitor / Immediate Action)
- Edit and delete capabilities for prior notes
- Real-time synchronization of feedback with patient view

### Analytics (Stretch Goal)
- Aggregate statistics of patient outcomes
- Severity distribution charts and progression metrics
- Exportable reports for research or institutional review

## Shared Platform Features

### Architecture & Technology
- **Frontend:** React with Tailwind CSS (glassmorphism design, light/lilac + dark themes)
- **Backend:** Django REST Framework
- **Model Inference:** TensorFlow or PyTorch model deployed via AWS or Google Colab
- **Storage:** AWS S3 or Django File Storage
- **Database:** PostgreSQL modeling users, scans, comments, and history relations

### Notifications
- Email and in-app alerts for new diagnoses or doctor input
- User-configurable notification preferences

### Security & Compliance
- Role-based access control separating patient and doctor privileges
- Encrypted image storage and secure communications
- HIPAA-aligned data handling practices

### Admin Controls
- Approve or revoke doctor accounts
- Manage users, comments, and scan activity logs
- System health and monitoring dashboard

## Roadmap & Future Enhancements
- Integration with EHR/FHIR hospital systems
- Predictive analytics for DR risk progression
- Mobile and Progressive Web App experiences
- Multilingual user interface
- AI-assisted automated report generation

---

Netra empowers care teams with actionable insights, bridging AI-driven diagnostics with collaborative clinical workflows for improved diabetic eye care.
