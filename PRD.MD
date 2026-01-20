# Property Management Site Product Requirements Document (PRD)

## 1. Introduction and Goal

**Goal:** To create an awesome, effective, and secure, login-only Property Management Site to facilitate communication, financial management, and maintenance tracking for a single rental property.

## 2. Key Stakeholders

| Role | Name | Notes |
| :---: | :---: | :---: |
| **Owner** | Shanie Holman | The property owner who requires detailed financial oversight. |
| **Tenant** | Gregg Marshall | The current tenant who needs to view rent payments, lease details, and request maintenance/communication. |
| **Property Manager (PM)** | Dan Connolly | The onsite manager responsible for maintenance, communication, and vendor management. |

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

