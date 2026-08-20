# Architecture Diagrams

## System Architecture

```mermaid
graph TB
    subgraph "Dental Intelligence Stack"
        A[Dentist Question] --> B[Retrieval Router]
        B --> C{Retrieval Plan}
        C -->|patient_context| D[Patient SQL]
        C -->|semantic_knowledge| E[Dental RAG<br/>pgvector/numpy]
        C -->|web_research| F[Tavily Web]
        C -->|graph_context| G[Knowledge Graph<br/>NetworkX/Neo4j]
        C -->|memory| H[Memory Store]
        
        D & E & F & G & H --> I[Evidence Fusion<br/>dedup + rank]
        I --> J[Context Builder<br/>role-specific]
        J --> K[Dental Crew]
        
        subgraph "Specialist Agents"
            K --> K1[Clinical Analyst]
            K --> K2[Evidence Specialist]
            K --> K3[Research Specialist]
            K --> K4[Medication Specialist]
            K --> K5[Materials Specialist]
        end
        
        K1 & K2 & K3 & K4 & K5 --> L[Case Synthesizer]
        L --> M[Human Review<br/>LangGraph interrupt]
        M -->|approve/modify/reject| N[Final Output]
        N --> O[Feedback/Memory]
    end
    
    subgraph "Storage"
        P[(PostgreSQL<br/>patients, teeth, meds)]
        Q[(Knowledge Chunks<br/>+ embeddings)]
        R[(Memory Tables<br/>case, doctor, feedback)]
        S[(Run Traces)]
    end
    
    D --> P
    E --> Q
    H --> R
    O --> R
    N --> S
```

## LangGraph Workflow

```mermaid
graph LR
    START --> route
    route --> retrieve
    retrieve --> clinical_analyst
    clinical_analyst --> evidence_specialist
    evidence_specialist --> research_specialist
    research_specialist --> medication_specialist
    medication_specialist --> materials_specialist
    materials_specialist --> synthesize
    synthesize --> human_review
    human_review -->|interrupt| PAUSE[Wait for Review]
    PAUSE -->|resume| finalize
    finalize --> END
    
    style human_review fill:#f9f,stroke:#333,stroke-width:4px
    style PAUSE fill:#ff9,stroke:#333,stroke-width:2px
```

## Retrieval Pipeline

```mermaid
graph TB
    Q[Question] --> R[RetrievalRouter]
    R -->|RetrievalPlan| S{Sources}
    
    S -->|patient_context| T1[Structured SQL<br/>Patient/Teeth/Meds]
    S -->|semantic_knowledge| T2[Semantic Search<br/>Vector cosine]
    S -->|web_research| T3[Web Search<br/>Tavily]
    S -->|graph_context| T4[Graph Query<br/>Relationships]
    S -->|memory| T5[Memory Recall<br/>Instructions/Prefs]
    
    T1 & T2 & T3 & T4 & T5 --> F[EvidenceItem List]
    F --> D[Deduplicate]
    D --> K[Rank by Score]
    K --> C[Context Builder]
    
    C -->|clinical_analyst| CA[Patient + Evidence]
    C -->|evidence_specialist| ES[Evidence Only]
    C -->|medication_specialist| MS[Patient Meds + Drug Knowledge]
    C -->|materials_specialist| MT[Materials + Inventory]
    C -->|synthesizer| SY[Full Context]
```

## Agent Architecture

```mermaid
graph TB
    subgraph "Input"
        Q[Question]
        CTX[Context Blocks]
    end
    
    subgraph "Specialist Agents"
        CA[Clinical Analyst<br/>Role: Senior Dental Clinical Case Analyst<br/>Mission: Build structured understanding]
        ES[Evidence Specialist<br/>Role: Dental Evidence and Literature Specialist<br/>Mission: Find trusted evidence]
        RS[Research Specialist<br/>Role: Dental External Research Specialist<br/>Mission: Fresh external info]
        MS[Medication Specialist<br/>Role: Dental Medication and Drug-Safety Specialist<br/>Mission: Medication considerations]
        MT[Materials Specialist<br/>Role: Dental Materials and Availability Specialist<br/>Mission: Required materials + availability]
    end
    
    subgraph "Synthesis"
        SY[Case Synthesizer<br/>Role: Senior Dental Case Intelligence Synthesizer<br/>Mission: Combine findings into briefing]
    end
    
    subgraph "Output Schemas"
        CA --> CA_OUT[ClinicalAnalysis]
        ES --> ES_OUT[EvidenceAnalysis]
        RS --> RS_OUT[ResearchAnalysis]
        MS --> MS_OUT[MedicationAnalysis]
        MT --> MT_OUT[MaterialsAnalysis]
        SY --> SY_OUT[CaseReport]
    end
    
    Q & CTX --> CA & ES & RS & MS & MT
    CA_OUT & ES_OUT & RS_OUT & MS_OUT & MT_OUT --> SY
```

## Memory Architecture

```mermaid
graph TB
    subgraph "Memory Types"
        CM[Case Memory<br/>Approved conclusions<br/>Previous findings]
        DM[Doctor Memory<br/>Explicit preferences<br/>Workflow requirements]
        FM[Feedback Memory<br/>AI output → Doctor correction<br/>Reason + category]
        IM[Instruction Memory<br/>Durable behavioral rules<br/>Doctor-approved]
    end
    
    subgraph "Retrieval"
        Q[Current Question] --> MR[Memory Retrieval]
        MR -->|case_id| CM
        MR -->|doctor_id| DM & IM
        MR -->|semantic| CM & FM
        CM & DM & FM & IM --> CTX[Context Builder]
    end
    
    subgraph "Storage"
        CM & DM & FM & IM --> DB[(PostgreSQL/SQLite)]
    end
```

## Knowledge Graph

```mermaid
graph TB
    subgraph "Entities"
        P[Patient]
        T[Tooth]
        M[Medication]
        A[Allergy]
        C[Condition]
        PR[Procedure]
        MT[Material]
    end
    
    subgraph "Relationships"
        P -->|HAS_TOOTH| T
        P -->|TAKES| M
        P -->|ALLERGIC_TO| A
        P -->|HAS| C
        P -->|HAS_TOOTH_EVENT| T
        T -->|STATUS| S[Status]
        M -->|TREATS| C
        M -->|INTERACTS_WITH| M
        M -->|CONTRAINDICATED_IN| C
        PR -->|REQUIRES| MT
    end
    
    subgraph "Implementation"
        KG[KnowledgeGraph<br/>NetworkX DiGraph]
        KG -->|build from| DB[(PostgreSQL)]
        KG -->|query| Q[Relationships]
    end
```

## Safety Guardrails

```mermaid
graph TB
    R[Report] --> V{Validation}
    
    V -->|check 1| P1[Prohibited Claims<br/>No prescribe/diagnose]
    V -->|check 2| P2[Citation Presence<br/>Evidence must cite]
    V -->|check 3| P3[Uncertainty Disclosure<br/>Include uncertainties]
    V -->|check 4| P4[Dentist Review<br/>Questions for dentist]
    
    P1 & P2 & P3 & P4 --> D{All Pass?}
    D -->|Yes| OK[Valid Report]
    D -->|No| FAIL[Issues List]
    
    OK --> DIS[Add Disclaimer]
    DIS --> OUT[Final Output]
```

## Observability

```mermaid
graph TB
    subgraph "Run Trace"
        START[Start Run] --> R[Route<br/>routing_decision]
        R --> RET[Retrieve<br/>sources, n_evidence]
        RET --> CA[Clinical Analyst<br/>fields]
        CA --> ES[Evidence Specialist<br/>fields]
        ES --> RS[Research Specialist<br/>fields]
        RS --> MS[Medication Specialist<br/>fields]
        MS --> MT[Materials Specialist<br/>fields]
        MT --> SY[Synthesize<br/>safety_valid]
        SY --> HR[Human Review<br/>action]
        HR --> FIN[Finalize]
    end
    
    subgraph "Storage"
        R & RET & CA & ES & RS & MS & MT & SY & HR & FIN --> RUN[(RunRecord)]
        R & RET & CA & ES & RS & MS & MT & SY & HR & FIN --> STEP[(RunStep)]
    end
    
    RUN --> TRACE[get_trace<br/>run_id → full trace]
    STEP --> TRACE
```

## API Endpoints

```mermaid
graph LR
    subgraph "Client"
        DOC[Dentist]
    end
    
    subgraph "API"
        A1[POST /analyze]
        A2[POST /review]
        A3[POST /research]
        A4[POST /feedback]
        A5[GET /memory]
        A6[GET /evidence]
        A7[GET /trace]
    end
    
    subgraph "Backend"
        W[LangGraph Workflow]
        R[Retrieval Pipeline]
        M[Memory Store]
        T[Tracer]
    end
    
    DOC -->|question| A1
    A1 -->|draft + thread_id| DOC
    DOC -->|review| A2
    A2 -->|final output| DOC
    
    DOC -->|research| A3
    A3 -->|evidence| DOC
    
    DOC -->|feedback| A4
    A4 -->|store| M
    
    DOC -->|query| A5 & A6
    A5 & A6 -->|data| DOC
    
    DOC -->|run_id| A7
    A7 -->|trace| T
```
