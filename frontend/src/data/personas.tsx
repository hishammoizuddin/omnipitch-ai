import type { ReactNode } from 'react';
import {
    Briefcase, Code, Presentation, ChartBar, Shield, User, Megaphone, Scale,
    Database, Server, Smartphone, Cpu, Network, PenTool, Globe, Target, TrendingUp,
    Layers, HardDrive, Lock, Activity, Users, Settings, Zap, Compass, Anchor, Layout,
    MessageSquare, Terminal, Cloud, CheckSquare, Component
} from 'lucide-react';

export interface Persona {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    color: string;
}

// Minimal Palantir-like colors: High contrast, stark slate/cyan/indigo/emerald/rose against dark bg
const palette = [
    'from-slate-600 to-slate-800',
    'from-indigo-600 to-indigo-900',
    'from-emerald-600 to-emerald-900',
    'from-rose-600 to-rose-900',
    'from-cyan-600 to-cyan-900',
    'from-violet-600 to-violet-900',
    'from-amber-600 to-amber-900',
    'from-blue-600 to-blue-900',
];

const getIcon = (type: string, className: string) => {
    switch (type) {
        case 'exec': return <Briefcase className={className} />;
        case 'tech': return <Code className={className} />;
        case 'sales': return <Presentation className={className} />;
        case 'pm': return <ChartBar className={className} />;
        case 'sec': return <Shield className={className} />;
        case 'data': return <Database className={className} />;
        case 'product': return <Target className={className} />;
        case 'marketing': return <Megaphone className={className} />;
        case 'legal': return <Scale className={className} />;
        case 'infra': return <Server className={className} />;
        case 'mobile': return <Smartphone className={className} />;
        case 'hardware': return <Cpu className={className} />;
        case 'network': return <Network className={className} />;
        case 'design': return <PenTool className={className} />;
        case 'global': return <Globe className={className} />;
        case 'growth': return <TrendingUp className={className} />;
        case 'arch': return <Layers className={className} />;
        case 'storage': return <HardDrive className={className} />;
        case 'auth': return <Lock className={className} />;
        case 'ops': return <Activity className={className} />;
        case 'hr': return <Users className={className} />;
        case 'admin': return <Settings className={className} />;
        case 'fast': return <Zap className={className} />;
        case 'strategy': return <Compass className={className} />;
        case 'core': return <Anchor className={className} />;
        case 'ui': return <Layout className={className} />;
        case 'comms': return <MessageSquare className={className} />;
        case 'cli': return <Terminal className={className} />;
        case 'cloud': return <Cloud className={className} />;
        case 'qa': return <CheckSquare className={className} />;
        case 'api': return <Component className={className} />;
        default: return <User className={className} />;
    }
};

const rawPersonas = [
    { id: 'c_suite', title: 'C-Suite Executive', desc: 'High-level ROI, capital allocation, and total business value focus.', type: 'exec', color: 0 },
    { id: 'ceo', title: 'Chief Executive Officer', desc: 'Overall corporate strategy, market positioning, and growth.', type: 'strategy', color: 1 },
    { id: 'cto', title: 'Chief Technology Officer', desc: 'Long-term technology vision and R&D investment strategy.', type: 'tech', color: 4 },
    { id: 'cfo', title: 'Chief Financial Officer', desc: 'Financial modeling, margin analysis, and cost optimization.', type: 'growth', color: 6 },
    { id: 'ciso', title: 'Chief Info Security Officer', desc: 'Enterprise risk, cyber threats, and security governance.', type: 'sec', color: 3 },
    { id: 'coo', title: 'Chief Operating Officer', desc: 'Operational efficiency, supply chain, and process scaling.', type: 'ops', color: 7 },
    { id: 'cmo', title: 'Chief Marketing Officer', desc: 'Brand equity, customer acquisition costs, and market share.', type: 'marketing', color: 5 },
    { id: 'cro', title: 'Chief Revenue Officer', desc: 'Sales pipeline, revenue forecasting, and field operations.', type: 'sales', color: 6 },

    // Engineering Leadership
    { id: 'vp_eng', title: 'VP of Engineering', desc: 'Engineering velocity, organizational structure, and tech debt.', type: 'arch', color: 1 },
    { id: 'dir_eng', title: 'Director of Engineering', desc: 'Cross-team delivery, agile maturity, and system reliability.', type: 'tech', color: 1 },
    { id: 'head_arch', title: 'Head of Architecture', desc: 'Enterprise architecture standards, macro-patterns.', type: 'layers', color: 2 },
    { id: 'eng_mgr', title: 'Engineering Manager', desc: 'Sprint execution, team health, and tactical unblocking.', type: 'users', color: 7 },

    // Core Engineering
    { id: 'prin_swe', title: 'Principal Software Eng', desc: 'Complex system design, deep technical problem solving.', type: 'tech', color: 4 },
    { id: 'staff_swe', title: 'Staff Software Engineer', desc: 'Multi-service architecture and technical leadership.', type: 'tech', color: 4 },
    { id: 'sr_swe', title: 'Senior Software Engineer', desc: 'Feature implementation, code review, and system optimization.', type: 'cli', color: 0 },
    { id: 'backend_dev', title: 'Backend Developer', desc: 'API design, database interactions, and server logic.', type: 'api', color: 0 },
    { id: 'frontend_dev', title: 'Frontend Developer', desc: 'Client-side architecture, state management, and UI logic.', type: 'ui', color: 4 },
    { id: 'fullstack_dev', title: 'Fullstack Developer', desc: 'End-to-end feature delivery across the stack.', type: 'code', color: 1 },
    { id: 'mobile_dev', title: 'Mobile Developer', desc: 'iOS/Android app performance and native integrations.', type: 'mobile', color: 5 },

    // Cloud & Infrastructure
    { id: 'cloud_arch', title: 'Cloud Architect', desc: 'AWS/GCP/Azure topology, cost optimization, and multi-cloud.', type: 'cloud', color: 7 },
    { id: 'devops_eng', title: 'DevOps Engineer', desc: 'CI/CD pipelines, containerization, and deployment automation.', type: 'fast', color: 2 },
    { id: 'sre', title: 'Site Reliability Eng', desc: 'SLAs/SLOs, incident response, and infrastructure monitoring.', type: 'ops', color: 3 },
    { id: 'platform_eng', title: 'Platform Engineer', desc: 'Internal developer portals and golden path tooling.', type: 'infra', color: 1 },
    { id: 'sys_admin', title: 'Systems Administrator', desc: 'Local and internal network management and hardware.', type: 'admin', color: 0 },
    { id: 'network_eng', title: 'Network Engineer', desc: 'Routing, switching, firewalls, and network latency.', type: 'network', color: 5 },
    { id: 'db_admin', title: 'Database Administrator', desc: 'Query performance, backups, replication, and sharding.', type: 'storage', color: 6 },

    // Data & AI
    { id: 'vp_data', title: 'VP of Data', desc: 'Data governance, warehouse strategy, and ML investment.', type: 'data', color: 1 },
    { id: 'data_sci', title: 'Data Scientist', desc: 'Predictive modeling, statistical analysis, and ML training.', type: 'tech', color: 5 },
    { id: 'data_eng', title: 'Data Engineer', desc: 'ETL pipelines, data lakes, and stream processing.', type: 'database', color: 7 },
    { id: 'ml_eng', title: 'Machine Learning Eng', desc: 'Model deployment, MLOps, and inference optimization.', type: 'fast', color: 4 },
    { id: 'ai_researcher', title: 'AI Researcher', desc: 'Transformer architectures, LLM fine-tuning, and R&D.', type: 'tech', color: 2 },
    { id: 'bi_analyst', title: 'Business Intel Analyst', desc: 'Dashboards, reporting, and business metric extraction.', type: 'chartbar', color: 6 },
    { id: 'data_arch', title: 'Data Architect', desc: 'Schema design, data modeling, and master data management.', type: 'arch', color: 1 },

    // Security & Compliance
    { id: 'sec_arch', title: 'Security Architect', desc: 'Zero-trust design, identity access management, and crypto.', type: 'auth', color: 3 },
    { id: 'app_sec', title: 'Application Security Eng', desc: 'SAST/DAST, vulnerability scanning, and secure coding.', type: 'sec', color: 3 },
    { id: 'sec_ops', title: 'SecOps Analyst', desc: 'Threat hunting, SIEM monitoring, and incident triage.', type: 'target', color: 3 },
    { id: 'pen_tester', title: 'Penetration Tester', desc: 'Red teaming, exploit development, and vulnerability assessment.', type: 'fast', color: 3 },
    { id: 'compliance_officer', title: 'Compliance Officer', desc: 'SOC2, HIPAA, GDPR adherence and audit management.', type: 'scale', color: 0 },
    { id: 'privacy_eng', title: 'Privacy Engineer', desc: 'Data anonymization, consent management, and PII tracing.', type: 'lock', color: 0 },

    // Product & Design
    { id: 'vp_product', title: 'VP of Product', desc: 'Product portfolio strategy and market fit expansion.', type: 'product', color: 5 },
    { id: 'dir_product', title: 'Director of Product', desc: 'Roadmap alignment, resource allocation across product lines.', type: 'product', color: 5 },
    { id: 'prod_mgr', title: 'Product Manager', desc: 'User stories, sprint planning, and feature prioritization.', type: 'users', color: 1 },
    { id: 'tech_pm', title: 'Technical Product Mgr', desc: 'API products, developer experience, and backend features.', type: 'api', color: 4 },
    { id: 'vp_design', title: 'VP of Design', desc: 'Design systems, brand identity, and total user experience.', type: 'design', color: 6 },
    { id: 'ux_researcher', title: 'UX Researcher', desc: 'User testing, empathy mapping, and behavioral analysis.', type: 'search', color: 6 },
    { id: 'ui_designer', title: 'UI Designer', desc: 'Prototyping, visual hierarchy, and component design.', type: 'layout', color: 5 },
    { id: 'prod_designer', title: 'Product Designer', desc: 'End-to-end user flows and interaction design.', type: 'design', color: 4 },

    // Quality & Testing
    { id: 'qa_mgr', title: 'QA Manager', desc: 'Quality processes, test coverage metrics, and release gating.', type: 'qa', color: 2 },
    { id: 'sdet', title: 'SDET', desc: 'Test automation frameworks and end-to-end integration tests.', type: 'code', color: 2 },
    { id: 'perf_eng', title: 'Performance Engineer', desc: 'Load testing, profiling, and latency reduction.', type: 'fast', color: 3 },
    { id: 'qa_analyst', title: 'QA Analyst', desc: 'Manual exploratory testing and bug reproduction.', type: 'qa', color: 0 },

    // Sales & Go-To-Market
    { id: 'vp_sales', title: 'VP of Sales', desc: 'Territory planning, quota setting, and sales methodology.', type: 'growth', color: 6 },
    { id: 'sales_eng', title: 'Sales Engineer / SE', desc: 'Technical proofs-of-concept, demos, and architecture validation.', type: 'arch', color: 4 },
    { id: 'sol_arch', title: 'Solutions Architect', desc: 'Post-sales integration, reference architectures, and client tech.', type: 'arch', color: 1 },
    { id: 'ent_ae', title: 'Enterprise Account Exec', desc: 'Complex deal cycles, stakeholder management, and negotiations.', type: 'sales', color: 6 },
    { id: 'sdr', title: 'Sales Dev Rep', desc: 'Outbound prospecting, lead qualification, and pipeline generation.', type: 'comms', color: 6 },
    { id: 'rev_ops', title: 'Revenue Operations', desc: 'CRM hygiene, sales tooling, and pipeline analytics.', type: 'ops', color: 7 },
    { id: 'partner_mgr', title: 'Channel Partner Mgr', desc: 'Reseller enablement, strategic alliances, and integrations.', type: 'global', color: 5 },

    // Marketing
    { id: 'prod_mktg', title: 'Product Marketing Mgr', desc: 'Positioning, messaging, competitive intel, and launch strategy.', type: 'marketing', color: 5 },
    { id: 'growth_mktg', title: 'Growth Marketer', desc: 'A/B testing, conversion rate optimization, and paid acquisition.', type: 'growth', color: 6 },
    { id: 'content_mktg', title: 'Content Strategist', desc: 'Technical blogs, whitepapers, and thought leadership.', type: 'pen', color: 0 },
    { id: 'dev_rel', title: 'Developer Advocate', desc: 'Community building, OSS contributions, and developer tutorials.', type: 'code', color: 4 },
    { id: 'seo_mgr', title: 'SEO Manager', desc: 'Organic search visibility, site hierarchy, and technical SEO.', type: 'search', color: 2 },
    { id: 'event_mgr', title: 'Field Marketing Mgr', desc: 'Conferences, tradeshows, and regional pipeline generation.', type: 'globe', color: 5 },

    // Customer Success & Support
    { id: 'vp_cs', title: 'VP of Customer Success', desc: 'Net Revenue Retention (NRR), churn mitigation, and account health.', type: 'users', color: 1 },
    { id: 'csm', title: 'Customer Success Mgr', desc: 'Onboarding, quarterly business reviews, and adoption metrics.', type: 'users', color: 1 },
    { id: 'tech_supp_eng', title: 'Tech Support Engineer', desc: 'Ticket escalation, log analysis, and deep troubleshooting.', type: 'cli', color: 0 },
    { id: 'supp_mgr', title: 'Support Manager', desc: 'Time-to-resolution metrics, support tiers, and knowledge base.', type: 'settings', color: 0 },
    { id: 'implem_mgr', title: 'Implementation Mgr', desc: 'Project timelines, client data migration, and go-live orchestration.', type: 'pm', color: 2 },

    // Finance & Legal
    { id: 'fin_analyst', title: 'Financial Analyst', desc: 'Budget variant analysis, SaaS metrics (CAC, LTV), and OPEX.', type: 'chartbar', color: 6 },
    { id: 'controller', title: 'Corporate Controller', desc: 'Accounting standards, payroll, and audit readiness.', type: 'scale', color: 0 },
    { id: 'gen_counsel', title: 'General Counsel', desc: 'Corporate law, M&A due diligence, and risk management.', type: 'legal', color: 0 },
    { id: 'contracts_mgr', title: 'Contracts Manager', desc: 'Vendor agreements, NDA review, and procurement terms.', type: 'pen', color: 0 },
    { id: 'ip_lawyer', title: 'IP Attorney', desc: 'Patent filings, trademark protection, and open source licenses.', type: 'lock', color: 0 },

    // HR & Operations
    { id: 'vp_hr', title: 'VP of Human Resources', desc: 'Talent strategy, comp bands, and organizational culture.', type: 'users', color: 5 },
    { id: 'tech_recruiter', title: 'Technical Recruiter', desc: 'Sourcing engineering talent, pipeline velocity, and candidate tech screening.', type: 'search', color: 5 },
    { id: 'hrbp', title: 'HR Business Partner', desc: 'Manager coaching, employee relations, and performance calibration.', type: 'users', color: 5 },
    { id: 'it_mgr', title: 'IT Manager', desc: 'Endpoint management, SaaS provisioning, and internal helpdesk.', type: 'admin', color: 0 },
    { id: 'facil_mgr', title: 'Facilities Manager', desc: 'Real estate footprint, office logistics, and physical security.', type: 'core', color: 0 },

    // Consulting & Professional Services
    { id: 'mgmt_consultant', title: 'Management Consultant', desc: 'Digital transformation, org design, and strategic advisory.', type: 'strategy', color: 1 },
    { id: 'agile_coach', title: 'Agile Coach', desc: 'Scrum/Kanban implementation, velocity tracking, and ceremonies.', type: 'users', color: 2 },
    { id: 'sol_consultant', title: 'Solutions Consultant', desc: 'Custom implementations, SOW scoping, and billable delivery.', type: 'pm', color: 4 },
    { id: 'change_mgr', title: 'Change Manager', desc: 'Stakeholder alignment, training rollouts, and adoption curves.', type: 'settings', color: 6 },
    { id: 'erp_consultant', title: 'ERP Consultant', desc: 'SAP/Oracle implementations, financial workflows, and supply chain.', type: 'database', color: 7 },

    // Specialized Tech / Vertical
    { id: 'blockchain_eng', title: 'Blockchain Engineer', desc: 'Smart contracts, consensus mechanisms, and Web3 architectures.', type: 'network', color: 4 },
    { id: 'iot_arch', title: 'IoT Architect', desc: 'Edge computing, sensor telemetry, and low-latency protocols.', type: 'hardware', color: 2 },
    { id: 'robotics_eng', title: 'Robotics Engineer', desc: 'Kinematics, computer vision, and autonomous navigation.', type: 'hardware', color: 5 },
    { id: 'quant_research', title: 'Quantitative Researcher', desc: 'Algorithmic trading, complex math models, and high-frequency execution.', type: 'tech', color: 6 },
    { id: 'bioinfo', title: 'Bioinformatician', desc: 'Genomic data pipelines, computational biology, and sequence analysis.', type: 'data', color: 2 },

    // Miscellaneous
    { id: 'founder', title: 'Startup Founder', desc: 'Vision, fundraising, product-market fit, and survival.', type: 'strategy', color: 1 },
    { id: 'investor', title: 'Venture Capitalist', desc: 'TAM analysis, competitive moats, and exit multiples.', type: 'growth', color: 6 },
    { id: 'auditor', title: 'IT Auditor', desc: 'Access controls, change management logs, and compliance verification.', type: 'scale', color: 0 },
    { id: 'sys_integrator', title: 'Systems Integrator', desc: 'Connecting legacy on-prem systems with cloud-native APIs.', type: 'network', color: 4 },
    { id: 'tech_writer', title: 'Technical Writer', desc: 'API documentation, user manuals, and knowledge base architecture.', type: 'pen', color: 0 },
    { id: 'l1_support', title: 'L1 Helpdesk Analyst', desc: 'Password resets, basic triage, and ticket routing.', type: 'cli', color: 0 },
    { id: 'l2_support', title: 'L2 Support Technician', desc: 'Application configuration, basic log analysis, and escalation.', type: 'settings', color: 0 },
    { id: 'freelancer', title: 'Independent Contractor', desc: 'Project-based delivery, self-management, and specialized skills.', type: 'user', color: 4 },
    { id: 'student', title: 'Computer Science Student', desc: 'Learning fundamentals, algorithms, and exploring tech stacks.', type: 'tech', color: 2 },
    { id: 'external_auditor', title: 'External Auditor', desc: 'Third-party assessment, financial review, and regulatory reporting.', type: 'scale', color: 7 },
    { id: 'scrum_master', title: 'Scrum Master', desc: 'Facilitating sprint ceremonies, removing blockers.', type: 'users', color: 2 },
    { id: 'rel_eng', title: 'Release Engineer', desc: 'Branching strategies, version control, release trains.', type: 'code', color: 4 },
    { id: 'data_steward', title: 'Data Steward', desc: 'Data quality, metadata management, lifecycle.', type: 'database', color: 7 },
    { id: 'ai_ethicist', title: 'AI Ethicist', desc: 'Bias mitigation, fairness, responsible AI deployment.', type: 'scale', color: 0 },
    { id: 'cloud_finops', title: 'Cloud FinOps', desc: 'Unit economics of cloud spend, resource waste mapping.', type: 'chartbar', color: 1 },
    { id: 'soc_analyst', title: 'SOC Analyst', desc: 'Log review, phishing analysis, level 1 incident response.', type: 'sec', color: 3 },
    { id: 'iam_eng', title: 'IAM Engineer', desc: 'OAuth, SAML, RBAC, and directory services integration.', type: 'lock', color: 3 },
    { id: 'vuln_mgr', title: 'Vulnerability Mgr', desc: 'Patch management, CVE scoring, remediation metrics.', type: 'target', color: 3 },
    { id: 'chief_data_off', title: 'Chief Data Officer', desc: 'Data monetization, analytics center of excellence.', type: 'data', color: 1 },
    { id: 'chief_prod_off', title: 'Chief Product Officer', desc: 'Product vision, multi-year feature parity strategy.', type: 'product', color: 5 },
    { id: 'hw_eng', title: 'Hardware Engineer', desc: 'PCB design, ASIC layout, schematic capture.', type: 'hardware', color: 2 },
    { id: 'firmware_eng', title: 'Firmware Engineer', desc: 'Microcontrollers, low-level C, RTOS operations.', type: 'tech', color: 2 },
    { id: 'sys_eng', title: 'Systems Engineer', desc: 'V-model lifecycle, requirements traceability.', type: 'layers', color: 1 },
    { id: 'dr_mgr', title: 'Disaster Recovery Mgr', desc: 'RTO/RPO mapping, failover testing, business continuity.', type: 'ops', color: 7 },
    { id: 'noc_analyst', title: 'NOC Analyst', desc: 'Network alarms, bandwidth monitoring, ISP coordination.', type: 'network', color: 5 },
    { id: 'helpdesk_mgr', title: 'Helpdesk Manager', desc: 'SLA enforcement, ITSM configuration, shift scheduling.', type: 'settings', color: 0 },
    { id: 'sys_prog', title: 'Systems Programmer', desc: 'OS kernels, driver development, compiler tuning.', type: 'cli', color: 0 },
    { id: 'quant_dev', title: 'Quant Developer', desc: 'Low-latency C++, market data parsers, order gateways.', type: 'fast', color: 4 },
    { id: 'game_dev', title: 'Game Developer', desc: 'Graphics rendering, physics engines, frame rates.', type: 'tech', color: 6 },
    { id: 'xr_eng', title: 'AR/VR Engineer', desc: 'Spatial computing, Unity/Unreal, headset integration.', type: 'mobile', color: 5 },
    { id: 'av_eng', title: 'AV Engineer', desc: 'Self-driving models, LiDAR processing, sensor fusion.', type: 'hardware', color: 2 },
    { id: 'rpa_dev', title: 'RPA Developer', desc: 'UiPath/BluePrism automation of repetitive tasks.', type: 'fast', color: 1 },
    { id: 'sales_ops', title: 'Sales Operations', desc: 'Quota planning, territory mapping, compensation logic.', type: 'chartbar', color: 6 },
    { id: 'mktg_ops', title: 'Marketing Operations', desc: 'Marketo/Hubspot routing, lead scoring, campaign analytics.', type: 'settings', color: 5 },
    { id: 'legal_ops', title: 'Legal Operations', desc: 'Contract lifecycle management tools, e-discovery.', type: 'legal', color: 0 },
    { id: 'treasury', title: 'Treasury Analyst', desc: 'Cash flow forecasting, FX hedging, banking relations.', type: 'growth', color: 6 },
    { id: 'procurement', title: 'Procurement Mgr', desc: 'Vendor SLAs, RFP scoring, hardware supply chains.', type: 'core', color: 0 },
    { id: 'brand_mgr', title: 'Brand Manager', desc: 'Visual identity, tone of voice, market research.', type: 'marketing', color: 5 },
    { id: 'pr_mgr', title: 'Public Relations Mgr', desc: 'Press releases, media relations, crisis comms.', type: 'comms', color: 6 },
    { id: 'community_mgr', title: 'Community Manager', desc: 'Forum moderation, Discord hosting, user advocacy.', type: 'users', color: 4 },
    { id: 'localization', title: 'Localization Specialist', desc: 'i18n, l10n, translation workflows, cultural adaptation.', type: 'globe', color: 5 },
    { id: 'access_eng', title: 'Accessibility Eng', desc: 'WCAG compliance, screen readers, keyboard navigation.', type: 'ui', color: 1 },
    { id: 'tech_trainer', title: 'Technical Trainer', desc: 'Onboarding curricula, cert preps, LMS administration.', type: 'pm', color: 4 },
    { id: 'customer_educ', title: 'Customer Educator', desc: 'Webinars, help center articles, video tutorials.', type: 'video', color: 5 },
    { id: 'partner_eng', title: 'Partner Engineer', desc: 'API integrations for ISVs, joint solutions architecture.', type: 'api', color: 2 },
    { id: 'evangelist', title: 'Tech Evangelist', desc: 'Keynotes, podcasts, high-level technology promotion.', type: 'radio', color: 6 },
    { id: 'sc_analyst', title: 'Supply Chain Analyst', desc: 'Inventory turns, logistics tracking, supplier risk.', type: 'core', color: 0 },
    { id: 'chief_staff', title: 'Chief of Staff', desc: 'Executive alignment, board prep, strategic initiatives.', type: 'strategy', color: 1 },
    { id: 'head_talent', title: 'Head of Talent', desc: 'Employer branding, headcount planning, executive search.', type: 'users', color: 5 },
    { id: 'agile_pm', title: 'Agile Project Mgr', desc: 'Burndown charts, risk registers, sprint coordination.', type: 'pm', color: 2 },
];

export const PERSONAS: Persona[] = rawPersonas.map(p => ({
    id: p.id,
    title: p.title,
    description: p.desc,
    icon: getIcon(p.type, 'w-6 h-6 text-slate-400 group-hover:text-white transition-colors'),
    color: palette[p.color]
}));
