import { db } from "./db";
import { users, careers, opportunities, resources, trainingPrograms, goals, profiles } from "@shared/schema";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create admin user
    const [admin] = await db.insert(users).values({
      email: "admin@futureflow.com",
      password: "admin123",
      name: "Admin User",
      role: "admin",
      yearLevel: null,
      course: null,
    }).returning();

    console.log("✅ Admin user created:", admin);

    // Create sample students
    const [student1] = await db.insert(users).values({
      email: "student@futureflow.com",
      password: "student123",
      name: "Test Student",
      role: "student",
      yearLevel: 3,
      course: "Computer Engineering",
    }).returning();

    const [student2] = await db.insert(users).values({
      email: "john.doe@futureflow.com",
      password: "john123",
      name: "John Doe",
      role: "student",
      yearLevel: 4,
      course: "Computer Engineering",
    }).returning();

    console.log("✅ Student users created");

    // Create profiles for students
    await db.insert(profiles).values([
      {
        userId: student1.id,
        gpa: 3.5,
        skills: ["Python", "C++", "JavaScript", "React"],
        interests: ["Web Development", "AI/ML", "Embedded Systems"],
        careerPreferences: ["Software Engineer", "Full Stack Developer"],
        certifications: ["AWS Cloud Practitioner"],
        subjectsTaken: ["Data Structures", "Algorithms", "Web Development", "Database Systems"],
        bio: "Passionate about software development and emerging technologies",
      },
      {
        userId: student2.id,
        gpa: 3.8,
        skills: ["Java", "Python", "VLSI Design", "SystemVerilog"],
        interests: ["Hardware Design", "Embedded Systems", "IoT"],
        careerPreferences: ["VLSI Engineer", "Embedded Systems Engineer"],
        certifications: ["Certified LabVIEW Associate Developer"],
        subjectsTaken: ["Digital Design", "Microprocessors", "VLSI Design", "Computer Architecture"],
        bio: "Hardware enthusiast with focus on chip design and embedded systems",
      },
    ]);

    console.log("✅ Student profiles created");

    // Seed Career Pathways
    await db.insert(careers).values([
      {
        title: "Software Engineer",
        description: "Design, develop, and maintain software applications and systems",
        overview: "Software engineers build scalable applications, work with modern frameworks, and solve complex problems using code.",
        requiredSkills: ["JavaScript", "Python", "Java", "Git", "SQL", "REST APIs", "Problem Solving"],
        recommendedTools: ["VS Code", "GitHub", "Docker", "Postman", "AWS/Azure"],
        salaryRange: "$70,000 - $150,000",
        industry: "Technology",
        learningPath: {
          beginner: ["Learn programming basics", "Master data structures", "Version control (Git)"],
          intermediate: ["Build web applications", "Learn databases", "API development"],
          advanced: ["System design", "Cloud deployment", "Microservices architecture"],
        },
        icon: "Code",
      },
      {
        title: "Full Stack Developer",
        description: "Build complete web applications from frontend to backend",
        overview: "Full stack developers handle both client-side and server-side development, creating end-to-end solutions.",
        requiredSkills: ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", "HTML/CSS", "Redux"],
        recommendedTools: ["VS Code", "Next.js", "Express.js", "MongoDB Atlas", "Vercel"],
        salaryRange: "$65,000 - $140,000",
        industry: "Technology",
        learningPath: {
          beginner: ["HTML/CSS/JS fundamentals", "React basics", "Node.js intro"],
          intermediate: ["Full CRUD apps", "Authentication", "Database design"],
          advanced: ["Performance optimization", "Server-side rendering", "DevOps"],
        },
        icon: "Layers",
      },
      {
        title: "VLSI Design Engineer",
        description: "Design and verify integrated circuits and chip architectures",
        overview: "VLSI engineers work on semiconductor chip design, verification, and physical design using specialized tools.",
        requiredSkills: ["Verilog", "VHDL", "SystemVerilog", "Digital Design", "Cadence Tools", "Synopsys"],
        recommendedTools: ["ModelSim", "Xilinx Vivado", "Cadence Virtuoso", "Synopsys Design Compiler"],
        salaryRange: "$80,000 - $160,000",
        industry: "Semiconductor",
        learningPath: {
          beginner: ["Digital logic design", "Verilog/VHDL basics", "FPGA programming"],
          intermediate: ["RTL design", "Synthesis", "Static timing analysis"],
          advanced: ["Physical design", "Low power techniques", "DFT"],
        },
        icon: "Cpu",
      },
      {
        title: "Embedded Systems Engineer",
        description: "Develop software for embedded hardware and IoT devices",
        overview: "Embedded engineers bridge hardware and software, programming microcontrollers and real-time systems.",
        requiredSkills: ["C", "C++", "ARM", "RTOS", "I2C/SPI", "Debugging", "Linux"],
        recommendedTools: ["Keil", "Arduino IDE", "STM32CubeIDE", "JTAG Debugger", "Oscilloscope"],
        salaryRange: "$75,000 - $145,000",
        industry: "Electronics/IoT",
        learningPath: {
          beginner: ["C programming", "Microcontroller basics", "GPIO/Timers"],
          intermediate: ["Communication protocols", "RTOS concepts", "Driver development"],
          advanced: ["Linux kernel modules", "Power management", "Safety-critical systems"],
        },
        icon: "Microchip",
      },
      {
        title: "Network Engineer",
        description: "Design, implement, and maintain computer networks",
        overview: "Network engineers ensure reliable connectivity, security, and performance of organizational networks.",
        requiredSkills: ["TCP/IP", "Routing/Switching", "Cisco", "Firewalls", "VPN", "Network Security"],
        recommendedTools: ["Cisco Packet Tracer", "Wireshark", "GNS3", "SolarWinds"],
        salaryRange: "$60,000 - $130,000",
        industry: "IT/Networking",
        learningPath: {
          beginner: ["OSI model", "IP addressing", "Basic switching/routing"],
          intermediate: ["VLAN configuration", "ACLs", "VPN setup"],
          advanced: ["SD-WAN", "Network automation", "Security hardening"],
        },
        icon: "Network",
      },
      {
        title: "Data Scientist",
        description: "Analyze complex data and build predictive models",
        overview: "Data scientists use statistical methods, machine learning, and programming to extract insights from data.",
        requiredSkills: ["Python", "R", "SQL", "Machine Learning", "Statistics", "Pandas", "TensorFlow"],
        recommendedTools: ["Jupyter", "scikit-learn", "PyTorch", "Tableau", "Power BI"],
        salaryRange: "$85,000 - $165,000",
        industry: "Data/Analytics",
        learningPath: {
          beginner: ["Python basics", "Statistics fundamentals", "Data visualization"],
          intermediate: ["Machine learning algorithms", "Feature engineering", "SQL mastery"],
          advanced: ["Deep learning", "MLOps", "Big data tools (Spark)"],
        },
        icon: "BarChart",
      },
    ]);

    console.log("✅ Career pathways seeded");

    // Seed Opportunities
    await db.insert(opportunities).values([
      {
        title: "Software Engineering Intern",
        company: "Tech Solutions Inc.",
        description: "Join our development team to build scalable web applications using React and Node.js. Learn from experienced engineers and contribute to real-world projects.",
        location: "Manila, Philippines",
        type: "internship",
        industry: "Technology",
        requiredSkills: ["JavaScript", "React", "Node.js", "Git"],
        applicationUrl: "https://techsolutions.ph/careers/swe-intern",
        deadline: new Date("2025-03-15"),
        isActive: true,
      },
      {
        title: "VLSI Design Intern",
        company: "SemiConductor Corp",
        description: "Work on RTL design and verification for next-generation chips. Gain hands-on experience with industry-standard EDA tools.",
        location: "Quezon City, Philippines",
        type: "internship",
        industry: "Semiconductor",
        requiredSkills: ["Verilog", "Digital Design", "FPGA"],
        applicationUrl: "https://semicorp.ph/internships",
        deadline: new Date("2025-02-28"),
        isActive: true,
      },
      {
        title: "Junior Full Stack Developer",
        company: "WebDev Studios",
        description: "Build modern web applications for clients across various industries. Work with React, TypeScript, and PostgreSQL.",
        location: "Makati, Philippines",
        type: "job",
        industry: "Technology",
        requiredSkills: ["React", "TypeScript", "PostgreSQL", "REST APIs"],
        applicationUrl: "https://webdevstudios.ph/careers",
        deadline: new Date("2025-04-30"),
        isActive: true,
      },
      {
        title: "Embedded Systems Internship",
        company: "IoT Innovations",
        description: "Design and program microcontroller-based systems for IoT applications. Learn real-time operating systems and sensor interfacing.",
        location: "BGC, Taguig",
        type: "internship",
        industry: "IoT",
        requiredSkills: ["C", "C++", "ARM", "RTOS"],
        applicationUrl: "https://iotinnovations.ph/join",
        deadline: new Date("2025-03-01"),
        isActive: true,
      },
      {
        title: "Network Administrator",
        company: "Enterprise Networks Ltd.",
        description: "Manage and maintain enterprise network infrastructure. Configure routers, switches, and implement security policies.",
        location: "Pasig, Philippines",
        type: "job",
        industry: "IT/Networking",
        requiredSkills: ["Cisco", "TCP/IP", "Firewalls", "VPN"],
        applicationUrl: "https://entnetworks.ph/careers",
        deadline: new Date("2025-05-15"),
        isActive: true,
      },
      {
        title: "Data Analyst Internship",
        company: "Analytics Pro",
        description: "Analyze business data, create visualizations, and support data-driven decision making. Work with Python and SQL.",
        location: "Ortigas, Pasig",
        type: "internship",
        industry: "Data/Analytics",
        requiredSkills: ["Python", "SQL", "Excel", "Data Visualization"],
        applicationUrl: "https://analyticspro.ph/interns",
        deadline: new Date("2025-03-20"),
        isActive: true,
      },
    ]);

    console.log("✅ Opportunities seeded");

    // Seed Resources
    await db.insert(resources).values([
      {
        title: "Introduction to Python Programming",
        description: "Comprehensive guide covering Python basics, data structures, and object-oriented programming",
        type: "pdf",
        category: "Programming",
        url: "/resources/python-guide.pdf",
        tags: ["Python", "Programming", "Beginner"],
      },
      {
        title: "React Complete Course",
        description: "Master React from basics to advanced concepts including hooks, context, and Redux",
        type: "video",
        category: "Web Development",
        url: "/resources/react-course",
        tags: ["React", "JavaScript", "Frontend"],
      },
      {
        title: "Computer Networks Fundamentals",
        description: "Learn TCP/IP, routing, switching, and network protocols",
        type: "pdf",
        category: "Networking",
        url: "/resources/networks-fundamentals.pdf",
        tags: ["Networking", "TCP/IP", "Protocols"],
      },
      {
        title: "VLSI Design Tutorial",
        description: "Complete tutorial on digital VLSI design using Verilog and FPGA tools",
        type: "pdf",
        category: "Hardware",
        url: "/resources/vlsi-tutorial.pdf",
        tags: ["VLSI", "Verilog", "FPGA"],
      },
      {
        title: "Professional Resume Template - Engineering",
        description: "ATS-friendly resume template tailored for engineering students",
        type: "template",
        category: "Career",
        url: "/resources/resume-template.docx",
        tags: ["Resume", "Career", "Template"],
      },
      {
        title: "Data Structures and Algorithms",
        description: "Essential DSA concepts with implementations in C++ and Python",
        type: "pdf",
        category: "Programming",
        url: "/resources/dsa-guide.pdf",
        tags: ["DSA", "Algorithms", "Programming"],
      },
      {
        title: "Embedded C Programming",
        description: "Master C programming for embedded systems and microcontrollers",
        type: "pdf",
        category: "Embedded Systems",
        url: "/resources/embedded-c.pdf",
        tags: ["C", "Embedded", "Microcontrollers"],
      },
      {
        title: "Interview Preparation Guide",
        description: "Technical interview questions and answers for Computer Engineering roles",
        type: "pdf",
        category: "Career",
        url: "/resources/interview-guide.pdf",
        tags: ["Interview", "Career", "Technical"],
      },
    ]);

    console.log("✅ Resources seeded");

    // Seed Training Programs
    await db.insert(trainingPrograms).values([
      {
        title: "AWS Cloud Practitioner Certification",
        description: "Learn cloud computing fundamentals and prepare for AWS certification",
        provider: "Amazon Web Services",
        duration: "4 weeks",
        skills: ["Cloud Computing", "AWS", "DevOps"],
        certificationOffered: true,
        url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
        isActive: true,
      },
      {
        title: "Full Stack Web Development Bootcamp",
        description: "Intensive program covering React, Node.js, MongoDB, and deployment",
        provider: "FreeCodeCamp",
        duration: "12 weeks",
        skills: ["React", "Node.js", "MongoDB", "JavaScript", "HTML/CSS"],
        certificationOffered: true,
        url: "https://www.freecodecamp.org/",
        isActive: true,
      },
      {
        title: "Cisco CCNA Training",
        description: "Network fundamentals, routing, switching, and security",
        provider: "Cisco Networking Academy",
        duration: "8 weeks",
        skills: ["Networking", "Cisco", "Routing", "Switching"],
        certificationOffered: true,
        url: "https://www.netacad.com/courses/networking/ccna",
        isActive: true,
      },
      {
        title: "Embedded Systems with ARM Cortex",
        description: "Hands-on training with ARM microcontrollers and RTOS",
        provider: "Udemy - FastBit Academy",
        duration: "6 weeks",
        skills: ["ARM", "C", "RTOS", "Embedded Systems"],
        certificationOffered: true,
        url: "https://www.udemy.com/embedded-systems-arm-cortex/",
        isActive: true,
      },
      {
        title: "Python for Data Science",
        description: "Learn Python, pandas, NumPy, and data visualization",
        provider: "Coursera - IBM",
        duration: "5 weeks",
        skills: ["Python", "Data Science", "Pandas", "NumPy"],
        certificationOffered: true,
        url: "https://www.coursera.org/learn/python-for-applied-data-science-ai",
        isActive: true,
      },
    ]);

    console.log("✅ Training programs seeded");

    // Seed sample goals for student1
    await db.insert(goals).values([
      {
        userId: student1.id,
        title: "Master React and Node.js",
        description: "Build full-stack web applications with modern tools",
        type: "short-term",
        specific: "Complete 3 full-stack projects using React and Node.js",
        measurable: "Track project completion and code commits",
        achievable: "Dedicate 10 hours per week to learning and building",
        relevant: "Aligned with Full Stack Developer career path",
        timeBound: "Complete by end of semester (June 2025)",
        progress: 35,
        status: "in_progress",
        targetDate: new Date("2025-06-30"),
      },
      {
        userId: student1.id,
        title: "Get AWS Cloud Practitioner Certification",
        description: "Pass the AWS Cloud Practitioner certification exam",
        type: "short-term",
        specific: "Study AWS services and take practice exams",
        measurable: "Complete certification course and pass exam",
        achievable: "Study 5 hours per week for 4 weeks",
        relevant: "Valuable for cloud-based software engineering roles",
        timeBound: "Complete by March 2025",
        progress: 60,
        status: "in_progress",
        targetDate: new Date("2025-03-31"),
      },
      {
        userId: student1.id,
        title: "Become a Software Engineer at Tech Company",
        description: "Secure a software engineering position at a reputable tech company",
        type: "long-term",
        specific: "Apply to at least 20 companies and ace technical interviews",
        measurable: "Track applications, interviews, and offers",
        achievable: "Build portfolio, network, and prepare thoroughly",
        relevant: "Primary career goal aligned with skills and interests",
        timeBound: "Secure position by graduation (April 2026)",
        progress: 20,
        status: "in_progress",
        targetDate: new Date("2026-04-30"),
      },
    ]);

    console.log("✅ Sample goals seeded");

    console.log("\n📋 Admin Credentials:");
    console.log("Email: admin@futureflow.com");
    console.log("Password: admin123");
    console.log("\n📋 Student Credentials:");
    console.log("Email: student@futureflow.com");
    console.log("Password: student123");
    console.log("\n📋 Student Credentials:");
    console.log("Email: john.doe@futureflow.com");
    console.log("Password: john123");

    console.log("\n✅ Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
