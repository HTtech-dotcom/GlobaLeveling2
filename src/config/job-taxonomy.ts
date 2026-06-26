export type IndustryGroupCode =
  | "TECH_SOFTWARE"
  | "DATA_AI"
  | "ENGINEERING_MANUFACTURING"
  | "FINANCE_ACCOUNTING_AUDIT"
  | "BANKING_INVESTMENT_RISK"
  | "LAW_LEGAL_COMPLIANCE"
  | "MEDICINE_HEALTHCARE"
  | "EDUCATION_RESEARCH"
  | "CONSULTING_PROJECT_MANAGEMENT"
  | "MARKETING_SALES_GROWTH"
  | "OPERATIONS_SUPPLY_CHAIN"
  | "DESIGN_CREATIVE_MEDIA"
  | "HUMAN_RESOURCES_PEOPLE"
  | "GOVERNMENT_PUBLIC_POLICY"
  | "SKILLED_TRADES_SERVICES"
  | "ENTREPRENEURSHIP_MANAGEMENT"
  | "OTHER_GENERAL";

export type CertificationMeasurementMode =
  | "NONE"
  | "MODULE_PASSED"
  | "LEVEL_PASSED"
  | "PERCENT_COMPLETE"
  | "LICENSE_STAGE"
  | "EXAM_PART_PASSED"
  | "PORTFOLIO_SCOPE";

export type CompanyTierCode =
  | "top_firm"
  | "top_20"
  | "top_50"
  | "top_100"
  | "sme"
  | "local_small_company";

export type SeniorityLevelCode =
  | "intern_trainee"
  | "junior"
  | "associate"
  | "senior_ic"
  | "lead"
  | "manager"
  | "senior_manager"
  | "director"
  | "head_of_function"
  | "vp_partner_principal"
  | "c_level_owner";

export type EducationLevelCode =
  | "high_school"
  | "vocational_diploma"
  | "associate_degree"
  | "bachelor_related"
  | "bachelor_top_or_honors"
  | "master_related"
  | "mba_professional_master"
  | "phd_candidate"
  | "phd_completed"
  | "postdoc_specialist"
  | "professor_recognized";

export type EducationRelevanceCode =
  | "unrelated"
  | "partially_related"
  | "related"
  | "elite_or_highly_relevant";

export type IndustryGroup = {
  code: IndustryGroupCode;
  name: string;
  description: string;
  displayOrder: number;
};

export type Profession = {
  code: string;
  name: string;
  industryGroupCode: IndustryGroupCode;
  keywords: string[];
  isCertificationHeavy?: boolean;
  isLicenseHeavy?: boolean;
  isPortfolioHeavy?: boolean;
};

export type ScoreOption<T extends string> = {
  code: T;
  label: string;
  score: number;
  description?: string;
};

export type CompanyTierOption = {
  code: CompanyTierCode;
  label: string;
  multiplier: number;
  validationFactor: number;
};

export type JobScoringProfile = {
  code: string;
  industryGroupCode: IndustryGroupCode;
  experienceWeight: number;
  seniorityWeight: number;
  educationWeight: number;
  certificationWeight: number;
};

export type CertificationStage = {
  code: string;
  label: string;
  score: number;
};

export type CertificationTrack = {
  code: string;
  name: string;
  industryGroupCodes: IndustryGroupCode[];
  professionCodes?: string[];
  measurementMode: CertificationMeasurementMode;
  totalUnits?: number;
  stages?: CertificationStage[];
  maxScore: number;
  isInternational: boolean;
  isLocal?: boolean;
  localDirectoryHref?: string;
  description?: string;
};

export const industryGroups: IndustryGroup[] = [
  { code: "TECH_SOFTWARE", name: "Technology / Software", description: "Software, product, cloud, cybersecurity, QA.", displayOrder: 1 },
  { code: "DATA_AI", name: "Data / AI / Analytics", description: "Analytics, data engineering, data science, machine learning, AI research.", displayOrder: 2 },
  { code: "ENGINEERING_MANUFACTURING", name: "Engineering / Manufacturing", description: "Traditional engineering, industrial systems, construction, manufacturing quality.", displayOrder: 3 },
  { code: "FINANCE_ACCOUNTING_AUDIT", name: "Finance / Accounting / Audit", description: "Accounting, audit, tax, controllership, management accounting.", displayOrder: 4 },
  { code: "BANKING_INVESTMENT_RISK", name: "Banking / Investment / Risk", description: "Investment, securities, banking, credit, treasury, portfolio and risk.", displayOrder: 5 },
  { code: "LAW_LEGAL_COMPLIANCE", name: "Law / Legal / Compliance", description: "Legal practice, corporate legal, compliance, IP and regulation.", displayOrder: 6 },
  { code: "MEDICINE_HEALTHCARE", name: "Medicine / Healthcare", description: "Medical, nursing, dentistry, pharmacy, therapy and public health.", displayOrder: 7 },
  { code: "EDUCATION_RESEARCH", name: "Education / Research", description: "Teaching, academic, scientific research and education management.", displayOrder: 8 },
  { code: "CONSULTING_PROJECT_MANAGEMENT", name: "Consulting / Project Management", description: "Strategy, management consulting, business analysis, project/program management.", displayOrder: 9 },
  { code: "MARKETING_SALES_GROWTH", name: "Marketing / Sales / Growth", description: "Digital marketing, growth, sales, customer success and brand.", displayOrder: 10 },
  { code: "OPERATIONS_SUPPLY_CHAIN", name: "Operations / Supply Chain", description: "Procurement, logistics, planning, warehouse and operations.", displayOrder: 11 },
  { code: "DESIGN_CREATIVE_MEDIA", name: "Design / Creative / Media", description: "Product design, UI/UX, visual design, content, video and game design.", displayOrder: 12 },
  { code: "HUMAN_RESOURCES_PEOPLE", name: "Human Resources / People", description: "HR, recruiting, people operations, compensation, learning and development.", displayOrder: 13 },
  { code: "GOVERNMENT_PUBLIC_POLICY", name: "Government / Public Policy", description: "Civil service, public administration, policy, diplomacy and NGOs.", displayOrder: 14 },
  { code: "SKILLED_TRADES_SERVICES", name: "Skilled Trades / Services", description: "Licensed trades, technical services, culinary and hospitality.", displayOrder: 15 },
  { code: "ENTREPRENEURSHIP_MANAGEMENT", name: "Entrepreneurship / Management", description: "Founders, small business owners, general management and business development.", displayOrder: 16 },
  { code: "OTHER_GENERAL", name: "Other / General", description: "Fallback group for students, general professionals and custom roles.", displayOrder: 17 }
];

export const professions: Profession[] = [
  { code: "software_engineer", name: "Software Engineer", industryGroupCode: "TECH_SOFTWARE", keywords: ["developer", "programmer"], isPortfolioHeavy: true },
  { code: "backend_engineer", name: "Backend Engineer", industryGroupCode: "TECH_SOFTWARE", keywords: ["api", "server"] },
  { code: "frontend_engineer", name: "Frontend Engineer", industryGroupCode: "TECH_SOFTWARE", keywords: ["web", "react"] },
  { code: "mobile_engineer", name: "Mobile Engineer", industryGroupCode: "TECH_SOFTWARE", keywords: ["ios", "android"] },
  { code: "devops_engineer", name: "DevOps Engineer", industryGroupCode: "TECH_SOFTWARE", keywords: ["cloud", "sre"] },
  { code: "qa_engineer", name: "QA Engineer", industryGroupCode: "TECH_SOFTWARE", keywords: ["testing", "automation"] },
  { code: "cybersecurity_analyst", name: "Cybersecurity Analyst", industryGroupCode: "TECH_SOFTWARE", keywords: ["security", "soc"], isCertificationHeavy: true },
  { code: "cloud_engineer", name: "Cloud Engineer", industryGroupCode: "TECH_SOFTWARE", keywords: ["aws", "azure", "gcp"], isCertificationHeavy: true },
  { code: "product_manager", name: "Product Manager", industryGroupCode: "TECH_SOFTWARE", keywords: ["product", "pm"] },

  { code: "data_analyst", name: "Data Analyst", industryGroupCode: "DATA_AI", keywords: ["analytics", "sql"] },
  { code: "bi_analyst", name: "Business Intelligence Analyst", industryGroupCode: "DATA_AI", keywords: ["bi", "dashboard"] },
  { code: "data_scientist", name: "Data Scientist", industryGroupCode: "DATA_AI", keywords: ["statistics", "modeling"] },
  { code: "machine_learning_engineer", name: "Machine Learning Engineer", industryGroupCode: "DATA_AI", keywords: ["ml", "deployment"] },
  { code: "ai_engineer", name: "AI Engineer", industryGroupCode: "DATA_AI", keywords: ["llm", "ai"] },
  { code: "data_engineer", name: "Data Engineer", industryGroupCode: "DATA_AI", keywords: ["pipeline", "warehouse"] },
  { code: "research_scientist_ai", name: "AI Research Scientist", industryGroupCode: "DATA_AI", keywords: ["research", "paper"] },

  { code: "mechanical_engineer", name: "Mechanical Engineer", industryGroupCode: "ENGINEERING_MANUFACTURING", keywords: ["mechanical"], isLicenseHeavy: true },
  { code: "electrical_engineer", name: "Electrical Engineer", industryGroupCode: "ENGINEERING_MANUFACTURING", keywords: ["electrical"], isLicenseHeavy: true },
  { code: "civil_engineer", name: "Civil Engineer", industryGroupCode: "ENGINEERING_MANUFACTURING", keywords: ["construction"], isLicenseHeavy: true },
  { code: "chemical_engineer", name: "Chemical Engineer", industryGroupCode: "ENGINEERING_MANUFACTURING", keywords: ["chemical"] },
  { code: "industrial_engineer", name: "Industrial Engineer", industryGroupCode: "ENGINEERING_MANUFACTURING", keywords: ["process"] },
  { code: "manufacturing_engineer", name: "Manufacturing Engineer", industryGroupCode: "ENGINEERING_MANUFACTURING", keywords: ["factory"] },
  { code: "quality_engineer", name: "Quality Engineer", industryGroupCode: "ENGINEERING_MANUFACTURING", keywords: ["quality", "qa"] },

  { code: "auditor", name: "Auditor", industryGroupCode: "FINANCE_ACCOUNTING_AUDIT", keywords: ["audit"], isCertificationHeavy: true },
  { code: "accountant", name: "Accountant", industryGroupCode: "FINANCE_ACCOUNTING_AUDIT", keywords: ["accounting"], isCertificationHeavy: true },
  { code: "tax_consultant", name: "Tax Consultant", industryGroupCode: "FINANCE_ACCOUNTING_AUDIT", keywords: ["tax"], isCertificationHeavy: true },
  { code: "financial_controller", name: "Financial Controller", industryGroupCode: "FINANCE_ACCOUNTING_AUDIT", keywords: ["controller"], isCertificationHeavy: true },
  { code: "management_accountant", name: "Management Accountant", industryGroupCode: "FINANCE_ACCOUNTING_AUDIT", keywords: ["management accounting"], isCertificationHeavy: true },
  { code: "internal_auditor", name: "Internal Auditor", industryGroupCode: "FINANCE_ACCOUNTING_AUDIT", keywords: ["internal audit"], isCertificationHeavy: true },

  { code: "investment_analyst", name: "Investment Analyst", industryGroupCode: "BANKING_INVESTMENT_RISK", keywords: ["investment"], isCertificationHeavy: true },
  { code: "equity_research_analyst", name: "Equity Research Analyst", industryGroupCode: "BANKING_INVESTMENT_RISK", keywords: ["equity research"], isCertificationHeavy: true },
  { code: "credit_analyst", name: "Credit Analyst", industryGroupCode: "BANKING_INVESTMENT_RISK", keywords: ["credit"] },
  { code: "risk_analyst", name: "Risk Analyst", industryGroupCode: "BANKING_INVESTMENT_RISK", keywords: ["risk"], isCertificationHeavy: true },
  { code: "corporate_banker", name: "Corporate Banker", industryGroupCode: "BANKING_INVESTMENT_RISK", keywords: ["banking"] },
  { code: "treasury_analyst", name: "Treasury Analyst", industryGroupCode: "BANKING_INVESTMENT_RISK", keywords: ["treasury"] },
  { code: "portfolio_analyst", name: "Portfolio Analyst", industryGroupCode: "BANKING_INVESTMENT_RISK", keywords: ["portfolio"], isCertificationHeavy: true },

  { code: "lawyer", name: "Lawyer", industryGroupCode: "LAW_LEGAL_COMPLIANCE", keywords: ["attorney"], isLicenseHeavy: true },
  { code: "legal_counsel", name: "Legal Counsel", industryGroupCode: "LAW_LEGAL_COMPLIANCE", keywords: ["in-house"], isLicenseHeavy: true },
  { code: "compliance_officer", name: "Compliance Officer", industryGroupCode: "LAW_LEGAL_COMPLIANCE", keywords: ["compliance"], isCertificationHeavy: true },
  { code: "paralegal", name: "Paralegal", industryGroupCode: "LAW_LEGAL_COMPLIANCE", keywords: ["legal assistant"] },
  { code: "legal_researcher", name: "Legal Researcher", industryGroupCode: "LAW_LEGAL_COMPLIANCE", keywords: ["legal research"] },
  { code: "ip_lawyer", name: "IP Lawyer", industryGroupCode: "LAW_LEGAL_COMPLIANCE", keywords: ["intellectual property"], isLicenseHeavy: true },

  { code: "doctor", name: "Doctor", industryGroupCode: "MEDICINE_HEALTHCARE", keywords: ["physician"], isLicenseHeavy: true },
  { code: "nurse", name: "Nurse", industryGroupCode: "MEDICINE_HEALTHCARE", keywords: ["rn"], isLicenseHeavy: true },
  { code: "dentist", name: "Dentist", industryGroupCode: "MEDICINE_HEALTHCARE", keywords: ["dental"], isLicenseHeavy: true },
  { code: "pharmacist", name: "Pharmacist", industryGroupCode: "MEDICINE_HEALTHCARE", keywords: ["pharmacy"], isLicenseHeavy: true },
  { code: "physical_therapist", name: "Physical Therapist", industryGroupCode: "MEDICINE_HEALTHCARE", keywords: ["physio"], isLicenseHeavy: true },
  { code: "public_health_specialist", name: "Public Health Specialist", industryGroupCode: "MEDICINE_HEALTHCARE", keywords: ["public health"] },

  { code: "teacher", name: "Teacher", industryGroupCode: "EDUCATION_RESEARCH", keywords: ["teaching"], isLicenseHeavy: true },
  { code: "lecturer", name: "Lecturer", industryGroupCode: "EDUCATION_RESEARCH", keywords: ["university"] },
  { code: "research_assistant", name: "Research Assistant", industryGroupCode: "EDUCATION_RESEARCH", keywords: ["research"] },
  { code: "research_scientist", name: "Research Scientist", industryGroupCode: "EDUCATION_RESEARCH", keywords: ["lab"] },
  { code: "academic_researcher", name: "Academic Researcher", industryGroupCode: "EDUCATION_RESEARCH", keywords: ["academic"] },
  { code: "education_program_manager", name: "Education Program Manager", industryGroupCode: "EDUCATION_RESEARCH", keywords: ["education management"] },

  { code: "strategy_consultant", name: "Strategy Consultant", industryGroupCode: "CONSULTING_PROJECT_MANAGEMENT", keywords: ["strategy"] },
  { code: "management_consultant", name: "Management Consultant", industryGroupCode: "CONSULTING_PROJECT_MANAGEMENT", keywords: ["consulting"] },
  { code: "business_analyst", name: "Business Analyst", industryGroupCode: "CONSULTING_PROJECT_MANAGEMENT", keywords: ["ba"] },
  { code: "project_manager", name: "Project Manager", industryGroupCode: "CONSULTING_PROJECT_MANAGEMENT", keywords: ["pmp"], isCertificationHeavy: true },
  { code: "program_manager", name: "Program Manager", industryGroupCode: "CONSULTING_PROJECT_MANAGEMENT", keywords: ["program"] },
  { code: "product_operations_manager", name: "Product Operations Manager", industryGroupCode: "CONSULTING_PROJECT_MANAGEMENT", keywords: ["product ops"] },

  { code: "digital_marketer", name: "Digital Marketer", industryGroupCode: "MARKETING_SALES_GROWTH", keywords: ["marketing"] },
  { code: "seo_specialist", name: "SEO Specialist", industryGroupCode: "MARKETING_SALES_GROWTH", keywords: ["seo"] },
  { code: "brand_manager", name: "Brand Manager", industryGroupCode: "MARKETING_SALES_GROWTH", keywords: ["brand"] },
  { code: "growth_marketer", name: "Growth Marketer", industryGroupCode: "MARKETING_SALES_GROWTH", keywords: ["growth"] },
  { code: "sales_representative", name: "Sales Representative", industryGroupCode: "MARKETING_SALES_GROWTH", keywords: ["sales"] },
  { code: "account_executive", name: "Account Executive", industryGroupCode: "MARKETING_SALES_GROWTH", keywords: ["account"] },
  { code: "customer_success_manager", name: "Customer Success Manager", industryGroupCode: "MARKETING_SALES_GROWTH", keywords: ["customer success"] },

  { code: "operations_analyst", name: "Operations Analyst", industryGroupCode: "OPERATIONS_SUPPLY_CHAIN", keywords: ["operations"] },
  { code: "procurement_specialist", name: "Procurement Specialist", industryGroupCode: "OPERATIONS_SUPPLY_CHAIN", keywords: ["procurement"] },
  { code: "supply_chain_planner", name: "Supply Chain Planner", industryGroupCode: "OPERATIONS_SUPPLY_CHAIN", keywords: ["planning"] },
  { code: "logistics_coordinator", name: "Logistics Coordinator", industryGroupCode: "OPERATIONS_SUPPLY_CHAIN", keywords: ["logistics"] },
  { code: "warehouse_manager", name: "Warehouse Manager", industryGroupCode: "OPERATIONS_SUPPLY_CHAIN", keywords: ["warehouse"] },
  { code: "demand_planner", name: "Demand Planner", industryGroupCode: "OPERATIONS_SUPPLY_CHAIN", keywords: ["demand"] },

  { code: "ui_ux_designer", name: "UI/UX Designer", industryGroupCode: "DESIGN_CREATIVE_MEDIA", keywords: ["ux"], isPortfolioHeavy: true },
  { code: "product_designer", name: "Product Designer", industryGroupCode: "DESIGN_CREATIVE_MEDIA", keywords: ["product design"], isPortfolioHeavy: true },
  { code: "graphic_designer", name: "Graphic Designer", industryGroupCode: "DESIGN_CREATIVE_MEDIA", keywords: ["visual"], isPortfolioHeavy: true },
  { code: "video_editor", name: "Video Editor", industryGroupCode: "DESIGN_CREATIVE_MEDIA", keywords: ["video"], isPortfolioHeavy: true },
  { code: "content_creator", name: "Content Creator", industryGroupCode: "DESIGN_CREATIVE_MEDIA", keywords: ["content"], isPortfolioHeavy: true },
  { code: "game_designer", name: "Game Designer", industryGroupCode: "DESIGN_CREATIVE_MEDIA", keywords: ["game"], isPortfolioHeavy: true },

  { code: "hr_generalist", name: "HR Generalist", industryGroupCode: "HUMAN_RESOURCES_PEOPLE", keywords: ["hr"] },
  { code: "hr_business_partner", name: "HR Business Partner", industryGroupCode: "HUMAN_RESOURCES_PEOPLE", keywords: ["hrbp"] },
  { code: "recruiter", name: "Recruiter", industryGroupCode: "HUMAN_RESOURCES_PEOPLE", keywords: ["talent"] },
  { code: "compensation_benefits_specialist", name: "Compensation & Benefits Specialist", industryGroupCode: "HUMAN_RESOURCES_PEOPLE", keywords: ["compensation"] },
  { code: "learning_development_specialist", name: "Learning & Development Specialist", industryGroupCode: "HUMAN_RESOURCES_PEOPLE", keywords: ["training"] },

  { code: "civil_servant", name: "Civil Servant", industryGroupCode: "GOVERNMENT_PUBLIC_POLICY", keywords: ["government"] },
  { code: "policy_analyst", name: "Policy Analyst", industryGroupCode: "GOVERNMENT_PUBLIC_POLICY", keywords: ["policy"] },
  { code: "public_administration_officer", name: "Public Administration Officer", industryGroupCode: "GOVERNMENT_PUBLIC_POLICY", keywords: ["public administration"] },
  { code: "diplomat", name: "Diplomat", industryGroupCode: "GOVERNMENT_PUBLIC_POLICY", keywords: ["foreign service"] },
  { code: "ngo_program_officer", name: "NGO Program Officer", industryGroupCode: "GOVERNMENT_PUBLIC_POLICY", keywords: ["ngo"] },

  { code: "electrician", name: "Electrician", industryGroupCode: "SKILLED_TRADES_SERVICES", keywords: ["electrical trade"], isLicenseHeavy: true },
  { code: "hvac_technician", name: "HVAC Technician", industryGroupCode: "SKILLED_TRADES_SERVICES", keywords: ["hvac"], isLicenseHeavy: true },
  { code: "automotive_technician", name: "Automotive Technician", industryGroupCode: "SKILLED_TRADES_SERVICES", keywords: ["automotive"] },
  { code: "welder", name: "Welder", industryGroupCode: "SKILLED_TRADES_SERVICES", keywords: ["welding"], isCertificationHeavy: true },
  { code: "cnc_operator", name: "CNC Operator", industryGroupCode: "SKILLED_TRADES_SERVICES", keywords: ["cnc"] },
  { code: "chef", name: "Chef", industryGroupCode: "SKILLED_TRADES_SERVICES", keywords: ["culinary"] },
  { code: "hospitality_manager", name: "Hospitality Manager", industryGroupCode: "SKILLED_TRADES_SERVICES", keywords: ["hotel"] },

  { code: "founder", name: "Founder", industryGroupCode: "ENTREPRENEURSHIP_MANAGEMENT", keywords: ["startup"], isPortfolioHeavy: true },
  { code: "small_business_owner", name: "Small Business Owner", industryGroupCode: "ENTREPRENEURSHIP_MANAGEMENT", keywords: ["business owner"], isPortfolioHeavy: true },
  { code: "general_manager", name: "General Manager", industryGroupCode: "ENTREPRENEURSHIP_MANAGEMENT", keywords: ["manager"] },
  { code: "operations_director", name: "Operations Director", industryGroupCode: "ENTREPRENEURSHIP_MANAGEMENT", keywords: ["operations director"] },
  { code: "business_development_manager", name: "Business Development Manager", industryGroupCode: "ENTREPRENEURSHIP_MANAGEMENT", keywords: ["bd"] },

  { code: "student", name: "Student", industryGroupCode: "OTHER_GENERAL", keywords: ["student"] },
  { code: "general_professional", name: "General Professional", industryGroupCode: "OTHER_GENERAL", keywords: ["general"] },
  { code: "other_custom", name: "Other / Custom", industryGroupCode: "OTHER_GENERAL", keywords: ["other"] }
];

export const companyTierOptions: CompanyTierOption[] = [
  { code: "top_firm", label: "Top firm", multiplier: 1.4, validationFactor: 1.0 },
  { code: "top_20", label: "Top 20", multiplier: 1.32, validationFactor: 0.9 },
  { code: "top_50", label: "Top 50", multiplier: 1.25, validationFactor: 0.82 },
  { code: "top_100", label: "Top 100", multiplier: 1.15, validationFactor: 0.74 },
  { code: "sme", label: "SME", multiplier: 1.0, validationFactor: 0.6 },
  { code: "local_small_company", label: "Local small company", multiplier: 0.85, validationFactor: 0.5 }
];

export const seniorityLevelOptions: Array<ScoreOption<SeniorityLevelCode>> = [
  { code: "intern_trainee", label: "Intern / Trainee", score: 10 },
  { code: "junior", label: "Junior", score: 25 },
  { code: "associate", label: "Associate", score: 35 },
  { code: "senior_ic", label: "Senior individual contributor", score: 50 },
  { code: "lead", label: "Lead", score: 60 },
  { code: "manager", label: "Manager", score: 68 },
  { code: "senior_manager", label: "Senior Manager", score: 76 },
  { code: "director", label: "Director", score: 84 },
  { code: "head_of_function", label: "Head of Function", score: 90 },
  { code: "vp_partner_principal", label: "VP / Partner / Principal", score: 95 },
  { code: "c_level_owner", label: "C-level / Owner", score: 100 }
];

export const educationLevelOptions: Array<ScoreOption<EducationLevelCode>> = [
  { code: "high_school", label: "High school", score: 15 },
  { code: "vocational_diploma", label: "Vocational diploma", score: 25 },
  { code: "associate_degree", label: "Associate degree", score: 30 },
  { code: "bachelor_related", label: "Bachelor", score: 45 },
  { code: "bachelor_top_or_honors", label: "Bachelor - top school / honors", score: 55 },
  { code: "master_related", label: "Master", score: 65 },
  { code: "mba_professional_master", label: "MBA / professional master", score: 70 },
  { code: "phd_candidate", label: "PhD candidate", score: 80 },
  { code: "phd_completed", label: "PhD completed", score: 90 },
  { code: "postdoc_specialist", label: "Postdoc / specialist training", score: 95 },
  { code: "professor_recognized", label: "Professor / recognized academic", score: 100 }
];

export const educationRelevanceOptions: Array<ScoreOption<EducationRelevanceCode> & { multiplier: number }> = [
  { code: "unrelated", label: "Unrelated", score: 75, multiplier: 0.75 },
  { code: "partially_related", label: "Partially related", score: 90, multiplier: 0.9 },
  { code: "related", label: "Related", score: 100, multiplier: 1.0 },
  { code: "elite_or_highly_relevant", label: "Elite / highly relevant", score: 110, multiplier: 1.1 }
];

export const jobScoringProfiles: JobScoringProfile[] = [
  { code: "profile_finance_accounting_audit", industryGroupCode: "FINANCE_ACCOUNTING_AUDIT", experienceWeight: 0.3, seniorityWeight: 0.2, educationWeight: 0.1, certificationWeight: 0.4 },
  { code: "profile_banking_investment_risk", industryGroupCode: "BANKING_INVESTMENT_RISK", experienceWeight: 0.35, seniorityWeight: 0.25, educationWeight: 0.15, certificationWeight: 0.25 },
  { code: "profile_law_legal_compliance", industryGroupCode: "LAW_LEGAL_COMPLIANCE", experienceWeight: 0.25, seniorityWeight: 0.25, educationWeight: 0.1, certificationWeight: 0.4 },
  { code: "profile_medicine_healthcare", industryGroupCode: "MEDICINE_HEALTHCARE", experienceWeight: 0.2, seniorityWeight: 0.2, educationWeight: 0.15, certificationWeight: 0.45 },
  { code: "profile_tech_software", industryGroupCode: "TECH_SOFTWARE", experienceWeight: 0.35, seniorityWeight: 0.35, educationWeight: 0.15, certificationWeight: 0.15 },
  { code: "profile_data_ai", industryGroupCode: "DATA_AI", experienceWeight: 0.3, seniorityWeight: 0.25, educationWeight: 0.25, certificationWeight: 0.2 },
  { code: "profile_engineering_manufacturing", industryGroupCode: "ENGINEERING_MANUFACTURING", experienceWeight: 0.3, seniorityWeight: 0.25, educationWeight: 0.15, certificationWeight: 0.3 },
  { code: "profile_consulting_project_management", industryGroupCode: "CONSULTING_PROJECT_MANAGEMENT", experienceWeight: 0.3, seniorityWeight: 0.35, educationWeight: 0.1, certificationWeight: 0.25 },
  { code: "profile_education_research", industryGroupCode: "EDUCATION_RESEARCH", experienceWeight: 0.25, seniorityWeight: 0.2, educationWeight: 0.35, certificationWeight: 0.2 },
  { code: "profile_marketing_sales_growth", industryGroupCode: "MARKETING_SALES_GROWTH", experienceWeight: 0.3, seniorityWeight: 0.4, educationWeight: 0.1, certificationWeight: 0.2 },
  { code: "profile_operations_supply_chain", industryGroupCode: "OPERATIONS_SUPPLY_CHAIN", experienceWeight: 0.35, seniorityWeight: 0.3, educationWeight: 0.1, certificationWeight: 0.25 },
  { code: "profile_design_creative_media", industryGroupCode: "DESIGN_CREATIVE_MEDIA", experienceWeight: 0.25, seniorityWeight: 0.35, educationWeight: 0.1, certificationWeight: 0.3 },
  { code: "profile_hr_people", industryGroupCode: "HUMAN_RESOURCES_PEOPLE", experienceWeight: 0.3, seniorityWeight: 0.3, educationWeight: 0.1, certificationWeight: 0.3 },
  { code: "profile_government_public_policy", industryGroupCode: "GOVERNMENT_PUBLIC_POLICY", experienceWeight: 0.3, seniorityWeight: 0.3, educationWeight: 0.2, certificationWeight: 0.2 },
  { code: "profile_skilled_trades_services", industryGroupCode: "SKILLED_TRADES_SERVICES", experienceWeight: 0.3, seniorityWeight: 0.25, educationWeight: 0.1, certificationWeight: 0.35 },
  { code: "profile_entrepreneurship_management", industryGroupCode: "ENTREPRENEURSHIP_MANAGEMENT", experienceWeight: 0.25, seniorityWeight: 0.5, educationWeight: 0.1, certificationWeight: 0.15 },
  { code: "profile_other_general", industryGroupCode: "OTHER_GENERAL", experienceWeight: 0.3, seniorityWeight: 0.3, educationWeight: 0.2, certificationWeight: 0.2 }
];

const entryAssociateProfessionalExpert: CertificationStage[] = [
  { code: "entry", label: "Entry / foundation", score: 20 },
  { code: "associate", label: "Associate / Level I", score: 40 },
  { code: "professional", label: "Professional / Level II", score: 65 },
  { code: "expert", label: "Expert / Level III", score: 85 },
  { code: "elite", label: "Charterholder / elite", score: 95 }
];

const licenseStages: CertificationStage[] = [
  { code: "none", label: "No license", score: 0 },
  { code: "training", label: "In training", score: 25 },
  { code: "partial", label: "Exam partially passed", score: 45 },
  { code: "licensed", label: "Licensed", score: 75 },
  { code: "specialist", label: "Specialist / advanced license", score: 90 },
  { code: "recognized_senior", label: "Recognized senior license", score: 100 }
];

const portfolioStages: CertificationStage[] = [
  { code: "none", label: "No portfolio evidence", score: 0 },
  { code: "personal", label: "Small personal projects", score: 20 },
  { code: "shipped", label: "Real shipped work", score: 45 },
  { code: "production", label: "Production systems / paid clients", score: 65 },
  { code: "large_scale", label: "Large-scale responsibility", score: 80 },
  { code: "recognized", label: "Industry-recognized / leadership scope", score: 95 }
];

export const noneCertificationTrack: CertificationTrack = {
  code: "none",
  name: "None",
  industryGroupCodes: industryGroups.map((group) => group.code),
  measurementMode: "NONE",
  maxScore: 0,
  isInternational: false,
  description: "No certification or license."
};

export const localCertificationTrack: CertificationTrack = {
  code: "local_certification_license",
  name: "Local certification / license",
  industryGroupCodes: industryGroups.map((group) => group.code),
  measurementMode: "PERCENT_COMPLETE",
  maxScore: 85,
  isInternational: false,
  isLocal: true,
  localDirectoryHref: "/local-certifications.html",
  description: "User enters percentage complete. The pinned link is only a reference directory."
};

export const certificationTracks: CertificationTrack[] = [
  noneCertificationTrack,
  localCertificationTrack,

  { code: "acca", name: "ACCA", industryGroupCodes: ["FINANCE_ACCOUNTING_AUDIT"], professionCodes: ["auditor", "accountant", "tax_consultant", "financial_controller", "management_accountant", "internal_auditor"], measurementMode: "MODULE_PASSED", totalUnits: 13, maxScore: 95, isInternational: true },
  { code: "cpa_australia", name: "CPA Australia", industryGroupCodes: ["FINANCE_ACCOUNTING_AUDIT"], professionCodes: ["auditor", "accountant", "financial_controller", "management_accountant"], measurementMode: "MODULE_PASSED", totalUnits: 6, maxScore: 90, isInternational: true },
  { code: "cma", name: "CMA", industryGroupCodes: ["FINANCE_ACCOUNTING_AUDIT", "BANKING_INVESTMENT_RISK"], professionCodes: ["management_accountant", "financial_controller", "accountant", "investment_analyst"], measurementMode: "EXAM_PART_PASSED", totalUnits: 2, maxScore: 85, isInternational: true },
  { code: "cia", name: "CIA", industryGroupCodes: ["FINANCE_ACCOUNTING_AUDIT"], professionCodes: ["internal_auditor", "auditor"], measurementMode: "EXAM_PART_PASSED", totalUnits: 3, maxScore: 90, isInternational: true },
  { code: "cfa", name: "CFA", industryGroupCodes: ["BANKING_INVESTMENT_RISK", "FINANCE_ACCOUNTING_AUDIT"], professionCodes: ["investment_analyst", "equity_research_analyst", "portfolio_analyst", "risk_analyst", "financial_controller"], measurementMode: "LEVEL_PASSED", stages: [
    { code: "level_1", label: "Level I passed", score: 40 },
    { code: "level_2", label: "Level II passed", score: 65 },
    { code: "level_3", label: "Level III passed", score: 85 },
    { code: "charterholder", label: "Charterholder", score: 95 }
  ], maxScore: 95, isInternational: true },
  { code: "frm", name: "FRM", industryGroupCodes: ["BANKING_INVESTMENT_RISK"], professionCodes: ["risk_analyst", "credit_analyst", "treasury_analyst", "portfolio_analyst"], measurementMode: "EXAM_PART_PASSED", totalUnits: 2, maxScore: 90, isInternational: true },
  { code: "caia", name: "CAIA", industryGroupCodes: ["BANKING_INVESTMENT_RISK"], professionCodes: ["investment_analyst", "portfolio_analyst", "equity_research_analyst"], measurementMode: "LEVEL_PASSED", stages: [
    { code: "level_1", label: "Level I passed", score: 45 },
    { code: "level_2", label: "Level II passed", score: 75 },
    { code: "charterholder", label: "Charterholder", score: 90 }
  ], maxScore: 90, isInternational: true },

  { code: "aws_certification", name: "AWS Certification", industryGroupCodes: ["TECH_SOFTWARE", "DATA_AI"], professionCodes: ["cloud_engineer", "devops_engineer", "backend_engineer", "data_engineer", "machine_learning_engineer", "ai_engineer"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 90, isInternational: true },
  { code: "google_cloud_certification", name: "Google Cloud Certification", industryGroupCodes: ["TECH_SOFTWARE", "DATA_AI"], professionCodes: ["cloud_engineer", "devops_engineer", "data_engineer", "machine_learning_engineer"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 90, isInternational: true },
  { code: "azure_certification", name: "Microsoft Azure Certification", industryGroupCodes: ["TECH_SOFTWARE", "DATA_AI"], professionCodes: ["cloud_engineer", "devops_engineer", "data_engineer", "backend_engineer"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 90, isInternational: true },
  { code: "cisco_certification", name: "Cisco Certification", industryGroupCodes: ["TECH_SOFTWARE"], professionCodes: ["devops_engineer", "cloud_engineer", "cybersecurity_analyst"], measurementMode: "LEVEL_PASSED", stages: [
    { code: "ccst", label: "CCST / Entry", score: 25 },
    { code: "ccna", label: "CCNA / Associate", score: 45 },
    { code: "ccnp", label: "CCNP / Professional", score: 70 },
    { code: "ccie", label: "CCIE / Expert", score: 95 }
  ], maxScore: 95, isInternational: true },
  { code: "kubernetes_certification", name: "Kubernetes Certification", industryGroupCodes: ["TECH_SOFTWARE"], professionCodes: ["devops_engineer", "cloud_engineer", "backend_engineer"], measurementMode: "LEVEL_PASSED", stages: [
    { code: "kcna", label: "KCNA", score: 30 },
    { code: "cka", label: "CKA", score: 65 },
    { code: "ckad", label: "CKAD", score: 65 },
    { code: "cks", label: "CKS", score: 85 }
  ], maxScore: 85, isInternational: true },
  { code: "comptia_security_plus", name: "CompTIA Security+", industryGroupCodes: ["TECH_SOFTWARE"], professionCodes: ["cybersecurity_analyst", "qa_engineer"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed", score: 55 }], maxScore: 55, isInternational: true },
  { code: "cissp", name: "CISSP", industryGroupCodes: ["TECH_SOFTWARE"], professionCodes: ["cybersecurity_analyst"], measurementMode: "LEVEL_PASSED", stages: [{ code: "associate", label: "Associate", score: 55 }, { code: "certified", label: "Certified", score: 90 }], maxScore: 90, isInternational: true },
  { code: "cism", name: "CISM", industryGroupCodes: ["TECH_SOFTWARE"], professionCodes: ["cybersecurity_analyst"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed / Certified", score: 85 }], maxScore: 85, isInternational: true },
  { code: "oscp", name: "OSCP", industryGroupCodes: ["TECH_SOFTWARE"], professionCodes: ["cybersecurity_analyst"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed", score: 85 }], maxScore: 85, isInternational: true },

  { code: "google_data_analytics", name: "Google Data Analytics", industryGroupCodes: ["DATA_AI"], professionCodes: ["data_analyst", "bi_analyst"], measurementMode: "PERCENT_COMPLETE", maxScore: 65, isInternational: true },
  { code: "microsoft_power_bi_data", name: "Microsoft Data / Power BI Certification", industryGroupCodes: ["DATA_AI"], professionCodes: ["data_analyst", "bi_analyst", "data_engineer"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 85, isInternational: true },
  { code: "databricks_certification", name: "Databricks Certification", industryGroupCodes: ["DATA_AI"], professionCodes: ["data_engineer", "data_scientist", "machine_learning_engineer"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 85, isInternational: true },
  { code: "sas_certification", name: "SAS Certification", industryGroupCodes: ["DATA_AI"], professionCodes: ["data_analyst", "data_scientist"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 80, isInternational: true },
  { code: "tensorflow_ml_certificate", name: "TensorFlow / ML Certificate", industryGroupCodes: ["DATA_AI"], professionCodes: ["machine_learning_engineer", "ai_engineer", "data_scientist"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed", score: 70 }], maxScore: 70, isInternational: true },

  { code: "fe_pe_engineering", name: "FE / PE Engineering License", industryGroupCodes: ["ENGINEERING_MANUFACTURING"], professionCodes: ["mechanical_engineer", "electrical_engineer", "civil_engineer", "chemical_engineer", "industrial_engineer", "manufacturing_engineer"], measurementMode: "LICENSE_STAGE", stages: licenseStages, maxScore: 100, isInternational: true },
  { code: "six_sigma", name: "Six Sigma", industryGroupCodes: ["ENGINEERING_MANUFACTURING", "CONSULTING_PROJECT_MANAGEMENT", "OPERATIONS_SUPPLY_CHAIN"], professionCodes: ["quality_engineer", "industrial_engineer", "manufacturing_engineer", "project_manager", "operations_analyst", "supply_chain_planner"], measurementMode: "LEVEL_PASSED", stages: [
    { code: "yellow", label: "Yellow Belt", score: 25 },
    { code: "green", label: "Green Belt", score: 50 },
    { code: "black", label: "Black Belt", score: 80 },
    { code: "master_black", label: "Master Black Belt", score: 95 }
  ], maxScore: 95, isInternational: true },
  { code: "nebosh_iosh", name: "NEBOSH / IOSH", industryGroupCodes: ["ENGINEERING_MANUFACTURING", "SKILLED_TRADES_SERVICES"], professionCodes: ["quality_engineer", "manufacturing_engineer", "civil_engineer", "hvac_technician", "electrician"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 85, isInternational: true },

  { code: "bar_license", name: "Bar / Legal Practice License", industryGroupCodes: ["LAW_LEGAL_COMPLIANCE"], professionCodes: ["lawyer", "legal_counsel", "ip_lawyer"], measurementMode: "LICENSE_STAGE", stages: licenseStages, maxScore: 100, isInternational: false },
  { code: "cipp_privacy", name: "CIPP / Privacy Certification", industryGroupCodes: ["LAW_LEGAL_COMPLIANCE"], professionCodes: ["lawyer", "legal_counsel", "compliance_officer"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed / Certified", score: 75 }], maxScore: 75, isInternational: true },
  { code: "cams_aml", name: "CAMS / AML Certification", industryGroupCodes: ["LAW_LEGAL_COMPLIANCE", "BANKING_INVESTMENT_RISK"], professionCodes: ["compliance_officer", "risk_analyst", "corporate_banker"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed / Certified", score: 80 }], maxScore: 80, isInternational: true },

  { code: "usmle", name: "USMLE", industryGroupCodes: ["MEDICINE_HEALTHCARE"], professionCodes: ["doctor"], measurementMode: "LICENSE_STAGE", stages: [
    { code: "step_1", label: "Step 1 passed", score: 35 },
    { code: "step_2", label: "Step 2 CK passed", score: 55 },
    { code: "step_3", label: "Step 3 passed", score: 75 },
    { code: "licensed", label: "Licensed", score: 85 },
    { code: "board_certified", label: "Specialist / board certified", score: 95 }
  ], maxScore: 95, isInternational: true },
  { code: "plab_uk", name: "PLAB / UK Medical Route", industryGroupCodes: ["MEDICINE_HEALTHCARE"], professionCodes: ["doctor"], measurementMode: "LICENSE_STAGE", stages: licenseStages, maxScore: 90, isInternational: true },
  { code: "mrcp_mrcs", name: "MRCP / MRCS", industryGroupCodes: ["MEDICINE_HEALTHCARE"], professionCodes: ["doctor"], measurementMode: "EXAM_PART_PASSED", totalUnits: 3, maxScore: 90, isInternational: true },
  { code: "nclex", name: "NCLEX-RN / NCLEX-PN", industryGroupCodes: ["MEDICINE_HEALTHCARE"], professionCodes: ["nurse"], measurementMode: "LICENSE_STAGE", stages: licenseStages, maxScore: 90, isInternational: true },

  { code: "teaching_license", name: "Teaching License", industryGroupCodes: ["EDUCATION_RESEARCH"], professionCodes: ["teacher", "lecturer"], measurementMode: "LICENSE_STAGE", stages: licenseStages, maxScore: 90, isInternational: false },
  { code: "tesol_tefl_celta", name: "TESOL / TEFL / CELTA", industryGroupCodes: ["EDUCATION_RESEARCH"], professionCodes: ["teacher", "lecturer", "education_program_manager"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 75, isInternational: true },
  { code: "academic_degree_track", name: "Academic Degree Track", industryGroupCodes: ["EDUCATION_RESEARCH"], professionCodes: ["lecturer", "research_assistant", "research_scientist", "academic_researcher"], measurementMode: "LEVEL_PASSED", stages: [
    { code: "bachelor", label: "Bachelor", score: 35 },
    { code: "master", label: "Master", score: 55 },
    { code: "phd_candidate", label: "PhD candidate", score: 70 },
    { code: "phd", label: "PhD", score: 85 },
    { code: "professor", label: "Professor / recognized academic", score: 100 }
  ], maxScore: 100, isInternational: true },
  { code: "research_output_track", name: "Research Output Track", industryGroupCodes: ["EDUCATION_RESEARCH", "DATA_AI"], professionCodes: ["research_scientist", "academic_researcher", "research_scientist_ai"], measurementMode: "PORTFOLIO_SCOPE", stages: portfolioStages, maxScore: 95, isInternational: true },

  { code: "pmp", name: "PMP", industryGroupCodes: ["CONSULTING_PROJECT_MANAGEMENT", "ENGINEERING_MANUFACTURING", "OPERATIONS_SUPPLY_CHAIN", "ENTREPRENEURSHIP_MANAGEMENT"], professionCodes: ["project_manager", "program_manager", "management_consultant", "operations_director", "general_manager", "supply_chain_planner"], measurementMode: "LEVEL_PASSED", stages: [{ code: "capm", label: "CAPM", score: 45 }, { code: "pmp", label: "PMP", score: 80 }, { code: "pgmp", label: "PgMP", score: 95 }], maxScore: 95, isInternational: true },
  { code: "scrum_master", name: "Scrum Master", industryGroupCodes: ["CONSULTING_PROJECT_MANAGEMENT", "TECH_SOFTWARE"], professionCodes: ["product_manager", "project_manager", "program_manager", "business_analyst"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 75, isInternational: true },

  { code: "google_ads", name: "Google Ads Certification", industryGroupCodes: ["MARKETING_SALES_GROWTH"], professionCodes: ["digital_marketer", "growth_marketer", "seo_specialist"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed", score: 60 }], maxScore: 60, isInternational: true },
  { code: "google_analytics", name: "Google Analytics Certification", industryGroupCodes: ["MARKETING_SALES_GROWTH", "DATA_AI"], professionCodes: ["digital_marketer", "growth_marketer", "data_analyst"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed", score: 60 }], maxScore: 60, isInternational: true },
  { code: "meta_blueprint", name: "Meta Blueprint", industryGroupCodes: ["MARKETING_SALES_GROWTH"], professionCodes: ["digital_marketer", "growth_marketer", "brand_manager"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 70, isInternational: true },
  { code: "hubspot_certification", name: "HubSpot Certification", industryGroupCodes: ["MARKETING_SALES_GROWTH"], professionCodes: ["digital_marketer", "sales_representative", "account_executive", "customer_success_manager"], measurementMode: "PERCENT_COMPLETE", maxScore: 65, isInternational: true },
  { code: "salesforce_certification", name: "Salesforce Certification", industryGroupCodes: ["MARKETING_SALES_GROWTH"], professionCodes: ["sales_representative", "account_executive", "customer_success_manager"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 80, isInternational: true },

  { code: "ascm_cpim", name: "ASCM / APICS CPIM", industryGroupCodes: ["OPERATIONS_SUPPLY_CHAIN"], professionCodes: ["supply_chain_planner", "demand_planner", "operations_analyst"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 85, isInternational: true },
  { code: "cscp", name: "CSCP", industryGroupCodes: ["OPERATIONS_SUPPLY_CHAIN"], professionCodes: ["supply_chain_planner", "procurement_specialist", "demand_planner"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed / Certified", score: 85 }], maxScore: 85, isInternational: true },
  { code: "cltd", name: "CLTD", industryGroupCodes: ["OPERATIONS_SUPPLY_CHAIN"], professionCodes: ["logistics_coordinator", "warehouse_manager"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed / Certified", score: 80 }], maxScore: 80, isInternational: true },
  { code: "cips_procurement", name: "CIPS Procurement", industryGroupCodes: ["OPERATIONS_SUPPLY_CHAIN"], professionCodes: ["procurement_specialist"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 85, isInternational: true },

  { code: "adobe_certified_professional", name: "Adobe Certified Professional", industryGroupCodes: ["DESIGN_CREATIVE_MEDIA"], professionCodes: ["graphic_designer", "video_editor", "content_creator"], measurementMode: "LEVEL_PASSED", stages: [{ code: "passed", label: "Passed / Certified", score: 60 }], maxScore: 60, isInternational: true },
  { code: "google_ux_design", name: "Google UX Design", industryGroupCodes: ["DESIGN_CREATIVE_MEDIA"], professionCodes: ["ui_ux_designer", "product_designer"], measurementMode: "PERCENT_COMPLETE", maxScore: 65, isInternational: true },
  { code: "creative_portfolio", name: "Portfolio Track", industryGroupCodes: ["DESIGN_CREATIVE_MEDIA", "TECH_SOFTWARE", "ENTREPRENEURSHIP_MANAGEMENT"], professionCodes: ["ui_ux_designer", "product_designer", "graphic_designer", "video_editor", "content_creator", "game_designer", "software_engineer", "founder", "small_business_owner"], measurementMode: "PORTFOLIO_SCOPE", stages: portfolioStages, maxScore: 95, isInternational: true },

  { code: "shrm", name: "SHRM-CP / SHRM-SCP", industryGroupCodes: ["HUMAN_RESOURCES_PEOPLE"], professionCodes: ["hr_generalist", "hr_business_partner", "recruiter", "compensation_benefits_specialist", "learning_development_specialist"], measurementMode: "LEVEL_PASSED", stages: [{ code: "shrm_cp", label: "SHRM-CP", score: 70 }, { code: "shrm_scp", label: "SHRM-SCP", score: 90 }], maxScore: 90, isInternational: true },
  { code: "hrci", name: "HRCI", industryGroupCodes: ["HUMAN_RESOURCES_PEOPLE"], professionCodes: ["hr_generalist", "hr_business_partner", "compensation_benefits_specialist"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 85, isInternational: true },
  { code: "cipd", name: "CIPD", industryGroupCodes: ["HUMAN_RESOURCES_PEOPLE"], professionCodes: ["hr_generalist", "hr_business_partner", "learning_development_specialist"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 85, isInternational: true },

  { code: "civil_service_exam", name: "Civil Service Exam / Administrative Rank", industryGroupCodes: ["GOVERNMENT_PUBLIC_POLICY"], professionCodes: ["civil_servant", "public_administration_officer", "diplomat", "policy_analyst"], measurementMode: "LICENSE_STAGE", stages: licenseStages, maxScore: 90, isInternational: false },
  { code: "public_policy_degree", name: "Public Policy / Public Administration Degree", industryGroupCodes: ["GOVERNMENT_PUBLIC_POLICY"], professionCodes: ["policy_analyst", "public_administration_officer", "ngo_program_officer"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 80, isInternational: true },
  { code: "language_proficiency", name: "Language Proficiency", industryGroupCodes: ["GOVERNMENT_PUBLIC_POLICY", "EDUCATION_RESEARCH"], professionCodes: ["diplomat", "teacher", "ngo_program_officer"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 70, isInternational: true },

  { code: "trade_license", name: "Trade License", industryGroupCodes: ["SKILLED_TRADES_SERVICES"], professionCodes: ["electrician", "hvac_technician", "automotive_technician", "welder", "cnc_operator"], measurementMode: "LICENSE_STAGE", stages: licenseStages, maxScore: 95, isInternational: false },
  { code: "welding_certification", name: "Welding Certification", industryGroupCodes: ["SKILLED_TRADES_SERVICES"], professionCodes: ["welder"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 85, isInternational: true },
  { code: "automotive_certification", name: "Automotive Certification", industryGroupCodes: ["SKILLED_TRADES_SERVICES"], professionCodes: ["automotive_technician"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 80, isInternational: true },
  { code: "culinary_hospitality_certification", name: "Chef / Hospitality Certification", industryGroupCodes: ["SKILLED_TRADES_SERVICES"], professionCodes: ["chef", "hospitality_manager"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 80, isInternational: true },

  { code: "mba_business_degree", name: "MBA / Business Degree", industryGroupCodes: ["ENTREPRENEURSHIP_MANAGEMENT", "CONSULTING_PROJECT_MANAGEMENT"], professionCodes: ["founder", "small_business_owner", "general_manager", "business_development_manager", "management_consultant"], measurementMode: "LEVEL_PASSED", stages: entryAssociateProfessionalExpert, maxScore: 80, isInternational: true },
  { code: "founder_business_scale", name: "Founder Business Scale", industryGroupCodes: ["ENTREPRENEURSHIP_MANAGEMENT"], professionCodes: ["founder", "small_business_owner"], measurementMode: "PORTFOLIO_SCOPE", stages: portfolioStages, maxScore: 95, isInternational: true }
];

export const professionOptions = professions
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((profession) => ({
    value: profession.code,
    label: profession.name,
    industryGroupCode: profession.industryGroupCode
  }));

export function normalizeProfessionCode(code: string | null | undefined) {
  if (!code) return "general_professional";
  const legacyMap: Record<string, string> = {
    general: "general_professional",
    developer: "software_engineer",
    finance_analyst: "investment_analyst",
    consultant: "management_consultant"
  };
  return legacyMap[code] ?? code;
}

export function normalizeCompanyTier(code: string | null | undefined): CompanyTierCode {
  const legacyMap: Record<string, CompanyTierCode> = {
    smes: "sme",
    sme: "sme"
  };
  const normalized = legacyMap[String(code ?? "")] ?? code;
  if (companyTierOptions.some((item) => item.code === normalized)) return normalized as CompanyTierCode;
  return "sme";
}

export function getProfession(code: string | null | undefined) {
  const normalizedCode = normalizeProfessionCode(code);
  return professions.find((profession) => profession.code === normalizedCode) ?? professions.find((profession) => profession.code === "general_professional")!;
}

export function getIndustryGroup(code: string | null | undefined) {
  return industryGroups.find((group) => group.code === code) ?? industryGroups.find((group) => group.code === "OTHER_GENERAL")!;
}

export function getJobScoringProfile(industryGroupCode: IndustryGroupCode | string | null | undefined) {
  return jobScoringProfiles.find((profile) => profile.industryGroupCode === industryGroupCode) ?? jobScoringProfiles.find((profile) => profile.industryGroupCode === "OTHER_GENERAL")!;
}

export function getCompanyTier(code: string | null | undefined) {
  const normalized = normalizeCompanyTier(code);
  return companyTierOptions.find((item) => item.code === normalized) ?? companyTierOptions.find((item) => item.code === "sme")!;
}

export function getCertificationTracksForProfession(professionCode: string | null | undefined) {
  const profession = getProfession(professionCode);
  const directMatches = certificationTracks.filter((track) => {
    if (track.isLocal) return true;
    if (track.professionCodes?.includes(profession.code)) return true;
    return !track.professionCodes?.length && track.industryGroupCodes.includes(profession.industryGroupCode);
  });

  const deduped = new Map<string, CertificationTrack>();
  for (const track of directMatches) deduped.set(track.code, track);

  return Array.from(deduped.values()).sort((a, b) => {
    if (a.code === "none") return -1;
    if (b.code === "none") return 1;
    if (a.isLocal && !b.isLocal) return 1;
    if (!a.isLocal && b.isLocal) return -1;
    return a.name.localeCompare(b.name);
  });
}

export function getCertificationTrack(code: string | null | undefined, professionCode?: string | null) {
  const tracks = getCertificationTracksForProfession(professionCode);
  return tracks.find((track) => track.code === code) ?? noneCertificationTrack;
}

export function getScoreOptionScore<T extends string>(options: Array<ScoreOption<T>>, code: string | null | undefined, fallbackCode: T) {
  return options.find((option) => option.code === code)?.score ?? options.find((option) => option.code === fallbackCode)?.score ?? 0;
}

export function getEducationRelevanceMultiplier(code: string | null | undefined) {
  return educationRelevanceOptions.find((option) => option.code === code)?.multiplier ?? 1;
}

export function getCertificationProgressLabel(track: CertificationTrack) {
  switch (track.measurementMode) {
    case "NONE":
      return "No certification progress";
    case "MODULE_PASSED":
      return `Modules passed / ${track.totalUnits ?? 1}`;
    case "EXAM_PART_PASSED":
      return `Exam parts passed / ${track.totalUnits ?? 1}`;
    case "PERCENT_COMPLETE":
      return "Percentage complete";
    case "LICENSE_STAGE":
      return "License stage";
    case "LEVEL_PASSED":
      return "Level passed";
    case "PORTFOLIO_SCOPE":
      return "Portfolio / business scope";
    default:
      return "Progress";
  }
}

export function buildLocalCertificationHref(_countryCode: string | null | undefined, _professionCode: string | null | undefined) {
  return localCertificationTrack.localDirectoryHref ?? "/local-certifications.html";
}
