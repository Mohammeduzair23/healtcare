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
## Git command
```text
If u done changes on Github make sure u first Run this command After that push the code to Github
git pull origin main --rebase

--rebase     what it does
It moves your commits on top of the latest Github commits instead of creating 
an extra "merge commit"
```