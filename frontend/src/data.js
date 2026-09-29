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

export const interests = [
  "AI & machine learning",
  "NLP & LLM evaluation research",
  "Venture capital & startups",
  "Quantitative finance & economics",
];

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
    id: "medialab", room: "research", plaque: "MIT Media Lab", art: "memoryLoop", company: "MIT Media Lab", role: "Research Intern",
    location: "", dates: "September 2026 – Present",
    bullets: [
      "Investigating self-confirming inference in persistent LLM memory by instrumenting an open-source memory system to trace preference updates to interaction evidence and distinguish user beliefs from preferences reinforced by agent interactions",
      "Measuring inference provenance with multi-turn interactions and validating automated classifications vs. hand-labeled traces",
    ],
  },
  {
    id: "mitecon", room: "research", plaque: "MIT Economics", art: "phoneWellbeing", company: "MIT Department of Economics", role: "Research Intern",
    location: "Cambridge, MA", dates: "June 2026 – Present",
    bullets: [
      "Developed and evaluated technical infrastructure for a large-scale RCT studying smartphone use and adolescent well-being",
      "Analyzed Android application and Django backend logs to diagnose missing/incomplete smartphone usage records",
    ],
  },
  {
    id: "csail", room: "research", plaque: "MIT CSAIL", art: "ratingRobot", company: "MIT CSAIL, Decentralized Information Group", role: "Research Intern",
    location: "Cambridge, MA", dates: "August 2024 – Present",
    bullets: [
      "Accelerated insurance communication services by >60% by researching development of mathematical metrics for subjective quality evaluation across 10+ large language models (LLMs) in coordination with industry partner Liberty Mutual",
      "Designed parallel human/LLM judge studies via 300+ human ratings to create auto-evaluation metrics for Agentic AI models",
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
    id: 2,
    room: "projects",
    plaque: "Insurance Chatbot",
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
    id: 3,
    room: "research",
    plaque: "LLM Formality Study",
    art: "formality",
    title: "An Empirical Evaluation of LLMs for the Assessment of Subjective Qualities",
    category: "ML/NLP Research",
    description: "Research done at the Decentralized Information Group, part of MIT's Computer Science and Artificial Intelligence Lab. Designed a framework involving human and LLM evaluation to assess subjective qualities, with this paper's specific focus being formality in professional communication.",
    whatILearned: "This project taught me how to design effective user studies to evaluate both humans and LLMs in the context of formality and perform statistical analyses comparing human and LLM alignment on ground truth metrics.",
    technologies: ["NLP", "ML", "Human-Computer Interaction (HCI)"],
    image: "/project3img1.png",
    images: [
      "/project3img1.png"
    ]
  },
  {
    id: 4,
    room: "research",
    plaque: "Election Law Graphs",
    art: "election",
    title: "Web Scraping of Legislative Election Data for Knowledge Graph Analysis",
    category: "ML/NLP Research",
    description: "Research done at the MIT Election Data Science Lab. Built a data pipeline to transform unstructured election legislation into knowledge graphs and classified bills to study how lawmakers and interest groups influence election policy outcomes.",
    whatILearned: "This project helped me gain hands-on experience turning messy political text data into structured, analyzable formats using Python and R, and applying data analysis to answer real-world policy questions.",
    technologies: ["Data Processing", "Web Scraping", "Python", "R"],
    link: "https://github.com/jloffredo2/state-elect-leg-scrapers",
    image: "/project4img1.png",
    images: [
      "/project4img1.png"
    ]
  },
  {
    id: 5,
    room: "projects",
    plaque: "dermalab",
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
    plaque: "WhartonMunicode",
    art: "legal",
    title: "WhartonMunicode: LLMs for Legal Code Analysis",
    category: "ML, NLP Research",
    description: "Built a nanoGPT-based language model trained on thousands of municipal codes to explore how LLMs can support legal research and analysis in the public law domain.",
    whatILearned: "I learned the computational foundations of large language models and how to adapt and train them on domain-specific legal text for real-world applications.",
    technologies: ["Hugging Face Transformers", "PyTorch", "Web Scraping", "NLP"],
    link: "https://github.com/srilekha511/WhartonMunicode",
    linkText: "View on GitHub",
    image: "/project9img1.png",
    images: [
      "/project9img1.png",
    ]
  },
  {
    id: 6,
    room: "research",
    plaque: "Dementia Risk ML",
    art: "brainNetwork",
    title: "A Holistic, Personalized Dementia Risk Prediction Framework",
    category: "ML Research",
    description: "Developed a personalized dementia risk prediction model by integrating ML awith network theory to capture complex lifestyle, environmental, and genetic interactions. Awarded a $2500 prize from the Association for Computing Machinery.",
    whatILearned: "I gained research experience combining ML methods to model how different types of environmental, genetic, and lifestyle mechanisms and translate biological networks into predictive insights.",
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
    plaque: "NeuroCADR",
    art: "drugRepurposing",
    title: "NeuroCADR: Computational Drug Repurposing for Epilepsy",
    category: "Computational Biology Research",
    description: "Built an integrated computational pipeline to identify and prioritize novel anti-epileptic drug candidates through data-driven drug repurposing. Awarded 1st Place in the Mathematics and Computer Science Category at the National Junior Science and Humanities Symposium in Albuquerque, New Mexico.",
    whatILearned: "I learned how to combine biological data and preprocess it to use ML algorithms effectively.",
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
    plaque: "Food Shelf Life",
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
    plaque: "Campaign AI",
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

