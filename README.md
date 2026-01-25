# Folfer Structure
## Project Structure

```text
medicare-hub-backend/
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── medicare/
│                   └── hub/
│                       ├── config/
│                       │   ├── S3Config.java
│                       │   └── WebConfig.java
│                       ├── controller/
│                       │   ├── AuthController.java
│                       │   ├── UserController.java
│                       │   └── MedicalController.java
│                       ├── entity/              # PostgreSQL tables
│                       │   ├── User.java
│                       │   ├── MedicalRecord.java
│                       │   ├── Prescription.java
│                       │   └── LabResult.java
│                       ├── repository/          # Database queries
│                       │   ├── UserRepository.java
│                       │   ├── MedicalRecordRepository.java
│                       │   ├── PrescriptionRepository.java
│                       │   └── LabResultRepository.java
│                       ├── service/
│                       │   └── S3StorageService.java
│                       └── dto/
│                           ├── LoginRequest.java
│                           ├── RegisterRequest.java
│                           ├── UserResponse.java
│                           └── ApiResponse.java
├── pom.xml                                    # PostgreSQL dependency
```

## PostgreSQL Database

```text
users
medical_records
prescriptions
lab_results
```

## AWS S3 Bucket

```text
reports/        # medical record PDFs
prescriptions/  # prescription images
labs/           # lab report files
```
