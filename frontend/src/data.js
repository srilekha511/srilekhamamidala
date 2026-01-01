// Data file for the website
// This replaces the backend API calls for static hosting

export const profile = {
  firstName: "Srilekha",
  fullName: "Srilekha Mamidala",
  fullRole: "Computer Science, Data Science, and Economics @ MIT",
  bio: "I'm a student at MIT studying Computer Science, Data Science, and Economics. Check out my projects and experience, and feel free to reach out!",
  email: "your.email@example.com",
  headshot: "/headshot.jpg",
  social: {
    github: "https://github.com/srilekha511",
    linkedin: "https://www.linkedin.com/in/srilekha-mamidala/",
  }
};

export const projects = [
  {
    id: 2,
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

