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
