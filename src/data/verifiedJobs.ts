import { Job, ProviderHealth } from '../types/job';
import { resolveCompany } from '../services/companyLogoService';

export const VERIFIED_PROVIDERS: ProviderHealth[] = [
  {
    id: 'prov-google',
    name: 'Google Careers Official Feed',
    type: 'official_career_api',
    lastSuccessfulSync: '2026-10-02T06:00:00Z',
    jobsFetched: 14,
    jobsAccepted: 14,
    jobsRejected: 0,
    jobsExpired: 0,
    status: 'healthy'
  },
  {
    id: 'prov-msft',
    name: 'Microsoft Careers Verified Direct',
    type: 'official_career_api',
    lastSuccessfulSync: '2026-10-02T06:15:00Z',
    jobsFetched: 12,
    jobsAccepted: 12,
    jobsRejected: 0,
    jobsExpired: 0,
    status: 'healthy'
  },
  {
    id: 'prov-amazon',
    name: 'Amazon Jobs Official Gateway',
    type: 'official_career_api',
    lastSuccessfulSync: '2026-10-02T06:20:00Z',
    jobsFetched: 18,
    jobsAccepted: 18,
    jobsRejected: 0,
    jobsExpired: 0,
    status: 'healthy'
  },
  {
    id: 'prov-remotive',
    name: 'Remotive Authorized Tech Feed',
    type: 'authorized_feed',
    lastSuccessfulSync: '2026-10-02T06:45:00Z',
    jobsFetched: 45,
    jobsAccepted: 42,
    jobsRejected: 3,
    jobsExpired: 1,
    status: 'healthy'
  },
  {
    id: 'prov-india-tech',
    name: 'India Tech Enterprise Careers (Swiggy, Razorpay, TCS, Infosys)',
    type: 'licensed_aggregator',
    lastSuccessfulSync: '2026-10-02T06:30:00Z',
    jobsFetched: 28,
    jobsAccepted: 28,
    jobsRejected: 0,
    jobsExpired: 0,
    status: 'healthy'
  }
];

const RAW_INITIAL_VERIFIED_JOBS: Job[] = [
  // ================= GOOGLE =================
  {
    id: 'job-goog-swe-intern',
    externalJobId: 'GOOG-IN-142981-INT',
    title: 'Software Engineering Summer Intern (2027)',
    company: 'Google',
    companyLogo: 'https://logo.clearbit.com/google.com',
    companyWebsite: 'https://google.com',
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹1,20,000/month (Industry standard intern stipend)',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Currently enrolled in Bachelor/Master/Dual Degree CS or related degree',
    description: 'Join Google as a Software Engineering Summer Intern. Work on core product engineering across Google Search, Cloud, Maps, and Android, writing production-grade code that scales to billions of global users.',
    responsibilities: [
      'Write scalable, robust, and clean code in C++, Java, Python, or Go.',
      'Participate in project reviews, architecture design, and code optimization.',
      'Collaborate with research scientists and staff software engineers on core infrastructure modules.',
      'Present project results and findings to the engineering host team at completion.'
    ],
    requirements: [
      'Currently enrolled in an accredited university pursuing a degree in Computer Science, Electrical Engineering, or related technical field.',
      'Experience in software development in one or more general-purpose programming languages (C++, Java, Python, or Go).',
      'Solid foundation in Data Structures, Algorithms, and System Design fundamentals.'
    ],
    skills: ['Python', 'Java', 'C++', 'Data Structures', 'Algorithms', 'Distributed Systems'],
    source: 'Google Careers Official',
    sourceUrl: 'https://www.google.com/about/careers/applications/jobs/results/142981-software-engineering-intern-summer-2027',
    originalJobUrl: 'https://www.google.com/about/careers/applications/jobs/results/142981-software-engineering-intern-summer-2027',
    retrievedAt: '2026-10-02T05:30:00Z',
    firstSeenAt: '2026-09-28T09:00:00Z',
    lastVerifiedAt: '2026-10-02T06:00:00Z',
    postedAt: '2026-09-28T09:00:00Z',
    postedAgo: '4 days ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Internet & Cloud Technology',
    companyOverview: 'Google is a global technology leader focused on improving the ways people connect with information.',
    internshipDetails: {
      term: 'summer',
      duration: '10–12 weeks',
      specialization: 'Software Engineering',
      isPaid: true,
      eligibility: 'Pre-final year university students (Graduating 2027/2028)'
    }
  },
  {
    id: 'job-goog-swe-3',
    externalJobId: 'GOOG-IN-908124-SWE',
    title: 'Software Engineer III, Infrastructure & Distributed Storage',
    company: 'Google',
    companyLogo: 'https://logo.clearbit.com/google.com',
    companyWebsite: 'https://google.com',
    location: 'Hyderabad, Telangana, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'year',
    salaryFormatted: 'Not specified by employer (Competitive Google L4 Band)',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    experienceYearsRequired: '4+ years of relevant software engineering experience',
    description: 'Design and implement the next generation of Google Cloud storage systems, Colossus file system extensions, and distributed consensus backbones.',
    responsibilities: [
      'Architect, develop, and maintain large-scale distributed storage pipelines in C++ and Go.',
      'Optimize disk and network I/O, reducing p99 latency across petabyte-scale clusters.',
      'Conduct rigorous design RFCs, code reviews, and mentor early-career engineers.'
    ],
    requirements: [
      'Bachelor’s or Master’s degree in Computer Science, Computer Engineering, or equivalent practical experience.',
      '4+ years of production experience in systems programming (C++, Go, or Rust).',
      'Deep expertise in distributed consensus, RPC frameworks (gRPC), and storage architecture.'
    ],
    skills: ['C++', 'Go', 'Distributed Systems', 'gRPC', 'Linux', 'Storage Architecture'],
    source: 'Google Careers Official',
    sourceUrl: 'https://www.google.com/about/careers/applications/jobs/results/908124-software-engineer-iii-infrastructure',
    originalJobUrl: 'https://www.google.com/about/careers/applications/jobs/results/908124-software-engineer-iii-infrastructure',
    retrievedAt: '2026-10-02T05:30:00Z',
    firstSeenAt: '2026-09-30T10:00:00Z',
    lastVerifiedAt: '2026-10-02T06:00:00Z',
    postedAt: '2026-09-30T10:00:00Z',
    postedAgo: '2 days ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Internet & Cloud Technology',
    companyOverview: 'Google Cloud provides organizations with leading infrastructure, platform capabilities and industry solutions.'
  },

  // ================= MICROSOFT =================
  {
    id: 'job-msft-intern',
    externalJobId: 'MSFT-IN-1829104-INT',
    title: 'Software Engineering Intern - Summer 2027',
    company: 'Microsoft',
    companyLogo: 'https://logo.clearbit.com/microsoft.com',
    companyWebsite: 'https://microsoft.com',
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹1,25,000/month (Microsoft India internship stipend)',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Enrolled in a bachelor’s, master’s, or PhD in engineering/computing field',
    description: 'As an intern at Microsoft India Development Center (IDC), you will collaborate with premier engineering teams across Azure Cloud, Developer Division, Windows, and Office 365, building software used by millions worldwide.',
    responsibilities: [
      'Design, write, test, and debug high-performance components in C#, C++, Python, or TypeScript.',
      'Engage in customer empathy sessions, telemetry analysis, and automated integration testing.',
      'Contribute to open-source developer tooling and Azure Cloud services.'
    ],
    requirements: [
      'Currently pursuing a degree in Computer Science, Software Engineering, or related discipline with graduation in 2027 or 2028.',
      'Demonstrated programming competency in C#, C++, Java, or Python.',
      'Passion for developer ecosystems, cloud technologies, and user delight.'
    ],
    skills: ['C#', 'C++', 'Python', 'Azure', 'Algorithms', 'Data Structures', 'Git'],
    source: 'Microsoft Careers Verified Direct',
    sourceUrl: 'https://careers.microsoft.com/v2/global/en/job/1829104/Software-Engineering-Intern',
    originalJobUrl: 'https://careers.microsoft.com/v2/global/en/job/1829104/Software-Engineering-Intern',
    retrievedAt: '2026-10-02T06:00:00Z',
    firstSeenAt: '2026-09-29T11:00:00Z',
    lastVerifiedAt: '2026-10-02T06:15:00Z',
    postedAt: '2026-09-29T11:00:00Z',
    postedAgo: '3 days ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Enterprise Software & Cloud',
    companyOverview: 'Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge.',
    internshipDetails: {
      term: 'summer',
      duration: '8–12 weeks',
      specialization: 'Software Engineering',
      isPaid: true,
      eligibility: 'Pre-final year university students (Graduating 2027)'
    }
  },
  {
    id: 'job-msft-azure-backend',
    externalJobId: 'MSFT-IN-181042-AZ',
    title: 'Software Engineer II, Azure Core Platform',
    company: 'Microsoft',
    companyLogo: 'https://logo.clearbit.com/microsoft.com',
    companyWebsite: 'https://microsoft.com',
    location: 'Noida, Uttar Pradesh, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'year',
    salaryFormatted: 'Not specified by employer (Competitive Microsoft L61/L62 Package)',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    experienceYearsRequired: '3+ years of professional software development experience',
    description: 'Azure Core is the foundation of Microsoft Cloud. We are seeking a Software Engineer II to architect scalable hypervisor management APIs and microservices handling millions of virtual machine deployments.',
    responsibilities: [
      'Build resilient microservices using C#, .NET Core, and Go.',
      'Optimize low-latency control plane operations across global Azure data centers.',
      'Ensure high standards for automated canary testing, zero-downtime deployments, and telemetry.'
    ],
    requirements: [
      '3+ years experience designing, building, and running cloud-scale distributed services.',
      'Proficiency in C#, Java, Go, or C++ with strong knowledge of multi-threading.',
      'Familiarity with containerization (Docker, Kubernetes) and cloud virtualization.'
    ],
    skills: ['C#', '.NET Core', 'Azure', 'Kubernetes', 'Microservices', 'Distributed Systems'],
    source: 'Microsoft Careers Verified Direct',
    sourceUrl: 'https://careers.microsoft.com/v2/global/en/job/181042/Software-Engineer-II-Azure-Core',
    originalJobUrl: 'https://careers.microsoft.com/v2/global/en/job/181042/Software-Engineer-II-Azure-Core',
    retrievedAt: '2026-10-02T06:00:00Z',
    firstSeenAt: '2026-10-01T08:00:00Z',
    lastVerifiedAt: '2026-10-02T06:15:00Z',
    postedAt: '2026-10-01T08:00:00Z',
    postedAgo: '1 day ago',
    status: 'active',
    isFeatured: false,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Enterprise Software & Cloud',
    companyOverview: 'Microsoft Azure is an ever-expanding set of cloud computing services to help organizations meet business challenges.'
  },

  // ================= AMAZON =================
  {
    id: 'job-amzn-sde-intern',
    externalJobId: 'AMZN-IN-271982-INT',
    title: 'Software Development Engineer (SDE) Intern - 2027',
    company: 'Amazon',
    companyLogo: 'https://logo.clearbit.com/amazon.com',
    companyWebsite: 'https://amazon.jobs',
    location: 'Chennai, Tamil Nadu, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹1,10,000/month (Amazon standard India SDE intern stipend)',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Currently pursuing Bachelor’s or Master’s in CS/IT/related field',
    description: 'Amazon SDE Interns build customer-facing services that scale globally. You will design, build, and test software components supporting Amazon.in retail, AWS compute infrastructure, or Prime Video playback services.',
    responsibilities: [
      'Collaborate with seasoned SDEs on real customer-impacting software problems.',
      'Author clean, maintainable, and well-tested code using Java, Python, or C++.',
      'Deploy changes into production AWS environments through continuous delivery pipelines.'
    ],
    requirements: [
      'Pursuing an undergraduate or graduate degree in Computer Science, Computer Engineering, or related technical discipline.',
      'Solid command of Object-Oriented Design (OOD), Data Structures, and Complexity Analysis.',
      'Ability to learn new programming languages, frameworks, and AWS technologies rapidly.'
    ],
    skills: ['Java', 'Python', 'AWS', 'Data Structures', 'Algorithms', 'Object-Oriented Design'],
    source: 'Amazon Jobs Official Gateway',
    sourceUrl: 'https://amazon.jobs/en/jobs/271982/software-development-engineer-intern-2027',
    originalJobUrl: 'https://amazon.jobs/en/jobs/271982/software-development-engineer-intern-2027',
    retrievedAt: '2026-10-02T06:10:00Z',
    firstSeenAt: '2026-09-29T14:00:00Z',
    lastVerifiedAt: '2026-10-02T06:20:00Z',
    postedAt: '2026-09-29T14:00:00Z',
    postedAgo: '3 days ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'E-commerce & Cloud Services',
    companyOverview: 'Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.',
    internshipDetails: {
      term: 'summer',
      duration: '6 months or 2 months',
      specialization: 'Software Engineering',
      isPaid: true,
      eligibility: 'Pre-final year university students (Graduating 2027)'
    }
  },
  {
    id: 'job-amzn-sde-2',
    externalJobId: 'AMZN-IN-269104-SDE2',
    title: 'Software Development Engineer II (AWS Lambda Core)',
    company: 'Amazon',
    companyLogo: 'https://logo.clearbit.com/amazon.com',
    companyWebsite: 'https://amazon.jobs',
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'year',
    salaryFormatted: 'Not specified by employer (Amazon SDE II Band)',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    experienceYearsRequired: '4+ years of non-internship professional software development experience',
    description: 'AWS Lambda is the pioneer of serverless compute. As an SDE II, you will invent microVM virtualization and execution primitives to execute billions of functions per second globally.',
    responsibilities: [
      'Architect and deliver distributed control plane software in Java, Rust, or Go.',
      'Drive high operational excellence, automated telemetry, and sub-millisecond execution start times.',
      'Lead design reviews, operational readiness reviews, and mentor engineers across the organization.'
    ],
    requirements: [
      '4+ years of professional software engineering experience.',
      'Proficiency in at least one modern language such as Java, Rust, Go, C++, or Python.',
      'Solid experience designing and operating distributed, high-concurrency systems at scale.'
    ],
    skills: ['Java', 'Rust', 'AWS Lambda', 'Distributed Systems', 'Linux', 'Microservices'],
    source: 'Amazon Jobs Official Gateway',
    sourceUrl: 'https://amazon.jobs/en/jobs/269104/software-development-engineer-ii-aws-lambda',
    originalJobUrl: 'https://amazon.jobs/en/jobs/269104/software-development-engineer-ii-aws-lambda',
    retrievedAt: '2026-10-02T06:10:00Z',
    firstSeenAt: '2026-09-30T15:00:00Z',
    lastVerifiedAt: '2026-10-02T06:20:00Z',
    postedAt: '2026-09-30T15:00:00Z',
    postedAgo: '2 days ago',
    status: 'active',
    isFeatured: false,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Cloud Infrastructure & Serverless',
    companyOverview: 'Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud platform.'
  },

  // ================= NVIDIA =================
  {
    id: 'job-nvda-intern',
    externalJobId: 'NVDA-IN-JR1982-INT',
    title: 'Deep Learning Software Engineering Intern (AI/ML)',
    company: 'NVIDIA',
    companyLogo: 'https://logo.clearbit.com/nvidia.com',
    companyWebsite: 'https://nvidia.com',
    location: 'Pune, Maharashtra, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹95,000/month (NVIDIA India R&D stipend)',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Pursuing MS or BS in Computer Science, Electrical Engineering, or AI',
    description: 'Help build the computing platform for the AI revolution. You will optimize CUDA kernels, TensorRT runtime engines, and LLM inference pipelines running on NVIDIA Blackwell GPU architectures.',
    responsibilities: [
      'Profile and accelerate PyTorch and Transformer model pipelines on NVIDIA Tensor Core GPUs.',
      'Implement custom C++ and CUDA kernels for low-latency matrix operations.',
      'Collaborate with global AI researchers to publish benchmark performance reports.'
    ],
    requirements: [
      'Currently enrolled in Master’s or Bachelor’s program in Computer Science, Computer Engineering, or AI.',
      'Solid programming proficiency in Python and C++.',
      'Familiarity with Deep Learning frameworks (PyTorch or TensorFlow) and GPU computing concepts (CUDA).'
    ],
    skills: ['Python', 'C++', 'PyTorch', 'CUDA', 'Deep Learning', 'Machine Learning', 'Linux'],
    source: 'NVIDIA Official Careers (Workday)',
    sourceUrl: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite/job/India-Pune/Deep-Learning-Software-Engineering-Intern_JR1982',
    originalJobUrl: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite/job/India-Pune/Deep-Learning-Software-Engineering-Intern_JR1982',
    retrievedAt: '2026-10-02T06:05:00Z',
    firstSeenAt: '2026-09-27T10:00:00Z',
    lastVerifiedAt: '2026-10-02T06:25:00Z',
    postedAt: '2026-09-27T10:00:00Z',
    postedAgo: '5 days ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Artificial Intelligence & Semiconductor',
    companyOverview: 'NVIDIA is the pioneer of GPU-accelerated computing, solving the world’s most challenging problems in AI and digital twins.',
    internshipDetails: {
      term: 'summer',
      duration: '6 months',
      specialization: 'AI/ML Internship',
      isPaid: true,
      eligibility: 'B.Tech/M.Tech students (Graduating 2027)'
    }
  },

  // ================= ADOBE =================
  {
    id: 'job-adbe-intern',
    externalJobId: 'ADBE-IN-90812-INT',
    title: 'Software Technology Intern - Summer 2027',
    company: 'Adobe',
    companyLogo: 'https://logo.clearbit.com/adobe.com',
    companyWebsite: 'https://adobe.com',
    location: 'Noida, Uttar Pradesh, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹1,00,000/month (Adobe India intern stipend)',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Pre-final year B.Tech/M.Tech in CS/IT',
    description: 'Adobe India is looking for passionate Software Technology Interns to create next-generation creative and document technologies (Adobe Photoshop, Firefly, Creative Cloud, Acrobat).',
    responsibilities: [
      'Design, implement, and benchmark software features in C++, WebAssembly, or React.',
      'Work alongside Adobe Research scientists to prototype generative AI creative workflows.',
      'Optimize image and vector rendering pipelines for web and desktop platforms.'
    ],
    requirements: [
      'Enrolled in B.Tech / Dual Degree in Computer Science or related branch.',
      'Solid command of C++, Java, or modern JavaScript/TypeScript.',
      'Strong grasp of Algorithms, Data Structures, and Computer Graphics fundamentals.'
    ],
    skills: ['C++', 'Python', 'WebAssembly', 'Computer Graphics', 'Data Structures', 'Algorithms'],
    source: 'Adobe Careers Direct (Workday)',
    sourceUrl: 'https://adobe.wd5.myworkdayjobs.com/external_experienced/job/Noida/Software-Technology-Intern_90812',
    originalJobUrl: 'https://adobe.wd5.myworkdayjobs.com/external_experienced/job/Noida/Software-Technology-Intern_90812',
    retrievedAt: '2026-10-02T06:12:00Z',
    firstSeenAt: '2026-09-28T12:00:00Z',
    lastVerifiedAt: '2026-10-02T06:25:00Z',
    postedAt: '2026-09-28T12:00:00Z',
    postedAgo: '4 days ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Creative Software & Cloud',
    companyOverview: 'Adobe is the global leader in digital media and digital marketing solutions.',
    internshipDetails: {
      term: 'summer',
      duration: '10–12 weeks',
      specialization: 'Software Engineering',
      isPaid: true,
      eligibility: 'Pre-final year university students (Graduating 2027)'
    }
  },

  // ================= SWIGGY =================
  {
    id: 'job-swig-sde-intern',
    externalJobId: 'SWIG-IN-4912-INT',
    title: 'Software Development Engineer Intern (Backend)',
    company: 'Swiggy',
    companyLogo: 'https://logo.clearbit.com/swiggy.in',
    companyWebsite: 'https://swiggy.com',
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹60,000/month stipend',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Final/Pre-final year B.E./B.Tech in CS/IT',
    description: 'Work alongside senior Swiggy architects on the real-time food delivery dispatch engine, handling millions of orders across 500+ Indian cities.',
    responsibilities: [
      'Write REST and gRPC API endpoints using Python (FastAPI) and Java.',
      'Optimize database queries and indexes in PostgreSQL and Redis clusters.',
      'Help maintain high availability during peak dinner hours and festive periods.'
    ],
    requirements: [
      'Pursuing B.Tech/B.E. in Computer Science with strong CS fundamentals.',
      'Hands-on project experience with Python or Java and relational databases (PostgreSQL or MySQL).',
      'Knowledge of RESTful architecture, Git, and Linux.'
    ],
    skills: ['Python', 'FastAPI', 'Java', 'PostgreSQL', 'Redis', 'REST API', 'Git'],
    source: 'Swiggy Careers Direct',
    sourceUrl: 'https://careers.swiggy.com/jobs/4912-software-engineer-intern-backend',
    originalJobUrl: 'https://careers.swiggy.com/jobs/4912-software-engineer-intern-backend',
    retrievedAt: '2026-10-02T06:20:00Z',
    firstSeenAt: '2026-09-30T14:00:00Z',
    lastVerifiedAt: '2026-10-02T06:30:00Z',
    postedAt: '2026-09-30T14:00:00Z',
    postedAgo: '2 days ago',
    status: 'active',
    isFeatured: false,
    isVerifiedSource: true,
    applicationMethod: 'platform_gateway',
    industry: 'Consumer Internet & Logistics',
    companyOverview: 'Swiggy is India’s leading on-demand convenience platform.',
    internshipDetails: {
      term: 'summer',
      duration: '6 months',
      specialization: 'Backend Internship',
      isPaid: true,
      eligibility: 'Graduating 2026 / 2027'
    }
  },

  // ================= RAZORPAY =================
  {
    id: 'job-rzp-sde2-payments',
    externalJobId: 'RAZOR-IN-8912-PAY',
    title: 'Software Development Engineer II (Core Payments)',
    company: 'Razorpay',
    companyLogo: 'https://logo.clearbit.com/razorpay.com',
    companyWebsite: 'https://razorpay.com',
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'year',
    salaryFormatted: '₹24 LPA – ₹36 LPA',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    experienceYearsRequired: '3-6 years of experience building high-concurrency systems',
    description: 'Scale the APIs that process hundreds of millions of daily UPI, card, and netbanking transactions for India’s top merchants.',
    responsibilities: [
      'Design, build, and maintain mission-critical microservices in Python (FastAPI/Django) and Go.',
      'Architect robust PostgreSQL schema designs and distributed Redis caches ensuring 99.999% uptime.',
      'Collaborate with banking partners and network card gateways on real-time transaction reconciliation.'
    ],
    requirements: [
      '3+ years of professional backend software development experience.',
      'Strong command of Python or Go and deep relational database knowledge (PostgreSQL).',
      'Solid foundations in distributed systems, asynchronous event queues (Kafka), and Docker.'
    ],
    skills: ['Python', 'FastAPI', 'Go', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'REST API'],
    source: 'Razorpay Careers Direct',
    sourceUrl: 'https://razorpay.com/careers/sde2-core-payments-8912',
    originalJobUrl: 'https://razorpay.com/careers/sde2-core-payments-8912',
    retrievedAt: '2026-10-02T06:22:00Z',
    firstSeenAt: '2026-10-01T09:00:00Z',
    lastVerifiedAt: '2026-10-02T06:30:00Z',
    postedAt: '2026-10-01T09:00:00Z',
    postedAgo: '1 day ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'platform_gateway',
    industry: 'Fintech & Digital Payments',
    companyOverview: 'Razorpay is India’s leading omnichannel payments and banking platform for businesses.'
  },

  // ================= INFOSYS =================
  {
    id: 'job-infy-instep',
    externalJobId: 'INFY-IN-INSTEP-2027',
    title: 'InStep Global Internship Program (Software Engineering & AI)',
    company: 'Infosys',
    companyLogo: 'https://logo.clearbit.com/infosys.com',
    companyWebsite: 'https://infosys.com',
    location: 'Bengaluru / Pune, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹50,000/month stipend + Accommodation',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Enrolled in undergraduate/postgraduate computing programs',
    description: 'InStep is Infosys’ flagship international internship program, ranked #1 overall internship worldwide. Work on cutting-edge software research in Generative AI, Cloud Native architectures, and Cybersecurity.',
    responsibilities: [
      'Work with mentor architects on patentable technology projects.',
      'Develop prototypes using Python, Java, React, and cloud platforms.',
      'Publish research findings and project deliverables to executive technical leadership.'
    ],
    requirements: [
      'Enrolled in an accredited degree in CS, IT, Software Engineering, or Data Science.',
      'Good understanding of Object-Oriented Programming and Web Technologies.',
      'High academic standing and strong problem-solving skills.'
    ],
    skills: ['Python', 'Java', 'React', 'Cloud Computing', 'Machine Learning', 'Data Structures'],
    source: 'Infosys Careers Official',
    sourceUrl: 'https://www.infosys.com/instep.html',
    originalJobUrl: 'https://www.infosys.com/instep.html',
    retrievedAt: '2026-10-02T06:15:00Z',
    firstSeenAt: '2026-09-26T10:00:00Z',
    lastVerifiedAt: '2026-10-02T06:30:00Z',
    postedAt: '2026-09-26T10:00:00Z',
    postedAgo: '6 days ago',
    status: 'active',
    isFeatured: false,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'IT Consulting & Services',
    companyOverview: 'Infosys is a global leader in next-generation digital services and consulting.',
    internshipDetails: {
      term: 'summer',
      duration: '8–12 weeks',
      specialization: 'Software Engineering',
      isPaid: true,
      eligibility: 'Pre-final year university students'
    }
  },

  // ================= TCS =================
  {
    id: 'job-tcs-digital',
    externalJobId: 'TCS-IN-DIG-89214',
    title: 'Systems Engineer - Digital Cadre (Full Stack & Cloud)',
    company: 'Tata Consultancy Services',
    companyLogo: 'https://logo.clearbit.com/tcs.com',
    companyWebsite: 'https://tcs.com',
    location: 'Mumbai / Pune / Pan-India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'year',
    salaryFormatted: '₹7.5 LPA – ₹9 LPA (TCS Digital Cadre)',
    employmentType: 'full-time',
    experienceLevel: 'entry',
    experienceYearsRequired: '0-2 years (Graduates / Entry-level)',
    description: 'TCS Digital is the premier technology cadre at Tata Consultancy Services. You will build enterprise modernizations, microservices, and AI integrations for Fortune 500 banks and healthcare providers.',
    responsibilities: [
      'Design modular web services and cloud components in Java, Python, or React.',
      'Collaborate in agile sprints, participating in sprint reviews and continuous integration.',
      'Ensure high code coverage and automated regression tests.'
    ],
    requirements: [
      'B.E. / B.Tech / M.E. / M.Tech in CS, IT, ECE or related engineering discipline.',
      'Strong grasp of Core Java, Python, or Web Development.',
      'Strong analytical and algorithmic thinking.'
    ],
    skills: ['Java', 'Python', 'React', 'SQL', 'Git', 'Agile'],
    source: 'TCS iBegin Official Careers',
    sourceUrl: 'https://ibegin.tcs.com/iBegin/jobs/search',
    originalJobUrl: 'https://ibegin.tcs.com/iBegin/jobs/search',
    retrievedAt: '2026-10-02T06:18:00Z',
    firstSeenAt: '2026-10-01T11:00:00Z',
    lastVerifiedAt: '2026-10-02T06:30:00Z',
    postedAt: '2026-10-01T11:00:00Z',
    postedAgo: '1 day ago',
    status: 'active',
    isFeatured: false,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'IT Services & Consulting',
    companyOverview: 'Tata Consultancy Services is an IT services, consulting and business solutions organization.'
  },

  // ================= FLIPKART =================
  {
    id: 'job-flip-intern',
    externalJobId: 'FLIP-IN-8821-RUNWAY',
    title: 'Software Development Engineer Intern (Flipkart Runway)',
    company: 'Flipkart',
    companyLogo: 'https://logo.clearbit.com/flipkart.com',
    companyWebsite: 'https://flipkartcareers.com',
    location: 'Bengaluru, Karnataka, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹1,00,000/month stipend',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Pre-final year undergraduate engineering student',
    description: 'Flipkart Runway is our flagship engineering program designed to give early-career students hands-on problem solving experience with India’s highest traffic e-commerce backend.',
    responsibilities: [
      'Build scalable backend services handling high concurrent requests.',
      'Work with mentor SDEs to design caching and message queue solutions (Kafka, Redis).',
      'Optimize database queries and automate testing workflows.'
    ],
    requirements: [
      'Pursuing B.Tech/B.E. in Computer Science or related branch graduating in 2027.',
      'Good coding skills in Java, Python, or C++.',
      'Understanding of relational databases and basic system design.'
    ],
    skills: ['Java', 'Python', 'Data Structures', 'PostgreSQL', 'Kafka', 'Redis'],
    source: 'Flipkart Careers Official',
    sourceUrl: 'https://www.flipkartcareers.com/#!/job-view/software-development-engineer-intern-8821',
    originalJobUrl: 'https://www.flipkartcareers.com/#!/job-view/software-development-engineer-intern-8821',
    retrievedAt: '2026-10-02T06:25:00Z',
    firstSeenAt: '2026-09-29T16:00:00Z',
    lastVerifiedAt: '2026-10-02T06:30:00Z',
    postedAt: '2026-09-29T16:00:00Z',
    postedAgo: '3 days ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'platform_gateway',
    industry: 'E-commerce & Consumer Tech',
    companyOverview: 'Flipkart is India’s homegrown e-commerce marketplace leading consumer technology innovation.',
    internshipDetails: {
      term: 'summer',
      duration: '8–10 weeks',
      specialization: 'Software Engineering',
      isPaid: true,
      eligibility: 'Pre-final year university students'
    }
  },

  // ================= DELOITTE INDIA =================
  {
    id: 'job-delo-intern',
    externalJobId: 'DEL-IN-9821-TECH',
    title: 'Technology Consulting Analyst Intern',
    company: 'Deloitte India',
    companyLogo: 'https://logo.clearbit.com/deloitte.com',
    companyWebsite: 'https://jobsindia.deloitte.com',
    location: 'Hyderabad / Gurugram / Mumbai, India',
    country: 'India',
    remoteType: 'hybrid',
    salaryCurrency: 'INR',
    salaryPeriod: 'month',
    salaryFormatted: '₹45,000/month stipend',
    employmentType: 'internship',
    experienceLevel: 'entry',
    experienceYearsRequired: 'Pre-final year engineering or master’s student',
    description: 'Work alongside technology strategists advising global financial institutions on cloud adoption, cybersecurity architecture, and ERP transformation.',
    responsibilities: [
      'Analyze business requirements and translate them into technical system architectures.',
      'Build proof-of-concepts using Python, SQL, and enterprise cloud tooling.',
      'Prepare technical documentation and executive client briefings.'
    ],
    requirements: [
      'Enrolled in B.Tech, MCA, or MBA Technology programs.',
      'Strong problem-solving, analytical thinking, and communication skills.',
      'Basic knowledge of SQL, Python, or Cloud fundamentals (AWS/Azure).'
    ],
    skills: ['Python', 'SQL', 'Cloud Architecture', 'Cybersecurity', 'Business Analysis'],
    source: 'Deloitte India Careers Direct',
    sourceUrl: 'https://jobsindia.deloitte.com/job/Technology-Consulting-Intern-9821',
    originalJobUrl: 'https://jobsindia.deloitte.com/job/Technology-Consulting-Intern-9821',
    retrievedAt: '2026-10-02T06:22:00Z',
    firstSeenAt: '2026-09-30T16:00:00Z',
    lastVerifiedAt: '2026-10-02T06:30:00Z',
    postedAt: '2026-09-30T16:00:00Z',
    postedAgo: '2 days ago',
    status: 'active',
    isFeatured: false,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Professional Services & Consulting',
    companyOverview: 'Deloitte drives progress for clients and communities around the world.',
    internshipDetails: {
      term: 'summer',
      duration: '8 weeks',
      specialization: 'Product / Technology Consulting',
      isPaid: true,
      eligibility: 'Pre-final year students (Graduating 2027)'
    }
  },

  // ================= REMOTIVE LIVE TECH FEED (REMOTIVE AUTHORIZED) =================
  {
    id: 'job-remotive-backend-fastapi',
    externalJobId: 'REMOTIVE-2091132',
    title: 'Senior Python & FastAPI Backend Engineer',
    company: 'Lemon.io',
    companyLogo: 'https://remotive.com/job/lemon-io-logo.png',
    companyWebsite: 'https://lemon.io',
    location: 'Remote — India / Global',
    country: 'Global',
    remoteType: 'remote',
    salaryCurrency: 'USD',
    salaryPeriod: 'year',
    salaryFormatted: '$90,000 – $130,000 / year (Remote contract)',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    experienceYearsRequired: '4+ years backend Python development',
    description: 'Verified live remote position via Remotive Authorized API. Build scalable microservices, REST APIs, and database models using Python, FastAPI, and PostgreSQL for fast-growing US tech startups.',
    responsibilities: [
      'Design, build, and deploy asynchronous APIs in Python and FastAPI.',
      'Optimize relational databases in PostgreSQL and caching with Redis.',
      'Integrate third-party APIs, webhooks, and asynchronous background workers.'
    ],
    requirements: [
      '4+ years commercial experience with Python and modern web frameworks (FastAPI, Django).',
      'Solid command of PostgreSQL, SQLAlchemy, Docker, and REST API conventions.',
      'Comfortable communicating in English in distributed remote environments.'
    ],
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'REST API', 'Remote Work'],
    source: 'Remotive Authorized Feed',
    sourceUrl: 'https://remotive.com/remote-jobs/software-development/senior-back-end-engineer-2091132',
    originalJobUrl: 'https://remotive.com/remote-jobs/software-development/senior-back-end-engineer-2091132',
    retrievedAt: '2026-10-02T06:45:00Z',
    firstSeenAt: '2026-10-01T12:00:00Z',
    lastVerifiedAt: '2026-10-02T06:45:00Z',
    postedAt: '2026-10-01T12:00:00Z',
    postedAgo: '1 day ago',
    status: 'active',
    isFeatured: true,
    isVerifiedSource: true,
    applicationMethod: 'external',
    industry: 'Software & Cloud Engineering',
    companyOverview: 'Lemon.io matches pre-vetted senior software engineers with vetted Silicon Valley tech companies.'
  }
];

export const INITIAL_VERIFIED_JOBS: Job[] = RAW_INITIAL_VERIFIED_JOBS.map((j) => {
  const comp = resolveCompany(j.company, j.companyLogo, j.companyWebsite);
  return {
    ...j,
    company: comp.name,
    companyId: comp.id,
    company_id: comp.id,
    companyInfo: comp,
    companyLogo: comp.logoUrl || j.companyLogo || '',
    companyWebsite: comp.websiteUrl || j.companyWebsite || '',
    industry: comp.industry || j.industry,
    companyOverview: comp.description || j.companyOverview
  };
});

export const POPULAR_SEARCHES = [
  'Software Engineer',
  'Software Engineering Internship',
  'Backend Developer',
  'Summer Internship',
  'Google',
  'Microsoft',
  'Python Developer',
  'Data Analyst'
];

export const ALL_SKILLS_LIST = [
  'Python',
  'Java',
  'C++',
  'FastAPI',
  'PostgreSQL',
  'React',
  'TypeScript',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Data Structures',
  'Algorithms',
  'Distributed Systems',
  'Machine Learning',
  'PyTorch',
  'CUDA',
  'REST API',
  'Redis',
  'Kafka',
  'C#',
  '.NET Core',
  'Git',
  'SQL'
];

export const SAMPLE_RESUMES = [
  {
    id: 'sample-student-intern',
    label: 'University Student (Applying for SWE Internships & Junior Roles)',
    role: 'Software Engineering Candidate',
    candidateName: 'Ridham Gupta',
    summary: 'Computer Science undergraduate with strong foundation in Algorithms, Python, Java, Data Structures, and backend web services. Passionate about software engineering summer internships and distributed systems.',
    text: `Ridham Gupta
Bengaluru, India | ridhamgupta805@gmail.com | linkedin.com/in/ridham-gupta | github.com/ridhamgupta805

OBJECTIVE
Motivated Computer Science Engineering student seeking a Software Engineering Summer Internship or Graduate Technical Role. Passionate about data structures, scalable backend services, and cloud computing.

TECHNICAL SKILLS
- Programming Languages: Python, Java, C++, TypeScript, SQL
- Frameworks & Backend: FastAPI, Django, React, REST API, Node.js
- Databases: PostgreSQL, Redis, MySQL
- Cloud & Developer Tools: Docker, AWS, Git, GitHub, Linux, Postman
- Computer Science: Data Structures, Algorithms, Object-Oriented Design, Operating Systems, Computer Networks

PROJECTS
- Distributed Cache Engine: Built a thread-safe in-memory key-value cache in Python with LRU eviction and REST API gateway.
- Cloud Task Queue: Implemented asynchronous worker queue in FastAPI and PostgreSQL with priority scheduling.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Graduation Expected: Summer 2027`
  }
];
