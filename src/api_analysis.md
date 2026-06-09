# Salama AI Live Backend API Documentation & Analysis

This document provides a comprehensive, structured analysis of the Live Salama AI Backend API. It maps out all modules, operations, request/response models, and underlying schemas for development.

---

## Architecture Overview

The Salama AI backend is a full-featured clinical management and risk predicting platform. It separates users into two primary roles:
1. **Patients**: Who can record log metrics (blood pressure, heart rate, general health assessments), maintain profiles, browse clinicians, book appointments, and run advanced AI disease risk predictions.
2. **Clinicians**: Who can log in, manage patient linkages, search/inspect linked patient records (profiling logs, assessments, risk data), schedule appointments, and assign prescriptions.

---

## 1. Core Modules & Endpoints

### Module: Auth

#### **POST** `/auth/jwt/login`
* **Summary**: Auth:Jwt.Login
* **Authentication**: None
* **Request Body** (`application/x-www-form-urlencoded`): Refer to [`#components/schemas/login`](#schema-login)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/BearerResponse`)
  - **400**: Bad Request (`#components/schemas/ErrorModel`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/auth/jwt/logout`
* **Summary**: Auth:Jwt.Logout
* **Authentication**: Required (Bearer JWT)
* **Responses**:
  - **200**: Successful Response
  - **401**: Missing token or inactive user.

#### **POST** `/auth/register`
* **Summary**: Register:Register
* **Authentication**: None
* **Request Body** (`application/json`): Refer to [`#components/schemas/UserCreate`](#schema-usercreate)
* **Responses**:
  - **201**: Successful Response (`#components/schemas/UserRead`)
  - **400**: Bad Request (`#components/schemas/ErrorModel`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/auth/forgot-password`
* **Summary**: Reset:Forgot Password
* **Authentication**: None
* **Request Body** (`application/json`): Refer to [`#components/schemas/Body_auth-reset_forgot_password`](#schema-body_auth-reset_forgot_password)
* **Responses**:
  - **202**: Successful Response
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/auth/reset-password`
* **Summary**: Reset:Reset Password
* **Authentication**: None
* **Request Body** (`application/json`): Refer to [`#components/schemas/Body_auth-reset_reset_password`](#schema-body_auth-reset_reset_password)
* **Responses**:
  - **200**: Successful Response
  - **400**: Bad Request (`#components/schemas/ErrorModel`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/auth/request-verify-token`
* **Summary**: Verify:Request-Token
* **Authentication**: None
* **Request Body** (`application/json`): Refer to [`#components/schemas/Body_auth-verify_request-token`](#schema-body_auth-verify_request-token)
* **Responses**:
  - **202**: Successful Response
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/auth/verify`
* **Summary**: Verify:Verify
* **Authentication**: None
* **Request Body** (`application/json`): Refer to [`#components/schemas/Body_auth-verify_verify`](#schema-body_auth-verify_verify)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/UserRead`)
  - **400**: Bad Request (`#components/schemas/ErrorModel`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)


---

### Module: Users

#### **GET** `/users/me`
* **Summary**: Users:Current User
* **Authentication**: Required (Bearer JWT)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/UserRead`)
  - **401**: Missing token or inactive user.

#### **PATCH** `/users/me`
* **Summary**: Users:Patch Current User
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/UserUpdate`](#schema-userupdate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/UserRead`)
  - **400**: Bad Request (`#components/schemas/ErrorModel`)
  - **401**: Missing token or inactive user.
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/users/{id}`
* **Summary**: Users:User
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `id` (path, Required): `string` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/UserRead`)
  - **401**: Missing token or inactive user.
  - **403**: Not a superuser.
  - **404**: The user does not exist.
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **PATCH** `/users/{id}`
* **Summary**: Users:Patch User
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `id` (path, Required): `string` - 
* **Request Body** (`application/json`): Refer to [`#components/schemas/UserUpdate`](#schema-userupdate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/UserRead`)
  - **400**: Bad Request (`#components/schemas/ErrorModel`)
  - **401**: Missing token or inactive user.
  - **403**: Not a superuser.
  - **404**: The user does not exist.
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **DELETE** `/users/{id}`
* **Summary**: Users:Delete User
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `id` (path, Required): `string` - 
* **Responses**:
  - **204**: Successful Response
  - **401**: Missing token or inactive user.
  - **403**: Not a superuser.
  - **404**: The user does not exist.
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)


---

### Module: Health data

#### **POST** `/health_data/blood-pressure/`
* **Summary**: Create Bp
* **Description**: Create a new blood pressure record.
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/BloodPressureCreate`](#schema-bloodpressurecreate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__health_data__schemas__BloodPressureRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/health_data/blood-pressure/`
* **Summary**: Get All Bp
* **Description**: Fetch all blood pressure records for the current user (with optional date filtering).
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `start_date` (query, Optional): `string` - 
  - `end_date` (query, Optional): `string` - 
  - `limit` (query, Optional): `integer` - 
* **Responses**:
  - **200**: Successful Response (Array of [`fastapi_backend__app__health_data__schemas__BloodPressureRead`](#schema-fastapi_backend__app__health_data__schemas__bloodpressureread))
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/health_data/blood-pressure/{bp_id}`
* **Summary**: Get Bp
* **Description**: Fetch a single blood pressure record by ID.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `bp_id` (path, Required): `integer` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__health_data__schemas__BloodPressureRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **DELETE** `/health_data/blood-pressure/{bp_id}`
* **Summary**: Delete Bp
* **Description**: Delete a blood pressure record.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `bp_id` (path, Required): `integer` - 
* **Responses**:
  - **200**: Successful Response
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/health_data/heart-rate/`
* **Summary**: Create Hr
* **Description**: Create a new heart rate record.
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/HeartRateCreate`](#schema-heartratecreate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/HeartRateRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/health_data/heart-rate/`
* **Summary**: Get All Hr
* **Description**: Fetch all heart rate records for the current user (with optional date filtering).
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `start_date` (query, Optional): `string` - 
  - `end_date` (query, Optional): `string` - 
  - `limit` (query, Optional): `integer` - 
* **Responses**:
  - **200**: Successful Response (Array of [`HeartRateRead`](#schema-heartrateread))
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/health_data/heart-rate/{hr_id}`
* **Summary**: Get Hr
* **Description**: Fetch a single heart rate record by ID.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `hr_id` (path, Required): `integer` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/HeartRateRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **DELETE** `/health_data/heart-rate/{hr_id}`
* **Summary**: Delete Hr
* **Description**: Delete a heart rate record.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `hr_id` (path, Required): `integer` - 
* **Responses**:
  - **200**: Successful Response
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/health_data/health-assessment/`
* **Summary**: Create Health Assessment
* **Description**: Create a new health assessment record.
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/HealthAssessmentCreate`](#schema-healthassessmentcreate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/HealthAssessmentRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/health_data/health-assessment/`
* **Summary**: Get All Health Assessments
* **Description**: Fetch all health assessment records for the current user.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `limit` (query, Optional): `integer` - 
* **Responses**:
  - **200**: Successful Response (Array of [`HealthAssessmentRead`](#schema-healthassessmentread))
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/health_data/health-assessment/{assessment_id}`
* **Summary**: Get Health Assessment
* **Description**: Fetch a single health assessment record by ID.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `assessment_id` (path, Required): `integer` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/HealthAssessmentRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **DELETE** `/health_data/health-assessment/{assessment_id}`
* **Summary**: Delete Health Assessment
* **Description**: Delete a health assessment record.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `assessment_id` (path, Required): `integer` - 
* **Responses**:
  - **200**: Successful Response
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)


---

### Module: Prescriptions

#### **POST** `/prescription/prescriptions/`
* **Summary**: Create Prescription
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/fastapi_backend__app__prescription__schemas__PrescriptionCreate`](#schema-fastapi_backend__app__prescription__schemas__prescriptioncreate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__prescription__schemas__PrescriptionRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/prescription/prescriptions/`
* **Summary**: Get User Prescriptions
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `limit` (query, Optional): `integer` - 
* **Responses**:
  - **200**: Successful Response (Array of [`fastapi_backend__app__prescription__schemas__PrescriptionRead`](#schema-fastapi_backend__app__prescription__schemas__prescriptionread))
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/prescription/prescriptions/{prescription_id}`
* **Summary**: Get Prescription
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `prescription_id` (path, Required): `string` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__prescription__schemas__PrescriptionRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)


---

### Module: Profiles

#### **GET** `/profile/profiles/`
* **Summary**: Get Profile
* **Authentication**: Required (Bearer JWT)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__user_profile__schemas__UserProfileRead`)

#### **PUT** `/profile/profiles/`
* **Summary**: Update Profile
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/UserProfileUpdate`](#schema-userprofileupdate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__user_profile__schemas__UserProfileRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/profile/profiles/`
* **Summary**: Create Profile
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/UserProfileCreate`](#schema-userprofilecreate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__user_profile__schemas__UserProfileRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **DELETE** `/profile/profiles/`
* **Summary**: Delete Profile
* **Authentication**: Required (Bearer JWT)
* **Responses**:
  - **200**: Successful Response


---

### Module: Predictions

#### **POST** `/predictions/predictions/run`
* **Summary**: Run risk predictions for the current user
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/PredictionRequest`](#schema-predictionrequest)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/PredictionResponse`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/predictions/predictions/history`
* **Summary**: Retrieve past risk assessment results for the current user
* **Authentication**: Required (Bearer JWT)
* **Responses**:
  - **200**: Successful Response (Array of [`RiskAssessmentResultRead`](#schema-riskassessmentresultread))

#### **GET** `/predictions/predictions/explain/{risk_assessment_id}`
* **Summary**: Retrieve SHAP values, top risk factors, and clinical explanations for a specific prediction
* **Description**: Fetches the TreeSHAP feature contributions, custom clinic recommendations, 
and profiling metadata linked directly to a historical inference instance.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `risk_assessment_id` (path, Required): `string` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/RiskAssessmentExplainabilityRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/predictions/predictions/diagnose`
* **Summary**: Debug endpoint — checks models, profile, assessment, and feature engineering
* **Description**: Returns a full diagnostic report without running the models:
- Whether each model file exists on disk
- Whether the user has a profile and health assessment
- The exact feature values that would be sent to each model
- Any errors from the feature engineering step

Use this endpoint first when /run returns empty results.
* **Authentication**: Required (Bearer JWT)
* **Responses**:
  - **200**: Successful Response


---

### Module: Clinician Dashboard

#### **POST** `/clinicians/clinicians/profile`
* **Summary**: Create clinician profile
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/ClinicianProfileCreate`](#schema-clinicianprofilecreate)
* **Responses**:
  - **201**: Successful Response (`#components/schemas/ClinicianProfileRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/clinicians/clinicians/me`
* **Summary**: Get my clinician profile
* **Authentication**: Required (Bearer JWT)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/ClinicianProfileRead`)

#### **PATCH** `/clinicians/clinicians/me`
* **Summary**: Update my clinician profile
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/ClinicianProfileUpdate`](#schema-clinicianprofileupdate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/ClinicianProfileRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/clinicians/clinicians/me/patients`
* **Summary**: List linked patients — optionally filter by risk level
* **Description**: Returns all patients linked to this clinician, sorted by overall risk score descending. Use `?risk=high` to filter to high-risk patients only. Valid values: `high`, `moderate`, `low`.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `risk` (query, Optional): `string` - Filter by risk level: high | moderate | low
  - `page` (query, Optional): `integer` - 
  - `page_size` (query, Optional): `integer` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/HighRiskPatientResponse`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/clinicians/clinicians/me/patients/search`
* **Summary**: Search linked patients by name or email
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `q` (query, Required): `string` - Search term — name or email
* **Responses**:
  - **200**: Successful Response (`#components/schemas/PatientSearchResponse`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/clinicians/clinicians/me/patients/{patient_id}`
* **Summary**: Get full profile, latest assessment, and risk data for a patient
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `patient_id` (path, Required): `string` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/PatientDetailResponse`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/clinicians/clinicians/me/appointments`
* **Summary**: Schedule an appointment (virtual or in-person)
* **Description**: Set `is_virtual=true` and provide a `meeting_link` for virtual appointments. Leave `is_virtual=false` for in-person. `status` defaults to `pending`.
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/AppointmentCreate`](#schema-appointmentcreate)
* **Responses**:
  - **201**: Successful Response (`#components/schemas/fastapi_backend__app__clinician_dashboard__schemas__AppointmentRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/clinicians/clinicians/me/appointments`
* **Summary**: List appointments
* **Description**: Returns appointments for this clinician. Filter by `status` (pending | accepted | completed | cancelled |missed ) or set `upcoming=true` to show only future appointments.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `status` (query, Optional): `string` - pending | accepted | completed | cancelled |missed
  - `upcoming` (query, Optional): `boolean` - Show only future appointments
  - `page` (query, Optional): `integer` - 
  - `page_size` (query, Optional): `integer` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__clinician_dashboard__schemas__AppointmentListResponse`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **PATCH** `/clinicians/clinicians/me/appointments/{appointment_id}`
* **Summary**: Update appointment — reschedule, add notes, or change status
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `appointment_id` (path, Required): `string` - 
* **Request Body** (`application/json`): Refer to [`#components/schemas/AppointmentUpdate`](#schema-appointmentupdate)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__clinician_dashboard__schemas__AppointmentRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/clinicians/clinicians/me/prescriptions`
* **Summary**: Assign a prescription to a patient
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/fastapi_backend__app__clinician_dashboard__schemas__PrescriptionCreate`](#schema-fastapi_backend__app__clinician_dashboard__schemas__prescriptioncreate)
* **Responses**:
  - **201**: Successful Response (`#components/schemas/fastapi_backend__app__clinician_dashboard__schemas__PrescriptionRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/clinicians/clinicians/me/prescriptions`
* **Summary**: List prescriptions — all or filtered by patient
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `patient_id` (query, Optional): `string` - Filter to a specific patient UUID
* **Responses**:
  - **200**: Successful Response (`#components/schemas/PrescriptionListResponse`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)


---

### Module: Patient Appointments

#### **GET** `/appointments/appointments/clinicians`
* **Summary**: Browse clinicians available for booking
* **Description**: Returns verified, active clinicians. Filter by `specialization` or free-text `search` (name / hospital). Set `verified_only=false` to include unverified clinicians.
* **Authentication**: None
* **Parameters**:
  - `search` (query, Optional): `string` - Search by name or hospital
  - `specialization` (query, Optional): `string` - e.g. Cardiology
  - `verified_only` (query, Optional): `boolean` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/ClinicianListResponse`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **POST** `/appointments/appointments/book`
* **Summary**: Book an appointment with a clinician
* **Description**: Creates a new appointment with `status=pending`. The clinician will confirm or reject it. Also automatically links the patient to the clinician's practice if not already linked.
* **Authentication**: Required (Bearer JWT)
* **Request Body** (`application/json`): Refer to [`#components/schemas/AppointmentBookRequest`](#schema-appointmentbookrequest)
* **Responses**:
  - **201**: Successful Response (`#components/schemas/fastapi_backend__app__appointments__schemas__AppointmentRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/appointments/appointments/me`
* **Summary**: List my appointments
* **Description**: Returns the authenticated patient's appointments, newest first. Filter by `status` (pending | accepted | completed | cancelled |missed) or set `upcoming=true` for future appointments only.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `status` (query, Optional): `string` - pending | accepted | completed | cancelled |missed
  - `upcoming` (query, Optional): `boolean` - Show only future appointments
  - `page` (query, Optional): `integer` - 
  - `page_size` (query, Optional): `integer` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__appointments__schemas__AppointmentListResponse`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **GET** `/appointments/appointments/me/{appointment_id}`
* **Summary**: Get a single appointment detail
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `appointment_id` (path, Required): `string` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__appointments__schemas__AppointmentRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **DELETE** `/appointments/appointments/me/{appointment_id}`
* **Summary**: Cancel an appointment
* **Description**: Only PENDING or CONFIRMED appointments can be cancelled.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `appointment_id` (path, Required): `string` - 
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__appointments__schemas__AppointmentRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)

#### **PATCH** `/appointments/appointments/me/{appointment_id}/reschedule`
* **Summary**: Reschedule a pending appointment
* **Description**: Only PENDING appointments can be rescheduled by the patient.
* **Authentication**: Required (Bearer JWT)
* **Parameters**:
  - `appointment_id` (path, Required): `string` - 
  - `new_date` (query, Required): `string` - New appointment datetime (timezone-aware)
* **Responses**:
  - **200**: Successful Response (`#components/schemas/fastapi_backend__app__appointments__schemas__AppointmentRead`)
  - **422**: Validation Error (`#components/schemas/HTTPValidationError`)


---


## 2. Model Schema Definitions

### <a id="schema-alcoholuse"></a> Schema: `AlcoholUse`
*Type*: **Enum (String)**
*Allowed Values*: `"none"`, `"moderate"`, `"heavy"`

### <a id="schema-appointmentbookrequest"></a> Schema: `AppointmentBookRequest`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `clinician_profile_id` | `string` | Yes | ID of the clinician to book with |
| `appointment_date` | `string` | Yes | Requested date and time (timezone-aware) |
| `reason` | `string | null` | No | Reason for the visit |
| `is_virtual` | `boolean` | No | True for a video/online appointment |

### <a id="schema-appointmentcreate"></a> Schema: `AppointmentCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `patient_id` | `string` | Yes | Patient Id |
| `appointment_date` | `string` | Yes | Appointment Date |
| `reason` | `string | null` | No | Reason |
| `is_virtual` | `boolean` | No | Is Virtual |
| `meeting_link` | `string | null` | No | Meeting Link |

### <a id="schema-appointmentstatus"></a> Schema: `AppointmentStatus`
*Type*: **Enum (String)**
*Allowed Values*: `"pending"`, `"accepted"`, `"completed"`, `"cancelled"`, `"missed"`

### <a id="schema-appointmentupdate"></a> Schema: `AppointmentUpdate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `appointment_date` | `string | null` | No | Appointment Date |
| `reason` | `string | null` | No | Reason |
| `clinician_notes` | `string | null` | No | Clinician Notes |
| `status` | `string | null` | No | Status |
| `is_virtual` | `boolean | null` | No | Is Virtual |
| `meeting_link` | `string | null` | No | Meeting Link |

### <a id="schema-bearerresponse"></a> Schema: `BearerResponse`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `access_token` | `string` | Yes | Access Token |
| `token_type` | `string` | Yes | Token Type |

### <a id="schema-bloodpressurecreate"></a> Schema: `BloodPressureCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `start_date_time` | `string` | Yes | Start Date Time |
| `end_date_time` | `string | null` | No | End Date Time |
| `descriptive_statistic` | ``DescriptiveStatistic` | null` | No |  |
| `temporal_relationship_to_physical_activity` | ``TemporalRelationship` | null` | No |  |
| `temporal_relationship_to_sleep` | ``TemporalRelationshipToSleep` | null` | No |  |
| `body_posture` | ``BodyPosture` | null` | No |  |
| `measurement_location` | ``MeasurementLocation` | null` | No |  |
| `systolic_value` | `number` | Yes | Systolic Value |
| `diastolic_value` | `number` | Yes | Diastolic Value |
| `systolic_unit` | ``BloodPressureUnit`` | No |  |
| `diastolic_unit` | ``BloodPressureUnit`` | No |  |

### <a id="schema-bloodpressureunit"></a> Schema: `BloodPressureUnit`
*Type*: **Enum (String)**
*Allowed Values*: `"mmHg"`

### <a id="schema-bloodpressurevalueread"></a> Schema: `BloodPressureValueRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `systolic_value` | `number` | Yes | Systolic Value |
| `diastolic_value` | `number` | Yes | Diastolic Value |

### <a id="schema-bodyposture"></a> Schema: `BodyPosture`
*Type*: **Enum (String)**
*Allowed Values*: `"sitting"`, `"standing"`, `"lying"`, `"reclining"`

### <a id="schema-body_auth-reset_forgot_password"></a> Schema: `Body_auth-reset_forgot_password`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | `string` | Yes | Email |

### <a id="schema-body_auth-reset_reset_password"></a> Schema: `Body_auth-reset_reset_password`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `token` | `string` | Yes | Token |
| `password` | `string` | Yes | Password |

### <a id="schema-body_auth-verify_request-token"></a> Schema: `Body_auth-verify_request-token`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | `string` | Yes | Email |

### <a id="schema-body_auth-verify_verify"></a> Schema: `Body_auth-verify_verify`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `token` | `string` | Yes | Token |

### <a id="schema-bphistory"></a> Schema: `BpHistory`
*Type*: **Enum (String)**
*Allowed Values*: `"normal"`, `"prehypertension"`, `"hypertension"`

### <a id="schema-bpmedication"></a> Schema: `BpMedication`
*Type*: **Enum (String)**
*Allowed Values*: `"none"`, `"beta_blocker"`, `"diuretic"`, `"ace_inhibitor"`, `"other"`

### <a id="schema-clinicianlistresponse"></a> Schema: `ClinicianListResponse`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `total` | `integer` | Yes | Total |
| `results` | `Array<`ClinicianPublicRead`>` | Yes | Results |

### <a id="schema-clinicianprofilecreate"></a> Schema: `ClinicianProfileCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `first_name` | `string` | Yes | First Name |
| `middle_name` | `string | null` | No | Middle Name |
| `last_name` | `string` | Yes | Last Name |
| `specialization` | `string` | Yes | Specialization |
| `license_number` | `string` | Yes | License Number |
| `hospital_name` | `string | null` | No | Hospital Name |
| `years_of_experience` | `integer | null` | No | Years Of Experience |
| `bio` | `string | null` | No | Bio |

### <a id="schema-clinicianprofileread"></a> Schema: `ClinicianProfileRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `user_id` | `string` | Yes | User Id |
| `slug` | `string` | Yes | Slug |
| `first_name` | `string` | Yes | First Name |
| `middle_name` | `string | null` | No | Middle Name |
| `last_name` | `string` | Yes | Last Name |
| `full_name` | `string` | Yes | Full Name |
| `specialization` | `string` | Yes | Specialization |
| `license_number` | `string` | Yes | License Number |
| `hospital_name` | `string | null` | No | Hospital Name |
| `years_of_experience` | `integer | null` | No | Years Of Experience |
| `bio` | `string | null` | No | Bio |
| `is_verified` | `boolean` | Yes | Is Verified |
| `is_active` | `boolean` | Yes | Is Active |
| `created_at` | `string` | Yes | Created At |

### <a id="schema-clinicianprofileupdate"></a> Schema: `ClinicianProfileUpdate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `first_name` | `string | null` | No | First Name |
| `middle_name` | `string | null` | No | Middle Name |
| `last_name` | `string | null` | No | Last Name |
| `specialization` | `string | null` | No | Specialization |
| `hospital_name` | `string | null` | No | Hospital Name |
| `years_of_experience` | `integer | null` | No | Years Of Experience |
| `bio` | `string | null` | No | Bio |

### <a id="schema-clinicianpublicread"></a> Schema: `ClinicianPublicRead`
*Description*: Minimal clinician info shown to a patient when browsing / searching.

*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `slug` | `string` | Yes | Slug |
| `full_name` | `string` | Yes | Full Name |
| `specialization` | `string` | Yes | Specialization |
| `hospital_name` | `string | null` | No | Hospital Name |
| `years_of_experience` | `integer | null` | No | Years Of Experience |
| `bio` | `string | null` | No | Bio |
| `is_verified` | `boolean` | Yes | Is Verified |

### <a id="schema-descriptivestatistic"></a> Schema: `DescriptiveStatistic`
*Type*: **Enum (String)**
*Allowed Values*: `"average"`, `"maximum"`, `"minimum"`

### <a id="schema-diseasepredictionresult"></a> Schema: `DiseasePredictionResult`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `disease` | `string` | Yes | Disease |
| `risk_score` | `number` | Yes | Probability / risk score [0-1] |
| `risk_label` | `string` | Yes | 'Low' | 'Moderate' | 'High' |
| `model_version` | `string` | Yes | Model Version |
| `features_used` | `object` | Yes | Features Used |

### <a id="schema-educationlevel"></a> Schema: `EducationLevel`
*Type*: **Enum (String)**
*Allowed Values*: `"primary"`, `"high_school"`, `"undergraduate"`, `"graduate"`

### <a id="schema-errormodel"></a> Schema: `ErrorModel`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `detail` | `string | object` | Yes | Detail |

### <a id="schema-gender"></a> Schema: `Gender`
*Type*: **Enum (String)**
*Allowed Values*: `"male"`, `"female"`, `"other"`

### <a id="schema-httpvalidationerror"></a> Schema: `HTTPValidationError`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `detail` | `Array<`ValidationError`>` | No | Detail |

### <a id="schema-healthassessmentcreate"></a> Schema: `HealthAssessmentCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `weight` | `number | null` | No | Weight |
| `height` | `number | null` | No | Height |
| `glucose` | `number | null` | No | Glucose |
| `avg_glucose_level` | `number | null` | No | Avg Glucose Level |
| `total_cholesterol` | `number | null` | No | Total Cholesterol |
| `hdl_cholesterol` | `number | null` | No | Hdl Cholesterol |
| `on_bp_medication` | `boolean` | No | On Bp Medication |
| `bp_medication_type` | ``BpMedication`` | Yes |  |
| `smoking_status` | ``SmokingStatus` | null` | No |  |
| `cigs_per_day` | `integer | null` | No | Cigs Per Day |
| `alcohol_use` | ``AlcoholUse` | null` | No |  |
| `physical_activity_level` | ``PhysicalActivity` | null` | No |  |
| `assessment_notes` | `string | null` | No | Assessment Notes |

### <a id="schema-healthassessmentread"></a> Schema: `HealthAssessmentRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `weight` | `number | null` | No | Weight |
| `height` | `number | null` | No | Height |
| `glucose` | `number | null` | No | Glucose |
| `avg_glucose_level` | `number | null` | No | Avg Glucose Level |
| `total_cholesterol` | `number | null` | No | Total Cholesterol |
| `hdl_cholesterol` | `number | null` | No | Hdl Cholesterol |
| `on_bp_medication` | `boolean` | No | On Bp Medication |
| `bp_medication_type` | ``BpMedication`` | Yes |  |
| `smoking_status` | ``SmokingStatus` | null` | No |  |
| `cigs_per_day` | `integer | null` | No | Cigs Per Day |
| `alcohol_use` | ``AlcoholUse` | null` | No |  |
| `physical_activity_level` | ``PhysicalActivity` | null` | No |  |
| `assessment_notes` | `string | null` | No | Assessment Notes |
| `blood_pressures` | `Array<`BloodPressureValueRead`>` | No | Blood Pressures |
| `heart_rates` | `Array<`HeartRateValueRead`>` | No | Heart Rates |
| `bmi` | `number | null` | No | Bmi |
| `log_bmi` | `number | null` | No | Log Bmi |
| `id` | `string` | Yes | Id |
| `user_id` | `string` | Yes | User Id |

### <a id="schema-healthassessmentsummary"></a> Schema: `HealthAssessmentSummary`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `created_at` | `string` | Yes | Created At |
| `weight` | `number | null` | No | Weight |
| `height` | `number | null` | No | Height |
| `bmi` | `number | null` | No | Bmi |
| `glucose` | `number | null` | No | Glucose |
| `avg_glucose_level` | `number | null` | No | Avg Glucose Level |
| `total_cholesterol` | `number | null` | No | Total Cholesterol |
| `hdl_cholesterol` | `number | null` | No | Hdl Cholesterol |
| `on_bp_medication` | `boolean` | No | On Bp Medication |
| `smoking_status` | `string | null` | No | Smoking Status |
| `alcohol_use` | `string | null` | No | Alcohol Use |
| `physical_activity_level` | `string | null` | No | Physical Activity Level |
| `assessment_notes` | `string | null` | No | Assessment Notes |
| `blood_pressures` | `Array<`fastapi_backend__app__clinician_dashboard__schemas__BloodPressureRead`>` | No | Blood Pressures |

### <a id="schema-heartratecreate"></a> Schema: `HeartRateCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `number` | Yes | Value |
| `unit` | ``HeartRateUnit`` | No |  |
| `start_date_time` | `string` | Yes | Start Date Time |
| `end_date_time` | `string | null` | No | End Date Time |
| `descriptive_statistic` | ``DescriptiveStatistic` | null` | No |  |
| `temporal_relationship_to_physical_activity` | ``TemporalRelationship` | null` | No |  |
| `temporal_relationship_to_sleep` | ``TemporalRelationshipToSleep` | null` | No |  |
| `body_posture` | ``BodyPosture` | null` | No |  |
| `measurement_location` | ``MeasurementLocation` | null` | No |  |

### <a id="schema-heartrateread"></a> Schema: `HeartRateRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `number` | Yes | Value |
| `unit` | ``HeartRateUnit`` | No |  |
| `start_date_time` | `string` | Yes | Start Date Time |
| `end_date_time` | `string | null` | No | End Date Time |
| `descriptive_statistic` | ``DescriptiveStatistic` | null` | No |  |
| `temporal_relationship_to_physical_activity` | ``TemporalRelationship` | null` | No |  |
| `temporal_relationship_to_sleep` | ``TemporalRelationshipToSleep` | null` | No |  |
| `body_posture` | ``BodyPosture` | null` | No |  |
| `measurement_location` | ``MeasurementLocation` | null` | No |  |
| `id` | `integer` | Yes | Id |
| `user_id` | `string` | Yes | User Id |

### <a id="schema-heartrateunit"></a> Schema: `HeartRateUnit`
*Type*: **Enum (String)**
*Allowed Values*: `"beats/min"`

### <a id="schema-heartratevalueread"></a> Schema: `HeartRateValueRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `number` | Yes | Value |

### <a id="schema-highriskpatientresponse"></a> Schema: `HighRiskPatientResponse`
*Description*: Response for GET /clinicians/me/patients?risk=high

*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `total` | `integer` | Yes | Total |
| `patients` | `Array<`PatientSummary`>` | Yes | Patients |

### <a id="schema-measurementlocation"></a> Schema: `MeasurementLocation`
*Type*: **Enum (String)**
*Allowed Values*: `"left wrist"`, `"right wrist"`, `"left arm"`, `"right arm"`

### <a id="schema-patientdetailresponse"></a> Schema: `PatientDetailResponse`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | `string` | Yes | User Id |
| `email` | `string | null` | No | Email |
| `profile` | ``fastapi_backend__app__clinician_dashboard__schemas__UserProfileRead` | null` | No |  |
| `latest_assessment` | ``HealthAssessmentSummary` | null` | No |  |
| `assessment_count` | `integer` | No | Assessment Count |
| `risk_cards` | `Array<`RiskCardSummary`>` | No | Risk Cards |
| `overall_risk_percent` | `number` | No | Overall Risk Percent |
| `overall_risk_label` | `string` | No | Overall Risk Label |

### <a id="schema-patientsearchresponse"></a> Schema: `PatientSearchResponse`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `query` | `string` | Yes | Query |
| `total` | `integer` | Yes | Total |
| `results` | `Array<`PatientSummary`>` | Yes | Results |

### <a id="schema-patientsummary"></a> Schema: `PatientSummary`
*Description*: Compact row for patient lists and search results.

*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | `string` | Yes | User Id |
| `full_name` | `string` | Yes | Full Name |
| `age` | `integer | null` | No | Age |
| `sex` | `string | null` | No | Sex |
| `email` | `string | null` | No | Email |
| `overall_risk_percent` | `number` | No | Overall Risk Percent |
| `overall_risk_label` | `string` | No | Overall Risk Label |
| `risk_cards` | `Array<`RiskCardSummary`>` | No | Risk Cards |
| `last_assessed` | `string | null` | No | Last Assessed |
| `linked_since` | `string | null` | No | Linked Since |

### <a id="schema-physicalactivity"></a> Schema: `PhysicalActivity`
*Type*: **Enum (String)**
*Allowed Values*: `"none"`, `"low"`, `"moderate"`, `"high"`

### <a id="schema-predictionerror"></a> Schema: `PredictionError`
*Description*: Details of a per-disease failure — returned alongside partial results.

*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `disease` | `string` | Yes | Disease |
| `stage` | `string` | Yes | 'feature_engineering' | 'model_load' | 'inference' | 'persistence' |
| `error` | `string` | Yes | Error |
| `features_used` | `object | null` | No | Features Used |

### <a id="schema-predictionrequest"></a> Schema: `PredictionRequest`
*Description*: Trigger predictions for one or all diseases for the current user.

*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `diseases` | `array | null` | No | Subset of ['cvd', 'hyp', 'chd', 'stroke']. None = run all. |

### <a id="schema-predictionresponse"></a> Schema: `PredictionResponse`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | `string` | Yes | User Id |
| `predicted_at` | `string` | Yes | Predicted At |
| `results` | `Array<`DiseasePredictionResult`>` | Yes | Results |
| `errors` | `Array<`PredictionError`>` | No | Partial failures — populated when one or more diseases failed. Empty on full success. |

### <a id="schema-prescriptionlistresponse"></a> Schema: `PrescriptionListResponse`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `total` | `integer` | Yes | Total |
| `prescriptions` | `Array<`fastapi_backend__app__clinician_dashboard__schemas__PrescriptionRead`>` | Yes | Prescriptions |

### <a id="schema-prescriptionstatus"></a> Schema: `PrescriptionStatus`
*Type*: **Enum (String)**
*Allowed Values*: `"active"`, `"completed"`, `"cancelled"`, `"expired"`

### <a id="schema-riskassessmentexplainabilityread"></a> Schema: `RiskAssessmentExplainabilityRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `risk_assessment_id` | `string` | Yes | Risk Assessment Id |
| `recommendation` | `string | null` | No | Recommendation |
| `clinical_summary` | `string | null` | No | Clinical Summary |
| `lime_explanation` | `string | null` | No | Lime Explanation |
| `inference_time_ms` | `number | null` | No | Inference Time Ms |
| `parsed_top_risk_factors` | `Array<object>` | Yes | Parsed Top Risk Factors |
| `parsed_shap_values` | `object` | Yes | Parsed Shap Values |

### <a id="schema-riskassessmentresultread"></a> Schema: `RiskAssessmentResultRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `user_id` | `string` | Yes | User Id |
| `disease` | `string` | Yes | Disease |
| `risk_score` | `number` | Yes | Risk Score |
| `risk_percentage` | `number` | Yes | Risk Percentage |
| `risk_label` | `string` | Yes | Risk Label |
| `model_version` | `string` | Yes | Model Version |
| `predicted_at` | `string` | Yes | Predicted At |
| `explainability` | ``RiskAssessmentExplainabilityRead` | null` | No |  |

### <a id="schema-riskcardsummary"></a> Schema: `RiskCardSummary`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `disease` | `string` | Yes | Disease |
| `display_name` | `string` | Yes | Display Name |
| `risk_score` | `number` | Yes | Risk Score |
| `risk_label` | `string` | Yes | Risk Label |
| `risk_percent` | `number` | Yes | Risk Percent |
| `color_hint` | `string` | Yes | Color Hint |
| `last_assessed` | `string | null` | No | Last Assessed |

### <a id="schema-smokingstatus"></a> Schema: `SmokingStatus`
*Type*: **Enum (String)**
*Allowed Values*: `"never"`, `"former"`, `"passive"`, `"current_light"`, `"current_heavy"`

### <a id="schema-temporalrelationship"></a> Schema: `TemporalRelationship`
*Type*: **Enum (String)**
*Allowed Values*: `"before exercise"`, `"after exercise"`, `"during exercise"`, `"at rest"`

### <a id="schema-temporalrelationshiptosleep"></a> Schema: `TemporalRelationshipToSleep`
*Type*: **Enum (String)**
*Allowed Values*: `"before sleep"`, `"during sleep"`, `"after sleep"`

### <a id="schema-usercreate"></a> Schema: `UserCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | `string` | Yes | Email |
| `password` | `string` | Yes | Password |
| `is_active` | `boolean | null` | No | Is Active |
| `is_superuser` | `boolean | null` | No | Is Superuser |
| `is_verified` | `boolean | null` | No | Is Verified |
| `role` | ``UserRole`` | Yes |  |

### <a id="schema-userprofilecreate"></a> Schema: `UserProfileCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `first_name` | `string` | Yes | First Name |
| `middle_name` | `string | null` | No | Middle Name |
| `last_name` | `string` | Yes | Last Name |
| `phone_number` | `string | null` | No | Phone Number |
| `date_of_birth` | `string` | Yes | Date Of Birth |
| `sex` | ``Gender`` | Yes |  |
| `work_type` | `string | null` | No | Work Type |
| `education` | ``EducationLevel`` | Yes |  |
| `diabetes` | `boolean` | No | Diabetes |
| `heart_disease` | `boolean` | No | Heart Disease |
| `history_cvd` | `boolean` | No | History Cvd |
| `kidney_disease` | `boolean` | No | Kidney Disease |
| `prevalent_stroke` | `boolean` | No | Prevalent Stroke |
| `prevalent_hypertension` | `boolean` | No | Prevalent Hypertension |
| `bp_history` | ``BpHistory`` | Yes |  |
| `family_history_htn` | `boolean | null` | No | Family History Htn |
| `family_history_cvd` | `boolean | null` | No | Family History Cvd |
| `smoking` | ``SmokingStatus`` | Yes |  |
| `cigs_per_day` | `integer | null` | No | Cigs Per Day |
| `alcohol_use` | ``AlcoholUse` | null` | No |  |
| `physical_activity_level` | ``PhysicalActivity` | null` | No |  |
| `exercise_frequency` | `string | null` | No | Exercise Frequency |
| `diet_quality` | `string | null` | No | Diet Quality |
| `salt_intake` | `number | null` | No | Salt Intake |
| `stress_score` | `integer | null` | No | Stress Score |
| `sleep_duration` | `number | null` | No | Sleep Duration |
| `sleep_quality` | `string | null` | No | Sleep Quality |

### <a id="schema-userprofileupdate"></a> Schema: `UserProfileUpdate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `smoking` | ``SmokingStatus`` | Yes |  |
| `diabetes` | `boolean | null` | No | Diabetes |
| `phone_number` | `string | null` | No | Phone Number |

### <a id="schema-userread"></a> Schema: `UserRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `email` | `string` | Yes | Email |
| `is_active` | `boolean` | No | Is Active |
| `is_superuser` | `boolean` | No | Is Superuser |
| `is_verified` | `boolean` | No | Is Verified |
| `role` | ``UserRole`` | Yes |  |

### <a id="schema-userrole"></a> Schema: `UserRole`
*Type*: **Enum (String)**
*Allowed Values*: `"patient"`, `"clinician"`, `"admin"`

### <a id="schema-userupdate"></a> Schema: `UserUpdate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `password` | `string | null` | No | Password |
| `email` | `string | null` | No | Email |
| `is_active` | `boolean | null` | No | Is Active |
| `is_superuser` | `boolean | null` | No | Is Superuser |
| `is_verified` | `boolean | null` | No | Is Verified |
| `role` | ``UserRole`` | Yes |  |

### <a id="schema-validationerror"></a> Schema: `ValidationError`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `loc` | `Array<any>` | Yes | Location |
| `msg` | `string` | Yes | Message |
| `type` | `string` | Yes | Error Type |

### <a id="schema-fastapi_backend__app__appointments__schemas__appointmentlistresponse"></a> Schema: `fastapi_backend__app__appointments__schemas__AppointmentListResponse`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `total` | `integer` | Yes | Total |
| `page` | `integer` | Yes | Page |
| `page_size` | `integer` | Yes | Page Size |
| `total_pages` | `integer` | Yes | Total Pages |
| `appointments` | `Array<`fastapi_backend__app__appointments__schemas__AppointmentRead`>` | Yes | Appointments |

### <a id="schema-fastapi_backend__app__appointments__schemas__appointmentread"></a> Schema: `fastapi_backend__app__appointments__schemas__AppointmentRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `patient_id` | `string` | Yes | Patient Id |
| `clinician_profile_id` | `string` | Yes | Clinician Profile Id |
| `clinician_name` | `string | null` | No | Clinician Name |
| `clinician_specialization` | `string | null` | No | Clinician Specialization |
| `hospital_name` | `string | null` | No | Hospital Name |
| `appointment_date` | `string` | Yes | Appointment Date |
| `reason` | `string | null` | No | Reason |
| `clinician_notes` | `string | null` | No | Clinician Notes |
| `status` | ``AppointmentStatus`` | Yes |  |
| `is_virtual` | `boolean` | Yes | Is Virtual |
| `meeting_link` | `string | null` | No | Meeting Link |
| `created_at` | `string` | Yes | Created At |
| `updated_at` | `string` | Yes | Updated At |

### <a id="schema-fastapi_backend__app__clinician_dashboard__schemas__appointmentlistresponse"></a> Schema: `fastapi_backend__app__clinician_dashboard__schemas__AppointmentListResponse`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `total` | `integer` | Yes | Total |
| `page` | `integer` | Yes | Page |
| `page_size` | `integer` | Yes | Page Size |
| `total_pages` | `integer` | Yes | Total Pages |
| `appointments` | `Array<`fastapi_backend__app__clinician_dashboard__schemas__AppointmentRead`>` | Yes | Appointments |

### <a id="schema-fastapi_backend__app__clinician_dashboard__schemas__appointmentread"></a> Schema: `fastapi_backend__app__clinician_dashboard__schemas__AppointmentRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `patient_id` | `string` | Yes | Patient Id |
| `clinician_profile_id` | `string` | Yes | Clinician Profile Id |
| `appointment_date` | `string` | Yes | Appointment Date |
| `reason` | `string | null` | No | Reason |
| `clinician_notes` | `string | null` | No | Clinician Notes |
| `status` | ``AppointmentStatus`` | Yes |  |
| `is_virtual` | `boolean` | Yes | Is Virtual |
| `meeting_link` | `string | null` | No | Meeting Link |
| `created_at` | `string` | Yes | Created At |
| `updated_at` | `string` | Yes | Updated At |
| `patient_name` | `string | null` | No | Patient Name |
| `patient_email` | `string | null` | No | Patient Email |

### <a id="schema-fastapi_backend__app__clinician_dashboard__schemas__bloodpressureread"></a> Schema: `fastapi_backend__app__clinician_dashboard__schemas__BloodPressureRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `systolic_value` | `number` | Yes | Systolic Value |
| `diastolic_value` | `number` | Yes | Diastolic Value |
| `start_date_time` | `string` | Yes | Start Date Time |

### <a id="schema-fastapi_backend__app__clinician_dashboard__schemas__prescriptioncreate"></a> Schema: `fastapi_backend__app__clinician_dashboard__schemas__PrescriptionCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `patient_id` | `string` | Yes | Patient Id |
| `medication_name` | `string` | Yes | Medication Name |
| `dosage` | `string` | Yes | Dosage |
| `frequency` | `string` | Yes | Frequency |
| `duration` | `string | null` | No | Duration |
| `instructions` | `string | null` | No | Instructions |
| `refills` | `integer` | No | Refills |

### <a id="schema-fastapi_backend__app__clinician_dashboard__schemas__prescriptionread"></a> Schema: `fastapi_backend__app__clinician_dashboard__schemas__PrescriptionRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `patient_id` | `string` | Yes | Patient Id |
| `clinician_profile_id` | `string` | Yes | Clinician Profile Id |
| `medication_name` | `string` | Yes | Medication Name |
| `dosage` | `string` | Yes | Dosage |
| `frequency` | `string` | Yes | Frequency |
| `duration` | `string | null` | No | Duration |
| `instructions` | `string | null` | No | Instructions |
| `refills` | `integer` | Yes | Refills |
| `issued_at` | `string` | Yes | Issued At |
| `patient_name` | `string | null` | No | Patient Name |

### <a id="schema-fastapi_backend__app__clinician_dashboard__schemas__userprofileread"></a> Schema: `fastapi_backend__app__clinician_dashboard__schemas__UserProfileRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Id |
| `user_id` | `string` | Yes | User Id |
| `first_name` | `string | null` | No | First Name |
| `last_name` | `string | null` | No | Last Name |
| `date_of_birth` | `string | null` | No | Date Of Birth |
| `sex` | `string | null` | No | Sex |
| `education` | `string | null` | No | Education |
| `work_type` | `string | null` | No | Work Type |

### <a id="schema-fastapi_backend__app__health_data__schemas__bloodpressureread"></a> Schema: `fastapi_backend__app__health_data__schemas__BloodPressureRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `start_date_time` | `string` | Yes | Start Date Time |
| `end_date_time` | `string | null` | No | End Date Time |
| `descriptive_statistic` | ``DescriptiveStatistic` | null` | No |  |
| `temporal_relationship_to_physical_activity` | ``TemporalRelationship` | null` | No |  |
| `temporal_relationship_to_sleep` | ``TemporalRelationshipToSleep` | null` | No |  |
| `body_posture` | ``BodyPosture` | null` | No |  |
| `measurement_location` | ``MeasurementLocation` | null` | No |  |
| `systolic_value` | `number` | Yes | Systolic Value |
| `diastolic_value` | `number` | Yes | Diastolic Value |
| `systolic_unit` | ``BloodPressureUnit`` | No |  |
| `diastolic_unit` | ``BloodPressureUnit`` | No |  |
| `id` | `integer` | Yes | Id |
| `user_id` | `string` | Yes | User Id |

### <a id="schema-fastapi_backend__app__prescription__schemas__prescriptioncreate"></a> Schema: `fastapi_backend__app__prescription__schemas__PrescriptionCreate`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `medication_name` | `string` | Yes | Medication Name |
| `dosage` | `string` | Yes | Dosage |
| `frequency` | `string` | Yes | Frequency |
| `duration` | `string | null` | No | Duration |
| `instructions` | `string | null` | No | Instructions |
| `refills` | `integer` | No | Refills |
| `patient_id` | `string` | Yes | Patient Id |
| `clinician_profile_id` | `string` | Yes | Clinician Profile Id |
| `status` | ``PrescriptionStatus`` | No |  |
| `expires_at` | `string | null` | No | Expires At |

### <a id="schema-fastapi_backend__app__prescription__schemas__prescriptionread"></a> Schema: `fastapi_backend__app__prescription__schemas__PrescriptionRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `medication_name` | `string` | Yes | Medication Name |
| `dosage` | `string` | Yes | Dosage |
| `frequency` | `string` | Yes | Frequency |
| `duration` | `string | null` | No | Duration |
| `instructions` | `string | null` | No | Instructions |
| `refills` | `integer` | No | Refills |
| `id` | `string` | Yes | Id |
| `patient_id` | `string` | Yes | Patient Id |
| `clinician_profile_id` | `string` | Yes | Clinician Profile Id |
| `status` | ``PrescriptionStatus`` | Yes |  |
| `issued_at` | `string` | Yes | Issued At |
| `expires_at` | `string | null` | No | Expires At |
| `updated_at` | `string | null` | No | Updated At |

### <a id="schema-fastapi_backend__app__user_profile__schemas__userprofileread"></a> Schema: `fastapi_backend__app__user_profile__schemas__UserProfileRead`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `first_name` | `string` | Yes | First Name |
| `middle_name` | `string | null` | No | Middle Name |
| `last_name` | `string` | Yes | Last Name |
| `phone_number` | `string | null` | No | Phone Number |
| `date_of_birth` | `string` | Yes | Date Of Birth |
| `sex` | ``Gender`` | Yes |  |
| `work_type` | `string | null` | No | Work Type |
| `education` | ``EducationLevel`` | Yes |  |
| `diabetes` | `boolean` | No | Diabetes |
| `heart_disease` | `boolean` | No | Heart Disease |
| `history_cvd` | `boolean` | No | History Cvd |
| `kidney_disease` | `boolean` | No | Kidney Disease |
| `prevalent_stroke` | `boolean` | No | Prevalent Stroke |
| `prevalent_hypertension` | `boolean` | No | Prevalent Hypertension |
| `bp_history` | ``BpHistory`` | Yes |  |
| `family_history_htn` | `boolean | null` | No | Family History Htn |
| `family_history_cvd` | `boolean | null` | No | Family History Cvd |
| `smoking` | ``SmokingStatus`` | Yes |  |
| `cigs_per_day` | `integer | null` | No | Cigs Per Day |
| `alcohol_use` | ``AlcoholUse` | null` | No |  |
| `physical_activity_level` | ``PhysicalActivity` | null` | No |  |
| `exercise_frequency` | `string | null` | No | Exercise Frequency |
| `diet_quality` | `string | null` | No | Diet Quality |
| `salt_intake` | `number | null` | No | Salt Intake |
| `stress_score` | `integer | null` | No | Stress Score |
| `sleep_duration` | `number | null` | No | Sleep Duration |
| `sleep_quality` | `string | null` | No | Sleep Quality |
| `id` | `string` | Yes | Id |
| `user_id` | `string` | Yes | User Id |
| `email` | `string` | Yes | Email |
| `age` | `integer` | Yes | Age |
| `created_at` | `string` | Yes | Created At |
| `updated_at` | `string | null` | Yes | Updated At |

### <a id="schema-login"></a> Schema: `login`
*Type*: **Object**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `grant_type` | `string | null` | No | Grant Type |
| `username` | `string` | Yes | Username |
| `password` | `string` | Yes | Password |
| `scope` | `string` | No | Scope |
| `client_id` | `string | null` | No | Client Id |
| `client_secret` | `string | null` | No | Client Secret |

