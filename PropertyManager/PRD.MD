# Property Management Site Product Requirements Document (PRD)

## 1. Introduction and Goal

**Goal:** To create an awesome, effective, and secure, login-only Property Management Site to facilitate communication, financial management, and maintenance tracking for a single rental property.

## 2. Key Stakeholders

| Role | Name | Notes |
| :---: | :---: | :---: |
| **Owner** | Shanie Holman | The property owner who requires financial oversight, view rent payments, high level project status and vendor information. |
| **Tenant** | Gregg Marshall | The current tenant who needs to , lease details, and request maintenance/communication. |
| **Property Manager (PM)** | Dan Connolly | The onsite manager responsible for maintenance, communication, and vendor management, as well as detailed project modeli
ng, B.O.M. and etailed project management tools |

## 3. Product Requirements

### 3.1. User Authentication and Roles (Core Requirement)

*   The site must be secure and require a login for access.
*   The system must support three distinct login roles: **Owner, Tenant, and Property Manager**.
*   Each role will have a specific, suggested set of access privileges.

### 3.2. Owner-Specific Financial and Investment Features

*   **Custom Financial Dashboard (MortgageCalc Redo):** The owner must have a detailed and snapshot view of their financial situation based on the functionality of the `MortgageCalc-v1.6.html` file (URL reference is internal and noted for the development team).
*   **Variable Inputs:** Allow the owner to input and vary:
    *   Current personal rent and utility payments (for comparison).
    *   Current job income.
*   **Financial Comparisons and Analysis:**
    *   Display the difference between current rental income versus her personal rent/utilities costs.
    *   Calculate and display estimated tax liability (non-primary residence).
    *   Provide possible methods/strategies to legally avoid or mitigate the tax penalty.
    *   Show comparative benefits of keeping the asset long-term versus selling it.

### 3.3. Communication and Interaction Features

*   **Communication Center:** A central hub for all parties, showing recent conversations, questions, and concerns.
*   **Scheduling and Messaging:** A method for all parties to:
    *   Leave messages.
    *   Schedule inspections.
*   **Tenant Satisfaction:** Display the current tenant satisfaction level and any logged concerns.
*   **Natural Language Assistant ("Gem"):** Provide a natural language question-answering tool specifically for the Owner (Shanie) to ask questions like:
    *   "Am I currently losing money?"
    *   "Are all repairs up to date?"
    *   "Does it make more sense for me to move in or keep renting?"

### 3.6. Issue Tracking System

*   **Issue Management:** A dedicated system for tracking property issues, maintenance requests, and concerns that is distinct from general messaging and larger projects.
*   **Issue Creation:** All parties can create issues with:
    *   Title and detailed description
    *   Category (maintenance, safety, noise, lease, billing, other)
    *   Priority level (low, medium, high, urgent/emergency)
    *   Photo/image attachments to document the issue
    *   Location within the property
*   **Issue Assignment:** PM assigns issues to:
    *   Self (PM handles directly)
    *   Vendor (from vendor directory)
    *   Tenant (if tenant responsibility per lease)
*   **Issue Status Workflow:**
    *   `open` → Issue reported, awaiting review
    *   `triaged` → PM has reviewed, assessed priority
    *   `assigned` → Assigned to responsible party
    *   `in_progress` → Work has begun
    *   `pending_approval` → Work complete, awaiting verification
    *   `resolved` → Issue successfully resolved
    *   `closed` → Issue closed (resolved or won't fix)
    *   `escalated` → Escalated to owner for decision
*   **Issue Tracking Features:**
    *   Timeline/activity log for each issue
    *   Resolution notes and before/after photos
    *   Estimated vs actual completion dates
    *   Cost tracking (if applicable)
    *   Link to vendor if vendor-resolved
    *   Option to convert to full Project if scope grows
*   **Role-Based Issue Views:**
    *   **Tenant:** Create issues, view own issues and status updates
    *   **PM:** Full issue management, assignment, resolution
    *   **Owner:** View all issues, see metrics, approve escalations
*   **Issue Notifications:**
    *   Automatic notifications on status changes
    *   SLA tracking (time since issue reported)
    *   Overdue issue alerts

### 3.7. Utility Tracking System

*   **Separate Utility Payments:** Track utilities separately from lease rent payments.
    *   Tenant pays lease and utilities as separate line items
    *   Monthly utilities amount configurable in settings
*   **Owner Pays/Tenant Reimburses Model:**
    *   When enabled, owner pays utility bills and receives reimbursement from tenant
    *   Total monthly income = Base Rent + Utilities Reimbursement
*   **Utility Bill Tracking (Owner Portal):**
    *   Record actual monthly utility bills
    *   Track bill status (pending, paid, overdue)
    *   View bill history with notes
    *   Compare actual vs stated utility amounts
*   **Overage Alert System:**
    *   Configurable threshold for overage alerts (default: $50)
    *   Notify owner when actual utility costs exceed stated amount
    *   Alert displayed on owner dashboard
*   **Tenant Portal Utilities View:**
    *   Display monthly utilities amount
    *   Show total monthly payment (Rent + Utilities)
    *   Clear breakdown of payment components
*   **Data Propagation:**
    *   Utility settings sync to tenant portal automatically
    *   Changes in owner settings reflected immediately across all views

### 3.4. Property and Document Management

*   **Vendor Directory:** A comprehensive list showing all current vendors.
*   **Estimate uploads and comparison
*   **Rent Payment Tracking:** Display a history and current status of rent payments made.
*   **Lease Management:**
    *   Show the current lease document.
    *   Provide the ability to extend the current lease and facilitate digital signing.
*   **Zillow Integration:** Extract and display maintenance-related information from the specified Zillow rental manager dashboard link: `https://www.zillow.com/rental-manager/properties/2jbs2gzxvd9am/dashboard/maintenance-tasks?itc=postbutton_sitenav`.

### 3.5. Property Maintenance Tracking

*   **PM Tasks Display:** Current and suggested Property Manager tasks must be displayed as they arise.
*   **Editable Checklist:** The Property Manager must have access to the main checklist with the ability to modify it.

The required **Property Maintenance Checklist** structure to be implemented:

| Category | Frequency | Sample Tasks |
| :---: | :---: | :---: |
| **I. Monthly Routine** | Monthly | Test all smoke/CO detectors, check for leaks/moisture, clean range hood filter, check water softener salt. |
| **II. Quarterly Routine** | Quarterly (Jan, Apr, Jul, Oct) | Check and/or change HVAC filters. |
| **III. Bi-Annual & Seasonal Routine** | Twice per year / Seasonal | **Winter/Late Fall Prep (March & Sept):** Clean gutters, inspect roof, schedule furnace tune-up, winterize outdoor plumbing, check weatherstripping. |
| | | **Deep Cleaning & Inspection (Jan & Dec):** Vacuum refrigerator coils, clean dishwasher filter, descale shower heads, check for dampness/leaks. |
| **IV. Annual Routine** | Annually | **January:** Flush water heater, verify exterminator inspection, check fire extinguisher gauge. **June (Exterior):** Vacuum dryer vent, inspect/re-seal wood decks (as needed), check foundation perimeter, trim trees/shrubs. |
| **V. Major Project Planning** | Long-Term | New Roof (obtain quotes), Exterior Paint Job (plan seasonal window), Driveway Sealing (schedule every 2-3 years). |

