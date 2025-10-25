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
