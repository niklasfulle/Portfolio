const publicProjects = [
  {
    name: "Portfolio",
    description:
      "Personal portfolio with GitHub statistics, language switching, and a responsive dark mode.",
    codeRepository: "https://github.com/niklasfulle/Portfolio",
  },
  {
    name: "Netflix Clone",
    description:
      "A modern streaming interface built as a web development project.",
    codeRepository: "https://github.com/niklasfulle/Netflix-Clone",
  },
  {
    name: "WorldData API",
    description: "An API project for worldwide datasets and data-driven applications.",
    codeRepository: "https://github.com/niklasfulle/WorldData-API",
  },
  {
    name: "Chat App",
    description:
      "A chat application from a bachelor thesis with automated infrastructure provisioning.",
    codeRepository: "https://github.com/niklasfulle/chat-app",
  },
  {
    name: "Self-Driving Car",
    description:
      "A JavaScript experiment with neural networks and machine-learning concepts.",
    codeRepository: "https://github.com/niklasfulle/Self-Driving-Car",
  },
  {
    name: "Randnotizen",
    description:
      "An offline-capable Windows desktop note application with topics, checklists, and keyboard navigation.",
    codeRepository: "https://github.com/niklasfulle/Randnotizen",
  },
  {
    name: "LifeSim",
    description:
      "A desktop life and survival simulation with procedural worlds and persistent save states.",
    codeRepository: "https://github.com/niklasfulle/Livesim",
  },
] as const;

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "#niklas-fulle",
      name: "Niklas Fulle",
      jobTitle: "Software Developer and DevOps Enthusiast",
      sameAs: [
        "https://github.com/niklasfulle",
        "https://www.linkedin.com/in/niklas-fulle-61b422232/",
      ],
      knowsLanguage: ["de", "en"],
      knowsAbout: [
        "Software development",
        "DevOps",
        "TypeScript",
        "Next.js",
        ".NET",
        "Docker",
        "CI/CD",
        "Software testing",
      ],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Ostfalia University of Applied Sciences",
      },
    },
    {
      "@type": "WebSite",
      name: "Niklas Fulle Portfolio",
      description:
        "Portfolio of Niklas Fulle, software developer and DevOps enthusiast.",
      inLanguage: ["de", "en"],
      about: { "@id": "#niklas-fulle" },
    },
    ...publicProjects.map((project) => ({
      "@type": "SoftwareSourceCode",
      name: project.name,
      description: project.description,
      codeRepository: project.codeRepository,
      author: { "@id": "#niklas-fulle" },
    })),
  ],
};
