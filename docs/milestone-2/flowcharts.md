# Milestone 2 — Flowcharts

## 1. Project Intake & Creative Workflow Flowchart

```mermaid
flowchart TD
    A[Client submits<br/>Creative Brief] --> B{AI Analysis}
    B --> C[Extract wants,<br/>objectives, risks, missing]
    C --> D[Confidence score<br/>calculated]
    D --> E{Confidence<br/>> 70%?}
    E -->|Yes| F[Auto-advance to<br/>Client Call stage]
    E -->|No| G[Flag for human review<br/>Hold at Brief stage]

    F --> H[Schedule & run<br/>client call]
    H --> I[Generate transcript<br/>from recording/notes]
    I --> J[AI extracts decisions,<br/>action items, requirements]
    J --> K[Build AI Understanding<br/>with confidence score]

    K --> L{Human review<br/>required?}
    L -->|Yes| M[Admin/PM reviews<br/>insights & attributes]
    L -->|No| N[Auto-approve<br/>AI attributes]
    M --> N

    N --> O[Generate Project Brief<br/>from all sources]
    O --> P[Run Workshop<br/>with team]
    P --> Q[Human adds notes,<br/>AI suggests insights]
    Q --> R[Generate Synthesis<br/>executive + strategic + creative]

    R --> S[Draft Proposal<br/>AI-generated]
    S --> T[Human review & edit]
    T --> U{Approved?}
    U -->|No| V[Revise proposal]
    V --> T
    U -->|Yes| W[Generate Quote<br/>from proposal]
    W --> X[Human review & edit]
    X --> Y{Final approval}
    Y -->|No| Z[Revise quote]
    Z --> X
    Y -->|Yes| AA[Send to client<br/>for sign-off]

    AA --> AB[Project complete<br/>or move to production]
```

## 2. Job Posting & Approval Flowchart

```mermaid
flowchart TD
    A[Company posts<br/>new job] --> B{Company<br/>verified?}
    B -->|No| C[Job status:<br/>pending]
    B -->|Yes| D[Job status:<br/>approved?]

    C --> E[Admin reviews<br/>company verification]
    E --> F{Approve<br/>company?}
    F -->|Yes| G[Company verified<br/>Job auto-approved]
    F -->|No| H[Company remains<br/>unverified]

    D --> I[Job appears on<br/>public board]
    G --> I

    I --> J[Talent views<br/>& applies]
    J --> K[Application recorded<br/>status: pending]
    K --> L[Company reviews<br/>applications]
    L --> M{Talent<br/>accepted?}
    M -->|Yes| N[Status: accepted]
    M -->|No| O[Status: rejected]

    P[User reports<br/>listing] --> Q{3+ open<br/>reports?}
    Q -->|Yes| R[Job demoted to<br/>pending review]
    Q -->|No| S[Job remains<br/>visible]
    R --> T[Admin reviews<br/>moderation queue]
    T --> U{Approve<br/>listing?}
    U -->|Yes| V[Job restored]
    U -->|No| W[Job rejected<br/>& hidden]
```

## 3. User Registration & Role Flowchart

```mermaid
flowchart TD
    A[User signs up<br/>via Clerk] --> B{Select role<br/>during signup}
    B -->|Talent| C[Create talent profile<br/>skills, rate, availability]
    B -->|Company| D[Create company profile<br/>name, email, industry]
    B -->|Client| E[Create client contact<br/>linked to company]

    D --> F{Company<br/>status}
    F -->|pending| G[Company hidden from<br/>public directory]
    F -->|active| H[Company visible<br/>can post jobs]

    G --> I[Admin reviews<br/>registration]
    I --> J{Approve?}
    J -->|Yes| K[Company: active<br/>verified: true]
    J -->|No| L[Company: suspended]

    C --> M[Talent dashboard<br/>portfolio, feed, jobs]
    H --> N[Company dashboard<br/>post jobs, review apps]
    E --> O[Client dashboard<br/>view projects, proposals]

    K --> N
```

## 4. AI Workflow Automation Flowchart

```mermaid
flowchart TD
    A[New project created] --> B[AI Agent:<br/>Brief Analyzer]
    B --> C[Extract structured data<br/>from creative brief]
    C --> D[Store in Brief model]

    D --> E[Trigger: Client Call<br/>scheduled/completed]
    E --> F[AI Agent:<br/>Transcript Analyzer]
    F --> G[Parse transcript lines<br/>extract speakers, decisions, actions]
    G --> H[Store in Transcript model]

    H --> I[AI Agent:<br/>Understanding Builder]
    I --> J[Map raw info to<br/>wants, objectives, risks, missing]
    J --> K[Assign attr: ai|human|mixed<br/>confidence score]
    K --> L[Store in Understanding<br/>& Insight models]

    L --> M[AI Agent:<br/>Brief Synthesizer]
    M --> N[Combine Brief + Transcript<br/>+ Understanding]
    N --> O[Generate Project Brief]
    O --> P[Store in ProjectBrief model]

    P --> Q[Trigger: Workshop<br/>completed]
    Q --> R[AI Agent:<br/>Synthesis Engine]
    R --> S[Merge workshop insights<br/>with project brief]
    S --> T[Generate executive summary,<br/>strategic + creative direction]
    T --> U[Store in Synthesis model]

    U --> V[AI Agent:<br/>Proposal Drafter]
    V --> W[Use synthesis to draft<br/>proposal sections]
    W --> X[Store in Proposal model<br/>status: draft]

    X --> Y[Trigger: Proposal<br/>approved by human]
    Y --> Z[AI Agent:<br/>Quote Generator]
    Z --> AA[Calculate line items,<br/>tax, discount, terms]
    AA --> AB[Store in Quote model<br/>status: draft]

    AB --> AC[Trigger: Quote<br/>approved by human]
    AC --> AD[Mark project stage:<br/>approval]
    AD --> AE[Send to client<br/>for final sign-off]
```

## 5. Notification & Real-time Updates Flowchart

```mermaid
flowchart TD
    A[System event occurs] --> B{Event type}
    B -->|Project stage change| C[Create Notification<br/>for project owner]
    B -->|Proposal/Quote needs review| D[Create Notification<br/>for admin/PM]
    B -->|New job application| E[Create Notification<br/>for company]
    B -->|Application accepted/rejected| F[Create Notification<br/>for talent]

    C --> G[Push to in-app<br/>notification center]
    D --> G
    E --> G
    F --> G

    G --> H{User online?}
    H -->|Yes| I[Real-time update<br/>via Presence]
    H -->|No| J[Store in DB<br/>mark as unread]

    I --> K[Badge count<br/>updated]
    J --> L[Email digest<br/>optional]
```
