export const profile = {
  firstName: "Srilekha",
  fullName: "Srilekha Mamidala",
  fullRole: "Computer Science, Data Science, and Economics @ MIT",
  bio: "I'm a student at MIT studying Computer Science, Data Science, and Economics. Check out my projects and experience, and feel free to reach out!",
  email: "mamidala@mit.edu",
  headshot: "/headshot.jpg",
  social: {
    github: "https://github.com/srilekha511",
    linkedin: "https://www.linkedin.com/in/srilekha-mamidala/",
  }
};

export const education = {
  school: "Massachusetts Institute of Technology (MIT)",
  location: "Cambridge, MA",
  degree: "Candidate for Bachelor of Science in Computer Science, Data Science, and Economics",
  graduation: "June 2028",
  coursework: ["Algorithms", "Machine Learning", "Econometrics", "Game Theory", "Optimization for Business Analytics"],
  honors: [
    "Jane Street Math Prize for Girls Invitee (top 250 girls, USA/Canada)",
    "3-time International Science and Engineering Fair Finalist",
    "PennApps Hackathon Winner",
    "Bridgewater Associates AI Immersion Hackathon Invitee",
  ],
};

export const skills = [
  { group: "Programming", items: ["Python", "Java", "Linux", "C/C++", "R", "SQL", "TypeScript", "JavaScript", "Swift", "C#", "React", "Git", "Shell Scripting", "Kubernetes"] },
  { group: "Systems & Infrastructure", items: ["Object-Oriented Programming", "Distributed Systems", "Docker", "CI/CD", "Databricks", "AWS", "Terraform"] },
  { group: "Quantitative & ML", items: ["Machine Learning", "Statistical Analysis", "Econometrics", "Optimization", "PyTorch", "Data Analytics"] },
  { group: "Financial", items: ["LBO Modeling", "Financial Modeling", "Financial Statement Analysis", "Equity Valuation", "Market Research", "Portfolio Analysis", "Bloomberg API"] },
  { group: "Tools & Platforms", items: ["Bloomberg Terminal", "PowerPoint", "Word", "Excel", "Tableau", "Power BI", "Databricks", "AWS"] },
];

export const interests = {
  academic: [
    "AI & machine learning",
    "NLP & LLM evaluation research",
    "Venture capital & startups",
    "Quantitative finance & economics",
  ],
  personal: ["Classical Dance", "Traveling/Backpacking", "Cooking", "Philadelphia Eagles", "Painting", "Singing"],
};

// room: 'research' puts a role in the Research room; 'experience' keeps it with jobs.
export const experience = [
  {
    id: "disney", room: "experience", plaque: "Disney Streaming", art: "castleStream", company: "Disney Streaming", role: "Software Engineering Intern",
    location: "Santa Monica, CA", dates: "June 2026 – August 2026",
    bullets: [
      "Developed internal developer tooling for Disney Streaming using Databricks, Apache Spark, AWS, Linux, and Terraform, improving platform scalability and engineering productivity across distributed data pipelines, reducing latency by over 400%",
      "Architected AI-assisted knowledge retrieval system leveraging Model Context Protocols (MCPs) to automate access to technical documentation and domain expertise, reducing engineering search time by 150% and automating developer workflows",
    ],
  },
  {
    id: "acronym", room: "experience", plaque: "Acronym", art: "clusterJudge", company: "Acronym", role: "Machine Learning Intern",
    location: "New York, NY", dates: "September 2026 – Present",
    bullets: [
      "Building an LLM evaluation pipeline that scores signal extractions against source artifacts using LLM-as-a-Judge, surfacing model and prompt failure modes across unstructured data",
      "Analyzing HDBSCAN embedding-based clustering of extracted signals to analyze cluster quality and reduce redundant themes and improve group-level synthesis, enabling more accurate classification of new signals and emerging trends",
      "Designing evaluation infrastructure to benchmark LLM models and extraction strategies across quality, cost, and latency",
    ],
  },
  {
    id: "hof", room: "experience", plaque: "HOF Capital", art: "rocketDiligence", company: "HOF Capital", role: "Investment Intern",
    location: "", dates: "September 2026 – Present",
    bullets: [
      "Source and conduct market and company diligence on AI, software, and frontier technology startups, assessing founders, products, markets, competitive landscapes, and technical differentiation to identify high-potential investment opportunities",
      "Develop investment theses through market research, founder conversations, and analysis of emerging technologies and products",
    ],
  },
  {
    id: "medialab", room: "research", plaque: "LLM Memory Inference @ MIT Media Lab", art: "memoryLoop", company: "MIT Media Lab", role: "Research Intern",
    location: "", dates: "September 2026 – Present",
    bullets: [
      "Investigating **self-confirming inference** in **persistent LLM memory**: tracing how an open-source memory system turns interactions into preference updates, to separate what users believe from what agents reinforce",
      "Measuring **inference provenance** across multi-turn chats and validating automated labels against **hand-labeled traces**",
    ],
  },
  {
    id: "mitecon", room: "research", plaque: "Behavioral Econ RCT @ MIT Economics", art: "phoneWellbeing", company: "MIT Department of Economics", role: "Research Intern",
    location: "Cambridge, MA", dates: "June 2026 – Present",
    bullets: [
      "Built and evaluated infrastructure for a **large-scale RCT** on **smartphone use and adolescent well-being**",
      "Diagnosed missing usage records from **Android app** and **Django backend** logs",
    ],
  },
  {
    id: "csail", room: "research", plaque: "LLM Evaluation @ MIT CSAIL", art: "formality", company: "MIT CSAIL, Decentralized Information Group", role: "Research Intern",
    location: "Cambridge, MA", dates: "August 2024 – Present",
    paper: "An Empirical Evaluation of LLMs for the Assessment of Subjective Qualities",
    tags: ["NLP", "ML", "Human-Computer Interaction (HCI)"],
    image: "/project3img1.png",
    bullets: [
      "Developed **metrics for subjective quality** (e.g. **formality**) across **10+ LLMs** with industry partner **Liberty Mutual**, speeding up insurance communications by **>60%**",
      "Ran **parallel human/LLM judge studies** (**300+ human ratings**) to build **auto-evaluation metrics** for agentic AI",
    ],
  },
  {
    id: "525vc", room: "experience", plaque: "525 VC", art: "voiceMemo", company: "525 Venture Capital Firm", role: "Venture Associate Intern",
    location: "New York, NY", dates: "December 2025 – February 2026",
    bullets: [
      "Built AI-driven investment portfolio management system using voice and text agentic AI models to ingest founder calls, inbound applications, pitch decks, and market research for deal sourcing, generating first-pass deal memos and SWOT analyses",
      "Training on historical decisions, diligence frameworks to flag risks, rank diligence questions, support investment decisions",
    ],
  },
  {
    id: "earthian", room: "experience", plaque: "Earthian AI", art: "climateGlobe", company: "Earthian AI — Dutch Commercial Property Insurance Optimization Startup", role: "Software Engineering Intern",
    location: "Enschede, Netherlands", dates: "June 2025 – August 2025",
    bullets: [
      "Improved climate risk analysis and expedited claim processing and underwriting by 200+% and delivered 2x more accurate insights for insurers in energy markets via PyTorch, FastAPI, AWS, React, leading development of full-stack AI chatbot",
    ],
  },
];

// room: 'research' puts a project in the Research room; 'projects' keeps it with the builds.
export const projects = [
  {
    id: 10,
    room: "projects",
    plaque: "HackMIT Hardware Hub",
    art: "hardwareHub",
    title: "HackMIT Hardware Hub",
    category: "Full Stack · HackMIT Organizing Team",
    description: "Built with the **HackMIT organizing team**: the hardware desk's web app, used by **700+ hackers** to browse and check out **200+ types of hardware**, with **badge QR-code checkout**, a **3D-print queue** with print-time estimates, and **\"order ready\" push notifications**.",
    whatILearned: "Shipping a **production app for a live event** as a team: a **React + TypeScript** frontend, **Flask + PostgreSQL** backend, and **Docker** deploys.",
    technologies: ["React", "TypeScript", "Flask", "PostgreSQL", "Docker"],
    link: "https://hardware.hackmit.org/",
    linkText: "Visit Hardware Hub",
  },
  {
    id: 11,
    room: "projects",
    plaque: "AI Stock-Move Analyst",
    art: "prism",
    title: "PRISM",
    category: "AI, Quant Finance · Bridgewater AI Hackathon",
    description: "Built at the **Bridgewater Associates AI Immersion Hackathon** (one of **~20 students** selected) with a team of four. When a stock makes a **sharp move**, PRISM uses **Claude** to explain why from cited **news, SEC filings, and earnings calls**, then judges whether the move is **structural (lean in)** or **transient (fade it)**.",
    whatILearned: "Building an **evidence-grounded LLM pipeline** over financial data, checked with **ablations and backtests**.",
    technologies: ["Python", "FastAPI", "Claude API", "SEC EDGAR", "pandas"],
  },
  {
    id: 12,
    room: "projects",
    plaque: "AI Deal Memo Generator",
    art: "dealMemo",
    title: "Investment Memo Generator",
    category: "AI, Venture Capital · 525 VC",
    description: "Built at **525 Venture Capital**: a web app that turns a **founder call**, **pitch deck**, and **financials** into a **first-draft investment memo**, with company research, a **SWOT analysis**, and a \"what do you have to believe\" section.",
    whatILearned: "Wiring **LLM research, transcription, and document parsing** into one workflow, deployed on **Google Cloud Run**.",
    technologies: ["Python", "Flask", "Gemini API", "Google Cloud Run", "Docker"],
  },
  {
    id: 2,
    room: "projects",
    plaque: "AI Insurance Chatbot",
    art: "chatbot",
    title: "AI-Powered Insurance Chatbot",
    category: "NLP, Full Stack",
    description: "An AI-powered SME insurance agent chatbot prototype that answers broker questions, makes coverage decisions, refers complex cases to human brokers, and uses rule-based logic combined with OpenAI's GPT model for conversational interactions.",
    whatILearned: "I learned how to build a AI chatbot by integrating a React frontend with a FastAPI backend, implementing session memory management, extracting business details using regex patterns, and leveraging OpenAI's API for NLP in a conversational insurance agent system.",
    technologies: ["NLP", "REST APIs", "React", "OpenAI API", "Tailwind"],
    image: "/project2img1.png",
    images: [
      "/project2img1.png"
    ]
  },
  {
    id: 13,
    room: "research",
    plaque: "Knowledge Graph QA @ MIT CSAIL, Decentralized Information Group",
    art: "trace",
    title: "TRACE: An Interactive Visual Paradigm for Knowledge Graph Question-Answering",
    category: "NLP + HCI Research",
    description: "**TRACE** (Traceable Reasoning and Answer-path Comprehension Engine) distills the evidence behind a **knowledge-graph QA** answer into a single **reasoning path** users can explore: **connected** when the answer is supported by the graph, **visibly broken** when it isn't. In a **mixed-methods user study** (24 WebQSP questions, 3-, 4- and 6-hop), **calibration accuracy more than doubled** on supported answers (**34.5% → 71.4%**, p = 2.0 × 10⁻⁴).",
    technologies: ["Knowledge Graphs", "NLP", "Graph Search", "HCI", "User Studies"],
    link: "https://purl.org/trace",
    linkText: "View TRACE",
  },
  {
    id: 4,
    room: "research",
    plaque: "Election Law Graphs @ MIT Election Lab",
    art: "election",
    title: "Web Scraping of Legislative Election Data for Knowledge Graph Analysis",
    category: "ML/NLP Research",
    description: "At the **MIT Election Data Science Lab**, built a pipeline turning **unstructured election legislation** into **knowledge graphs**, and classified bills to study how **lawmakers and interest groups** shape election policy.",
    whatILearned: "Turning messy political text into **structured, analyzable data** with **Python and R** to answer real policy questions.",
    technologies: ["Data Processing", "Web Scraping", "Python", "R"],
    image: "/project4img1.png",
    images: [
      "/project4img1.png"
    ]
  },
  {
    id: 5,
    room: "projects",
    plaque: "ML for Skin Diagnosis",
    art: "dermalab",
    title: "dermalab: AI and LLM-Powered Skin Disease Diagnosis",
    category: "ML/CV/NLP Hackathon Project",
    description: "Winner at PennApps XXIV, Best Use of MATLAB. Built dermalab, an end-to-end web platform that uses ML, deep learning, and LLMs to diagnose skin conditions, assess severity, predict disease spread, and explain results clearly to patients and doctors.",
    whatILearned: "This project taught me how to work in a team to integrate frontend and backend systems while applying machine learning, deep learning, APIs, and MATLAB to solve a real-world healthcare problem with an emphasis on usability and interpretability.",
    technologies: ["CV", "Deep Learning", "MATLAB", "NLP", "ML", "Flask", "PyTorch"],
    link: "https://devpost.com/software/dermalab",
    linkText: "View on DevPost",
    image: "/project5img1.png",
    images: [
      "/project5img1.png",
      "/project5img2.png",
      "/project5img3.png"
    ]
  },
  {
    id: 9,
    room: "research",
    plaque: "LLMs for Legal Code @ University of Pennsylvania",
    art: "legal",
    title: "LLMs for Legal Code",
    category: "ML, NLP Research",
    description: "WhartonMunicode: trained a **nanoGPT-based language model** on **thousands of municipal codes** to explore how LLMs can support **legal research** in public law.",
    whatILearned: "The **foundations of LLMs**, and how to adapt and train them on **domain-specific legal text**.",
    technologies: ["Hugging Face Transformers", "PyTorch", "Web Scraping", "NLP"],
    image: "/project9img1.png",
    images: [
      "/project9img1.png",
    ]
  },
  {
    id: 6,
    room: "research",
    plaque: "Dementia Risk via ML",
    art: "brainNetwork",
    title: "A Holistic, Personalized Dementia Risk Prediction Framework",
    category: "ML Research",
    description: "Built a **personalized dementia risk model** combining **ML with network theory** to capture lifestyle, environmental, and genetic interactions. **$2,500 award** from the **Association for Computing Machinery**.",
    whatILearned: "Combining ML methods to turn **biological networks** into **predictive insights**.",
    technologies: ["ML Algorithms", "RF", "SVM", "Pandas", "ML", "Graph Theory"],
    link: "https://arxiv.org/pdf/2311.09229",
    linkText: "View on Arxiv",
    image: "/project6img1.png",
    images: [
      "/project6img1.png",
      "/project6img2.png"
    ]
  },
  {
    id: 7,
    room: "research",
    plaque: "ML + Drug Repurposing @ Drexel University",
    art: "drugRepurposing",
    title: "ML + Drug Repurposing for Epilepsy",
    category: "Computational Biology Research",
    description: "NeuroCADR: built a **computational drug-repurposing pipeline** to find and rank **anti-epileptic drug candidates**. **1st place, Math & CS** at the **National Junior Science and Humanities Symposium**.",
    whatILearned: "Combining and preprocessing **biological data** so **ML algorithms** can use it well.",
    technologies: ["ML Algorithms", "KNN", "RF", "Drug Repurposing", "Pandas"],
    link: "https://arxiv.org/pdf/2309.13047",
    linkText: "View on Arxiv",
    image: "/project7img1.png",
    images: [
      "/project7img1.png",
      "/project7img2.png"
    ]
  },
  {
    id: 8,
    room: "projects",
    plaque: "ML-Based Food Expiry Predictor",
    art: "foodShelfLife",
    title: "ML-Based Food Shelf Life Tracking",
    category: "ML, CV Research",
    description: "Designed a ML-based iOS app to predict food expiration dates, reducing food waste and minimizing the risk of foodborne illnesses. Recognized as a Congressional App Challenge Winner, American Statistical Association Award Winner, and MIT Solv[ED] Social Entrepreneurship Semifinalist.",
    whatILearned: "I gained experience applying ML to sustainability and public health issues, from data preprocessing to deploying predictive models.",
    technologies: ["ML Algorithms", "NumPy", "Swift/SwiftUI/iOS Dev", "Pandas"],
    link: "https://arxiv.org/abs/2309.02598",
    linkText: "View on Arxiv",
    image: "/project8img1.png",
    images: [
      "/project8img1.png",
      "/project8img2.png",
      "/project8img3.png"
    ]
  },
  {
    id: 1,
    room: "projects",
    plaque: "AI Ad Campaign Manager",
    art: "campaign",
    title: "AI-Powered Performance Campaign Manager",
    category: "AI, Web Dev",
    description: "A web application that enables users to upload advertising campaign data from multiple platforms, analyze performance metrics, perform audience segmentation using ML, generate AI-powered optimization recommendations, and create PDF reports with cross-platform aggregations.",
    whatILearned: "I learned how to build a full-stack application with FastAPI+React to process real-world marketing data, integrate ML for audience segmentation with scikit-learn, leverage OpenAI's API for intelligent recommendations, and create a dashboard that visualizes campaign performance.",
    technologies: ["FastAPI", "React", "Python", "OpenAI API", "Vite"],
    image: "/project1img1.png",
    images: [
      "/project1img1.png"
    ]
  },
];

