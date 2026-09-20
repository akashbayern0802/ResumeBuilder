import { ResumeData } from '../types/resume';

export const SAMPLE_RESUMES: Record<string, ResumeData> = {
  akash_bhattacharya: {
    id: 'akash-bhattacharya',
    fullName: 'Akash Bhattacharya',
    email: 'akash29647@iitbombay.org',
    phone: '+91 8169243895 / +91 9163392836',
    location: 'Kolkata, India',
    totalExperience: '12+ Years',
    preferredLocations: 'Bengaluru, Mumbai, Pune, Hyderabad, Kolkata, Delhi-NCR',
    title: 'Product / Project Manager | Strategy & Consulting | Banking & Payments',
    linkedin: 'linkedin.com/in/akashbhattacharya',
    summary: 'Achievement-oriented professional with over 12 years of experience targeting leadership assignments as Product/Project Manager, Business Analyst, Strategy & Consulting with organizations of high repute across IT & Consultancy. Proven expertise in digital payments, product lifecycle management, business analysis (CBAP), project management (PMP), enterprise data transformation, and cross-functional agile leadership.',
    skills: [
      {
        id: 'sk-1',
        categoryName: 'Areas of Excellence & Methodologies',
        skills: [
          'Product Management',
          'Product Strategy',
          'Business Analysis',
          'Project Management',
          'Banking & Payments',
          'Business Process Management',
          'Operations Management',
          'Financial Planning & Analysis',
          'Vendor / Contract Management',
          'Agile & Scrum (CSPO)',
          'SAFe 6.0 (PO/PM)',
          'Six Sigma Green Belt'
        ]
      },
      {
        id: 'sk-2',
        categoryName: 'Technical & Analytics Tools',
        skills: [
          'SQL',
          'Tableau',
          'Azure DevOps',
          'JIRA',
          'Visio',
          'SharePoint',
          'Minitab',
          'Vensim',
          'MS Office (Word, Excel, PowerPoint)',
          'Python',
          'R',
          'Java'
        ]
      },
      {
        id: 'sk-3',
        categoryName: 'Domain & Documentation Specialization',
        skills: [
          'SRS / BRD / FSD / RTM',
          'Process Flow & RACI',
          'Efforts Estimation & WSR',
          'POS & Merchant Acquiring',
          'Prepaid Cards & Digital Wallets',
          'UPI & Payment Gateways',
          'NCMC Card Tokenization (NPCI)',
          'Liquidity Risk & Buffers',
          'Delta Lake Migration'
        ]
      }
    ],
    experience: [
      {
        id: 'exp-pwc',
        role: 'Product Manager / Owner',
        company: 'PwC AC',
        location: 'Bangalore / Kolkata',
        startDate: 'Mar 2025',
        endDate: 'Present',
        current: true,
        bullets: [
          'Managing myMetrics, an enterprise analytics product, ensuring maximum adoption and utilization across internal organizational teams and external clients.',
          'Shaping clear product vision and roadmap ensuring business growth and strategic planning are driven by scalable data initiatives.',
          'Leading intellectual capital development for PwC Banking COP, building cutting-edge banking and digital payment solutions.',
          'Led a 35-member agile team on a transformation initiative, successfully migrating enterprise data into Delta Lake and developing interactive reporting dashboards.',
          'Bridging technical and business divides to solve core architectural challenges, including enterprise-wide data transformation pipelines.',
          'Honored with appreciation award for driving product growth and playing a pivotal role as Product Manager for tech transformation initiative (Sep 2025).'
        ]
      },
      {
        id: 'exp-accenture',
        role: 'Product Owner (Client: Natwest Bank)',
        company: 'Accenture Solutions',
        location: 'Bangalore / Kolkata',
        startDate: 'Jul 2021',
        endDate: 'Feb 2025',
        current: false,
        bullets: [
          'Ensured rigorous alignment between international regulatory changes and the core product roadmap for a premier UK-based multinational bank.',
          'Led product solution designing and computed liquidity risk pertaining to rating-based agreements as Lead Business Analyst.',
          'Designed a client product solution that accurately computes liquidity buffers based on historical patterns and shock scenario models.',
          'Served as Payments Subject Matter Expert (SME) to align Accenture solutions and products against global industry benchmarks.',
          'Tracked program performance and delivered KPI benchmark presentations to C-suite and executive audiences.',
          'Led intellectual capital development for Accenture UKI Banking COP through lectures, architecture reviews, and collaborative workshops.',
          'Served as SBU Lead for Consulting and BA resource hiring within Financial Services, driving commercial negotiations and SOW closures.',
          'Received Accenture Ace Award in Dec 2023 for account upscaling in revenue growth, and Employee of the Month (UKI domain in Feb 2023 & Nov 2023).'
        ]
      },
      {
        id: 'exp-yesbank',
        role: 'Vice President / Product Lead - Merchant Acquiring',
        company: 'Yes Bank',
        location: 'Mumbai',
        startDate: 'Feb 2021',
        endDate: 'Jul 2021',
        current: false,
        bullets: [
          'Defined product strategy for POS merchant acquiring portfolio including SMS Pay, EMI, Brand EMI, Cash@POS, and Bharat QR (BQR).',
          'Partnered cross-functionally with Sales & Marketing, Customer Support, Network Engineers, and Settlement/Reconciliation teams.',
          'Tracked product metrics and presented performance dashboards to executive leadership to meet strategic revenue targets.'
        ]
      },
      {
        id: 'exp-icici',
        role: 'Sr Product Manager - Payment Solutions & Wallets',
        company: 'ICICI Bank',
        location: 'Mumbai',
        startDate: 'Apr 2019',
        endDate: 'Jan 2021',
        current: false,
        bullets: [
          'Defined future state for prepaid cards, digital wallets, gift cards, and combo cards by rationalizing and prioritizing client requests.',
          'Designed end-to-end solutions for managing payment gateway, UPI, Netbanking, POS payments, and automatic card reloading.',
          'Collaborated with NPCI for prototyping card tokenization on NCMC platform to support offline transactions on transit solutions.',
          'Liaised with internal bank teams to ensure compliance with RBI regulatory guidelines and internal audit frameworks.',
          'Integrated client vendors (NEC, Honeywell) and coordinated with card schemes (NPCI, VISA) and smart city SPVs.',
          'Scaled UPI-based top-up and mobile app card reloading for stored value NCMC card to 120M INR throughput/month, achieving a 35% usage increase.'
        ]
      },
      {
        id: 'exp-lodha',
        role: 'Product Manager – Palava Smart City & Palava Smart Cards',
        company: 'Lodha Group',
        location: 'Mumbai',
        startDate: 'Feb 2016',
        endDate: 'Apr 2019',
        current: false,
        bullets: [
          'Formulated operations and technology roadmaps for Palava Smart City with IBM and Accelerator Partners; delivered resident portal (mypalava.in), mobile apps, and Intelligent Operations Centre.',
          'Authored complete project documentation including SRS, Process Flows, FTM, Effort Estimations, WSRs, and User Manuals.',
          'Managed Palava Smart Card (semi-closed loop) project with Atos Worldline, Kotak Mahindra Bank & Wow Solutions; managed IPG payments and loyalty rollout.',
          'Directed smart city e-governance CRM initiatives including customer complaints, access control integration with Smart Card, KYC updation, and parking management.',
          'Slashed Smart Card delivery lead time by 80% through process optimization and augmented utility collections by 6% (~INR 2,500,000) via RCA on billing discrepancies.'
        ]
      },
      {
        id: 'exp-cognizant-consulting',
        role: 'Business Analyst (Client: Barclays)',
        company: 'Cognizant Business Consulting',
        location: 'Pune',
        startDate: 'May 2015',
        endDate: 'Feb 2016',
        current: false,
        bullets: [
          'Delivered business requirements analysis, functional specifications, and process re-engineering for Barclays banking operations.'
        ]
      },
      {
        id: 'exp-cognizant-tech',
        role: 'Programmer Analyst (Client: Walgreens)',
        company: 'Cognizant Technology Solutions',
        location: 'Kolkata',
        startDate: 'Aug 2011',
        endDate: 'Apr 2013',
        current: false,
        bullets: [
          'Developed, tested, and optimized enterprise application modules and database procedures for Walgreens retail systems.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-iit',
        degree: 'Master of Management (General Management)',
        institution: 'SJMSOM, IIT Bombay',
        location: 'Mumbai',
        graduationDate: '2015',
        gpa: '7.93 / 10'
      },
      {
        id: 'edu-btech',
        degree: 'B.Tech. in Electronics',
        institution: 'B.P. Poddar Institute of Management & Technology',
        location: 'Kolkata',
        graduationDate: '2011',
        gpa: '8.14 / 10'
      }
    ],
    projects: [
      {
        id: 'proj-cop',
        name: 'Banking Community of Practice (CoP) & Delta Lake Migration',
        description: 'Large-scale enterprise banking and data transformation initiative.',
        technologies: ['Delta Lake', 'SQL', 'Tableau', 'Azure DevOps', 'Agile'],
        bullets: [
          'Spearheaded the migration of distributed banking analytics pipelines into Delta Lake, enabling sub-second real-time executive dashboard generation.'
        ]
      }
    ],
    certifications: [
      'Certified International Payment System Professional (CIPSP) by MVLCO',
      'Certified Business Analysis Professional (CBAP) by IIBA',
      'Project Management Professional (PMP) by PMI',
      'Scrum Product Owner (CSPO) by Scrum Alliance',
      'ITIL v3.0 Foundation in IT Service Management',
      'Certified SAFe 6.0 Product Owner/Product Manager by Scaled Agile',
      'Certified Six Sigma Exemplar Global Green Belt'
    ]
  },
  software_engineer: {
    id: 'sample-se-1',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA (Open to Remote)',
    title: 'Senior Full Stack Software Engineer',
    website: 'https://alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan-dev',
    github: 'github.com/alexmorgan',
    summary: 'Results-driven Senior Full Stack Engineer with 6+ years of experience designing, scaling, and deploying distributed web applications and cloud architectures. Proven track record of boosting system performance by 40% and leading cross-functional teams to deliver enterprise-grade SaaS platforms using TypeScript, React, Node.js, and AWS.',
    skills: [
      {
        id: 'sk-1',
        categoryName: 'Languages & Frameworks',
        skills: ['TypeScript', 'JavaScript (ES6+)', 'React', 'Next.js', 'Node.js', 'Python', 'GraphQL', 'Tailwind CSS']
      },
      {
        id: 'sk-2',
        categoryName: 'Cloud & DevOps',
        skills: ['AWS (ECS, Lambda, S3)', 'Docker', 'Kubernetes', 'CI/CD (GitHub Actions)', 'Terraform', 'PostgreSQL', 'Redis']
      }
    ],
    experience: [
      {
        id: 'exp-1',
        role: 'Senior Full Stack Engineer',
        company: 'CloudScale Technologies',
        location: 'San Francisco, CA',
        startDate: '2022-03',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and led the migration of a monolithic API into 12 microservices using Node.js and TypeScript, reducing p99 latency by 42% for 2M+ daily active users.',
          'Built responsive web interfaces with React and Next.js, improving Core Web Vitals and boosting user conversion rates by 28%.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        graduationDate: '2019-05'
      }
    ],
    projects: []
  }
};

export const SAMPLE_JOB_DESCRIPTIONS: Record<string, { title: string; company: string; text: string }> = {
  director_fintech_product: {
    title: 'Director / Lead Product Manager – Digital Banking & Payments',
    company: 'Global FinTech Capital',
    text: `Role: Director / Lead Product Manager – Digital Banking & Payments
Company: Global FinTech Capital
Location: Bengaluru / Mumbai / Remote

About the Role:
We are seeking an accomplished Senior/Lead Product Manager with deep expertise in digital banking, payments, and enterprise product management to drive our core merchant acquiring, UPI, and digital cards platform.

Key Responsibilities:
• Define product strategy, vision, and multi-year product roadmap for next-generation payment systems and banking solutions.
• Lead cross-functional agile teams (engineering, business analysts, UI/UX, operations, and compliance) to deliver high-throughput financial products.
• Drive business analysis and requirements engineering: BRD, FSD, SRS, RTM, process flow diagrams, and user story backlogs.
• Oversee merchant acquiring channels, POS solutions, UPI integrations, wallet solutions, and card tokenization (NCMC/EMV).
• Partner with banking schemes and regulatory bodies (RBI, NPCI, card networks) ensuring adherence to security and compliance frameworks.
• Manage product P&L, commercial negotiations, client vendor management, and SOW alignment with executive stakeholders.
• Drive data-backed product decisions utilizing SQL, Tableau, Azure DevOps, and Jira.

Required Qualifications & Experience:
• 10+ years of product management / business analysis experience in Banking, FinTech, or Strategy Consulting.
• Proven track record launching payment gateways, digital wallets, cards, or transaction banking platforms.
• Strong credentials in Agile/Scrum (CSPO / SAFe POPM) and professional certifications (CBAP / PMP / Six Sigma).
• MBA or Master's degree from a premier institute (IIT/IIM/equivalents) preferred.
• Exceptional leadership, stakeholder management, and executive presentation capabilities.`
  },
  senior_fullstack_cloud: {
    title: 'Senior Full Stack Cloud Engineer',
    company: 'NextGen Financial Systems',
    text: `Job Title: Senior Full Stack Cloud Engineer
Company: NextGen Financial Systems
Location: Remote / San Francisco, CA

About the Role:
We are looking for an experienced Senior Full Stack Cloud Engineer to lead the modernization of our core high-throughput transaction platform.

Key Responsibilities:
• Architect, implement, and maintain scalable microservices utilizing Node.js, TypeScript, and Go.
• Build modern, accessible, high-performance web frontends using React, Next.js, and Tailwind CSS.
• Deploy, monitor, and automate resilient cloud infrastructure using AWS (ECS, Lambda, CloudWatch), Terraform, and Docker.
• Ensure low latency and high availability with PostgreSQL, Redis caching, and Kafka event streaming.
• Collaborate with cross-functional product and security teams in an Agile environment.`
  },
  ml_rag_engineer: {
    title: 'Staff AI / RAG Systems Engineer',
    company: 'Cognitive Nexus',
    text: `Role: Staff AI / RAG Systems Engineer
Company: Cognitive Nexus
Location: San Francisco, CA (Hybrid / Remote)

Responsibilities:
• Architect, evaluate, and scale production RAG pipelines utilizing hybrid dense/sparse vector search, knowledge graphs, and semantic rerankers.
• Fine-tune open-source models (Llama, Mistral, Qwen) using parameter-efficient fine-tuning (PEFT/LoRA) and quantization techniques.
• Build low-latency model serving endpoints using FastAPI, vLLM, and Triton Inference Server.`
  }
};
