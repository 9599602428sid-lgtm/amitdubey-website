export const WORKING_TIMEZONE = "Asia/Kolkata";
export const WORKING_HOURS_LABEL =
  "24 to 48 working hours, India Standard Time (IST, Asia/Kolkata). Working days are Monday to Friday, excluding Indian public holidays.";

export const DECLARATION_VERSION = "declarations-2026-08-v1";

export const DECLARATIONS = [
  {
    id: "d1",
    text: "I confirm the information I have given is true and that I am authorised to make this request.",
  },
  {
    id: "d2",
    text: "I confirm my purpose is lawful. I am not seeking this information to harass, stalk, intimidate, blackmail or harm anyone, and I am not subject to any court order restricting contact with the person concerned.",
  },
  {
    id: "d3",
    text: "I understand this is a private enquiry, not a police investigation, and that whether anything can be used in court is a matter for the court and my own lawyers.",
  },
  {
    id: "d4",
    text: "I have read and accept the Privacy Notice and Terms, and I understand that submitting this form does not create an engagement until a written scope and fee are agreed.",
  },
] as const;

export const INDIA_GATE_MESSAGE =
  "We carry out investigations in India only. We are not able to accept enquiries about people or organisations located elsewhere. If the matter involves someone in India — even if you are not in India yourself — please continue.";

export const TAGLINE = "Investigations conducted in India. Clients worldwide.";

export const MONEY_AT_RISK_MESSAGE =
  "If money is at risk right now, contact your bank and report to the police or your national fraud line immediately. Do not wait for us.";

export const UPLOAD_NOTICE =
  "Please do not upload identity documents, bank details or passwords. We will never ask you for a password.";

export const FOOTER_DISCLAIMER = [
  "We provide private investigation and verification services in India. We accept instructions from clients worldwide, but all enquiries are carried out in India only.",
  "We are not a law enforcement agency and we do not act under any statutory authority. Enquiries we carry out are private enquiries and are not investigations conducted under law.",
  "We work only from lawfully available sources. We do not access any person's device, account or communications; we do not obtain call records, banking records or protected government data; and we do not intercept communications.",
  "Our findings are provided for the information of the instructing client. Whether any material may be used in legal proceedings is a matter for the court and for the client's own legal advisers.",
  "We reserve the right to decline any instruction, at any stage, without giving reasons.",
];

export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MIN_ESTABLISH_CHARS = 100;

export const CATEGORIES = [
  {
    id: "personal",
    label: "Personal & family",
    subcategories: [
      "Pre-marriage / matrimonial verification",
      "Staff verification",
      "Tenant verification",
      "Document checks",
      "Other personal or family matter",
    ],
  },
  {
    id: "business",
    label: "Business & commercial",
    subcategories: [
      "Company check before buying or partnering",
      "Vendor or supplier check",
      "Scam check",
      "Property title",
      "Other business or commercial matter",
    ],
  },
  {
    id: "cyber",
    label: "Cyber & digital",
    subcategories: [
      "Online fraud tracing",
      "Fake profile",
      "Scam website",
      "Digital footprint",
      "Other cyber or digital matter",
    ],
  },
  {
    id: "legal",
    label: "Legal support",
    subcategories: [
      "Witness location",
      "Address verification",
      "Field check",
      "Other legal support",
    ],
  },
  {
    id: "unsure",
    label: "Not sure",
    subcategories: ["I am not sure — please advise"],
  },
] as const;

export const URGENCY_OPTIONS = [
  { id: "standard", label: "Standard" },
  { id: "urgent", label: "Urgent" },
  { id: "emergency", label: "Emergency" },
] as const;

export const PREFERRED_CONTACT = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email_only", label: "Email only, do not call" },
] as const;

export const RELATIONSHIPS = [
  "Family member",
  "Prospective spouse or their family",
  "Employer or prospective employer",
  "Landlord or property owner",
  "Business partner or investor",
  "Customer or person who paid money",
  "Lawyer, acting for a client",
  "Other",
] as const;

export const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const COVERAGE_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  Assam: ["Guwahati"],
  Bihar: ["Patna"],
  Chhattisgarh: ["Raipur"],
  Delhi: ["New Delhi"],
  Goa: ["Panaji", "Margao"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Haryana: ["Gurugram", "Faridabad", "Chandigarh"],
  "Himachal Pradesh": ["Shimla"],
  Jharkhand: ["Ranchi"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  "Madhya Pradesh": ["Bhopal", "Indore"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  Odisha: ["Bhubaneswar"],
  Punjab: ["Ludhiana", "Amritsar", "Chandigarh"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Telangana: ["Hyderabad"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Ghaziabad", "Kanpur", "Varanasi", "Agra"],
  Uttarakhand: ["Dehradun"],
  "West Bengal": ["Kolkata"],
  Chandigarh: ["Chandigarh"],
  "Jammu and Kashmir": ["Srinagar", "Jammu"],
};

export type CaseStatus = "Awaiting review" | "Awaiting senior review";

export type InvestigationPayload = {
  subjectLocation: string;
  clientCountry: string;
  category: string;
  subcategory: string;
  indiaState: string;
  indiaCity: string;
  urgency: string;
  moneyAtRisk: string;
  fullName: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
  preferredContact: string;
  clientCity: string;
  clientType: string;
  organisationName: string;
  organisationRole: string;
  establish: string;
  relationship: string;
  relationshipOther: string;
  purpose: string;
  adverseDecision: string;
  reportedAuthorities: string;
  courtCase: string;
  valueAtRisk: string;
  declarations: Record<string, boolean>;
  honeypot: string;
  startedAt: string;
};

export type StoredFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath?: string;
};

export type StoredCase = {
  caseNumber: string;
  status: CaseStatus;
  createdAt: string;
  timezone: typeof WORKING_TIMEZONE;
  reviewDueBy: string;
  seniorReviewRequired: boolean;
  declarationVersion: string;
  declarationAgreedAt: string;
  payload: InvestigationPayload;
  files: StoredFile[];
};
