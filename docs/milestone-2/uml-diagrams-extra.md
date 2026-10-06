# Milestone 2 — Additional UML Diagrams

## 1. Component Diagram — System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Tier"]
        Browser["Web Browser<br/>(Next.js SSR/CSR)"]
        Mobile["Mobile Browser"]
    end

    subgraph Edge["Edge / CDN"]
        Vercel["Vercel Edge Network"]
        CDN["Static Assets CDN"]
    end

    subgraph App["Application Tier<br/>(Next.js 14+)"]
        Pages["App Router Pages<br/>(app/)"]
        API["API Routes<br/>(app/api/)"]
        Middleware["Clerk Auth<br/>Middleware"]
        ServerComponents["Server Components"]
        ClientComponents["Client Components"]
    end

    subgraph Services["Service Layer<br/>(lib/)"]
        Auth["auth.ts<br/>(Clerk integration)"]
        PrismaClient["prisma.ts<br/>(ORM client)"]
        DataServer["data-server.ts<br/>(server data fetching)"]
        AIWorkflow["auto-workflow.ts<br/>(AI orchestration)"]
        Validation["zod schemas<br/>(input validation)"]
    end

    subgraph External["External Services"]
        Clerk["Clerk<br/>(Authentication)"]
        OpenAI["OpenAI / AI Provider<br/>(Intelligence engine)"]
        PostgreSQL["PostgreSQL<br/>(Primary database)"]
        Redis["Upstash Redis<br/>(Cache + rate limit)"]
        Blob["Vercel Blob<br/>(File storage)"]
        Email["Resend<br/>(Transactional email)"]
    end

    subgraph Admin["Admin Tier"]
        AdminUI["/admin/*<br/>(Workflow overview)"]
        ModQueue["Moderation queue<br/>(Job reports)"]
        UserMgmt["User management"]
    end

    Browser --> Vercel
    Mobile --> Vercel
    Vercel --> CDN
    Vercel --> Pages
    Vercel --> API

    Pages --> ServerComponents
    Pages --> ClientComponents
    API --> Middleware
    Middleware --> Auth

    ServerComponents --> DataServer
    ClientComponents --> DataServer
    API --> DataServer

    DataServer --> PrismaClient
    DataServer --> AIWorkflow
    DataServer --> Validation

    Auth --> Clerk
    PrismaClient --> PostgreSQL
    AIWorkflow --> OpenAI
    API --> Redis
    API --> Blob
    API --> Email

    AdminUI --> API
    ModQueue --> API
    UserMgmt --> API
```

## 2. State Diagram — Project Lifecycle

```mermaid
stateDiagram-v2
    [*] --> brief: Project created

    brief --> call: AI analysis complete
    brief --> brief: Flagged for review

    call --> transcript: Call completed
    transcript --> understanding: Transcript parsed

    understanding --> projectBrief: Insights approved
    understanding --> understanding: Awaiting human review

    projectBrief --> workshop: Brief synthesized
    workshop --> synthesis: Workshop complete

    synthesis --> proposal: Synthesis generated
    proposal --> proposal: Human revising
    proposal --> quote: Proposal approved

    quote --> approval: Quote approved
    quote --> quote: Human revising
    approval --> approval: Awaiting client

    approval --> [*]: Client signed off
    approval --> synthesis: Revision requested

    note right of brief
        AI analyzes creative brief
        Confidence check
    end note

    note right of call
        Embedded or external meeting
        Transcript extraction
    end note

    note right of understanding
        AI + Human attribution
        Review status tracking
    end note

    note right of proposal
        AI-drafted
        Human-approved
    end note
```

## 3. Package Diagram — Code Organization

```mermaid
flowchart TD
    subgraph App_Router["app/ (Next.js App Router)"]
        Layout["layout.tsx<br/>(Root layout)"]
        Page["page.tsx<br/>(Home)"]
        Dashboard["dashboard/"]
        Admin["admin/"]
        Intake["intake/"]
        Jobs["jobs/"]
        Talents["talents/"]
        Companies["companies/"]
        API["api/"]
        Static["Static pages<br/>(about, privacy, terms)"]
    end

    subgraph Components["components/"]
        AppComp["app/<br/>(Page, Panel, UI)"]
        Shared["shared/<br/>(Buttons, Forms)"]
        Hooks["useReveal<br/>(Scroll animations)"]
    end

    subgraph Lib["lib/"]
        Prisma["prisma.ts"]
        Auth["auth.ts"]
        DataServer["data-server.ts"]
        AIWorkflow["auto-workflow.ts"]
        Pagination["pagination.ts"]
        Utils["utils.ts"]
    end

    subgraph Prisma["prisma/"]
        Schema["schema.prisma"]
        Migrations["migrations/"]
        Seed["seed.ts"]
    end

    subgraph Types["types/"]
        Next["next-auth.d.ts"]
        Custom["custom.d.ts"]
    end

    subgraph Public["public/"]
        Icons["icons/"]
        Images["images/"]
        Fonts["fonts/"]
    end

    subgraph Tests["__tests__/"]
        Unit["unit/"]
        Integration["integration/"]
    end

    subgraph E2E["e2e/"]
        Playwright["playwright.config.ts"]
        Specs["*.spec.ts"]
    end

    App_Router --> Components
    App_Router --> Lib
    App_Router --> Types
    App_Router --> Public
    Lib --> Prisma
    Tests --> Lib
    E2E --> App_Router
```

## 4. Activity Diagram — Admin Moderation Workflow

```mermaid
activityDiagram-v2
    title Admin Moderation Queue

    start
    :User reports job listing;
    :Create JobReport (status: open);
    :Increment report count;

    if :Report count >= 3? then
        :Demote job to "pending";
        :Job removed from public board;
    else
        :Job remains visible;
    endif

    :Notify admin of new report;

    while :Pending reports exist? is true
        :Admin opens moderation queue;
        :Fetch open reports;
        :Review job listing details;
        :Review report reason + details;

        if :Report valid? then
            switch :Action
            case :Reject listing
                :Update JobPosting.status = "rejected";
                :Update JobReport.status = "resolved";
                :Notify company of rejection;
                :Job hidden from board;
            case :Keep listing
                :Update JobReport.status = "dismissed";
                :Job remains visible;
                :Notify reporter of decision;
            case :Request revision
                :Update JobPosting.status = "pending";
                :Send revision request to company;
                :Update JobReport.status = "reviewing";
            endswitch
        else
            :Update JobReport.status = "dismissed";
            :Dismiss false report;
            :Flag reporter if pattern;
        endif

        :Log action in AuditLog;
    endwhile

    stop
```

## 5. Entity Relationships — Job Board Subsystem

```mermaid
erDiagram
    Company ||--o{ JobPosting : "posts"
    Company ||--o{ CompanyVerification : "submits"
    JobPosting ||--o{ JobApplication : "receives"
    JobPosting ||--o{ JobReport : "flagged by"
    User ||--o{ JobApplication : "submits"
    User ||--o{ JobReport : "reports"
    User ||--o{ JobReport : "reviews"

    Company {
        string id PK
        string name
        string slug UK
        string email UK
        boolean verified
        string status "pending|active|suspended"
        datetime verifiedAt
        string verifiedBy
    }

    JobPosting {
        string id PK
        string companyId FK
        string title
        string description
        string[] requirements
        string[] skills
        string status "pending|approved|rejected|expired|filled"
        boolean featured
        int views
        datetime expiresAt
        datetime approvedAt
        string approvedBy
    }

    JobApplication {
        string id PK
        string jobId FK
        string talentId FK
        string message
        string status "pending|reviewed|accepted|rejected"
        datetime createdAt
    }

    JobReport {
        string id PK
        string jobId FK
        string reason
        string details
        string status "open|reviewing|resolved|dismissed"
        string reportedById FK
        string reviewedById FK
        datetime reviewedAt
        string resolution
    }

    CompanyVerification {
        string id PK
        string companyId FK
        string type "business_registration|kra_pin|bank_details|reference_call"
        string status "pending|approved|rejected"
        string documentUrl
        string notes
        string reviewedBy
        datetime reviewedAt
    }
```
