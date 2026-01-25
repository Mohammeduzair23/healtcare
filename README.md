# Folfer Structure
'''text
medicare-hub-backend/
├── src/main/java/com/medicare/hub/
│   ├── config/
│   │   ├── S3Config.java
│   │   └── WebConfig.java
│   ├── controller/
│   │   ├── AuthController.java (uses UserRepository)
│   │   ├── UserController.java (uses UserRepository)
│   │   └── MedicalController.java (uses Repositories + S3)
│   ├── entity/  ← NEW (PostgreSQL tables)
│   │   ├── User.java
│   │   ├── MedicalRecord.java
│   │   ├── Prescription.java
│   │   └── LabResult.java
│   ├── repository/  ← NEW (Database queries)
│   │   ├── UserRepository.java
│   │   ├── MedicalRecordRepository.java
│   │   ├── PrescriptionRepository.java
│   │   └── LabResultRepository.java
│   ├── service/
│   │   └── S3StorageService.java
│   └── dto/
│       ├── LoginRequest.java
│       ├── RegisterRequest.java
│       ├── UserResponse.java
│       └── ApiResponse.java
└── pom.xml (with PostgreSQL dependency)

# PostgreSQL Database:
├── users table
├── medical_records table
├── prescriptions table
└── lab_results table

# AWS S3 Bucket:
├── reports/ (medical record PDFs)
├── prescriptions/ (prescription images)
└── labs/ (lab report files)
