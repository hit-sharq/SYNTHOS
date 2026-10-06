# Milestone 2 — UI Sketches & Flowcharts

## Why These Deliverables Matter

Schools require UI sketches, flowcharts, UML diagrams, and ERDs because they prove you can design a system **before** writing code. They show:

- **UI sketches** — You understand user needs and can plan interfaces without jumping straight to implementation
- **Flowcharts** — You understand business logic and can map how data moves through processes
- **UML diagrams** — You understand system architecture and object relationships
- **ERD** — You understand how data is structured and related in a database

These are foundational software engineering skills. Professional teams build wireframes and diagrams before committing to code because changing a diagram is cheap; refactoring production code is expensive.

---

## UI Sketches (Low-Fidelity Wireframes)

### 1. Intake / Creative Brief Page

```
┌─────────────────────────────────────────────────────┐
│  AIMS                              Workspace  ▾     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  New Project                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Client Information                          │    │
│  │                                             │    │
│  │ Name:      [___________________________]     │    │
│  │ Company:   [___________________________]     │    │
│  │ Email:     [___________________________]     │    │
│  │ Phone:     [___________________________]     │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Project Details                             │    │
│  │                                             │    │
│  │ Title:      [___________________________]    │    │
│  │ Type:       [Brand & Campaign       ▾]      │    │
│  │ Objective:  [___________________________]    │    │
│  │ Audience:   [___________________________]    │    │
│  │ Direction:  [___________________________]    │    │
│  │ Budget:     [___________________________]    │    │
│  │ Timeline:   [___________________________]    │    │
│  │ Context:    [___________________________]    │    │
│  │                [___________________________]  │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [ Voice Input: 🎤 Record briefing ]                │
│                                                     │
│  [ Submit Brief → ]                                 │
└─────────────────────────────────────────────────────┘
```

### 2. Admin Workflow Overview

```
┌─────────────────────────────────────────────────────┐
│  AIMS Admin                              Logout     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  What needs your attention next?                    │
│  A calm view of every active project...             │
│                                                     │
│  [Active: 12]  [AI activity: 34]                    │
│  [Attention: 3]  [Awaiting approval: 2]             │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Project A    │  │ Project B    │  │ Project C│ │
│  │ Stage: Call  │  │ Stage: Brief │  │Stage:Appr│ │
│  │ Status: ▶    │  │ Status: ⚠   │  │Status: 🔴│ │
│  │ Progress: 40%│  │ Progress: 10%│  │Progress: │ │
│  │ [Open →]     │  │ [Open →]     │  │[Review]  │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
│  [+ New Project]                                    │
└─────────────────────────────────────────────────────┘
```

### 3. Project Detail — 10-Stage Pipeline

```
┌─────────────────────────────────────────────────────┐
│  Project A — Brand & Campaign               [←]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Progress: 40%  ████████░░░░░░░░░░                  │
│                                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │ 01 │→│ 02 │→│ 03 │→│ 04 │  │ 05 │               │
│  │Brf │ │Call│ │Trsc│ │Und │  │PrBr│               │
│  │ ✓  │ │ ✓  │ │ ✓  │ │ ▶  │  │    │               │
│  └────┘ └────┘ └────┘ └────┘  └────┘               │
│                                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │ 06 │  │ 07 │  │ 08 │  │ 09 │  │ 10 │               │
│  │Wrks│  │Synth│ │Prop│  │Quote│ │Appr│               │
│  │    │  │    │  │    │  │    │  │    │               │
│  └────┘  └────┘  └────┘  └────┘  └────┘               │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Stage 4: AI Understanding                    │    │
│  │                                             │    │
│  │ Confidence: 75%                             │    │
│  │                                             │    │
│  │ WANTS                          [human] [ai]  │    │
│  │ • Increase brand awareness      ✓ human     │    │
│  │ • Launch in Q3                  ✓ ai        │    │
│  │                                             │    │
│  │ RISKS                                      │    │
│  │ • Budget constraints noted                 │    │
│  │                                             │    │
│  │ MISSING                                    │    │
│  │ • Target audience demographics             │    │
│  │                                             │    │
│  │ [Approve & Continue →]                     │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 4. Talent Dashboard

```
┌─────────────────────────────────────────────────────┐
│  AIMS                                   Profile ▾   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Welcome, Alex                                       │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ Level: 12       │  │ XP: 340/500     │            │
│  │ ████████░░      │  │ Rising Star     │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
│  My Projects                                        │
│  ┌─────────────────────────────────────────────┐    │
│  │ Nike Campaign            Stage: Quote   [→]  │    │
│  │ Client: Nike             Progress: 80%        │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │ Safaricom Rebrand        Stage: Approval [→]  │    │
│  │ Client: Safaricom        Progress: 95%        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  My Applications                                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ Creative Director @ Ogilvy    pending        │    │
│  │ Brand Designer @ M-Net        reviewed       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 5. Jobs Board (Public)

```
┌─────────────────────────────────────────────────────┐
│  Synthos — Kenya's Creative Job Board               │
│  Talents  Companies  Jobs  Challenges  [Sign In]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Find your next creative role                       │
│                                                     │
│  [ Search by title, skill, or company...     🔍 ]   │
│                                                     │
│  Filters: [Full-time] [Contract] [Remote] [Design]   │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✓ Verified Employer                          │    │
│  │ Senior Graphic Designer                      │    │
│  │ Ogilvy Kenya  •  Nairobi  •  Full-time       │    │
│  │ KSh 150K - 250K  •  Posted 2d ago            │    │
│  │ Skills: Figma, Illustrator, Branding         │    │
│  │                                    [Apply →]  │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✓ Verified Employer                          │    │
│  │ Motion Graphics Artist                       │    │
│  │ M-Net Africa  •  Remote  •  Contract        │    │
│  │ KSh 80/hr  •  Posted 5d ago                  │    │
│  │ Skills: After Effects, Cinema 4D, 3D         │    │
│  │                                    [Apply →]  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```
