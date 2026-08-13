import { getCopy } from "@/content/en";

const contact = () => process.env.CONTACT_EMAIL || "investigations@cyberdubey.co.uk";

export function privacySections() {
  const email = contact();
  return [
    {
      title: "Who we are",
      paragraphs: [
        `This notice explains how the investigation service at cyberdubey.co.uk (“we”, “us”) handles personal data. The data controller is the operator of that service. Contact: ${email}.`,
        "This notice covers two kinds of people: you, the client who files an enquiry; and the person or people in India that the enquiry is about (the “subject”). The lawful basis and the data we hold are not the same in each case. They are set out separately below.",
      ],
    },
    {
      title: "What we collect from you (the client)",
      paragraphs: [
        "When you file an enquiry we collect: your name, email, phone number, preferred contact method, city and country, whether you instruct us as an individual or for an organisation, the organisation name and your role if relevant, a description of what you want to establish and why, your relationship to the matter, answers to the gating and risk questions, optional documents you upload, the four confirmations you tick, the version of those confirmations, and the date and time you agreed to them. We also store a case number, the status of the enquiry, and technical data needed to protect the form (for example, a hashed address used only for rate limiting).",
        "We do not ask for any national identity number (including Aadhaar, PAN, SSN or National Insurance number), bank account or card numbers, passwords, or identity-document scans. Please do not send them. If you do, we will delete them when we find them.",
      ],
    },
    {
      title: "Lawful basis — client data",
      paragraphs: [
        "We process your data to take steps at your request before a contract (the enquiry and, if you later accept a written scope, the engagement), and where necessary for our legitimate interests in reviewing, declining or taking a case, keeping records, and defending legal claims. Where a client is in the United Kingdom or the European Economic Area, those bases are used under UK GDPR / GDPR. Where Indian law applies, we process in line with the Digital Personal Data Protection Act, 2023, for the specified purposes in this notice.",
        "You do not have to give us the data. If you do not, we cannot review the enquiry.",
      ],
    },
    {
      title: "What we collect about the subject of an enquiry",
      paragraphs: [
        "The client tells us who they are asking about and what they want to establish. That typically includes a name, a location in India, and facts the client already has. If the case is accepted, we may add information obtained from lawfully available sources and from field checks in India, as described in the written scope.",
        "We do not access the subject’s phone, email, social media account or computer. We do not obtain call records, bank statements, tax records or Aadhaar data. We do not intercept communications.",
      ],
    },
    {
      title: "Lawful basis — subject data",
      paragraphs: [
        "We process subject data because the client has asked us to make a private enquiry, and only to the extent the enquiry can be carried out from lawfully available sources in India. We do this for the legitimate interests of the client in verifying facts before a personal, commercial or legal decision, balanced against the subject’s interests and rights. We will not take a case that appears to be harassment, that would put someone at risk of violence or coercion, or that would require an unlawful method.",
        "Subject data is not used to market to the subject. It is not sold. It is used to review the enquiry, to carry out an accepted scope, and to write the report for the instructing client.",
      ],
    },
    {
      title: "How long we keep data",
      paragraphs: [
        "Enquiries that are not taken forward: 12 months from the enquiry, then deleted.",
        "Cases that proceed to a written engagement: seven years after the report, then deleted, unless a longer period is required by law or by an ongoing legal process you have told us about.",
        "Uploads follow the same period as the case they belong to.",
      ],
    },
    {
      title: "Security",
      paragraphs: [
        "Case data and uploads are encrypted at rest. Uploads are stored under unguessable identifiers and are not published on a public URL. The form is served over HTTPS, with HSTS, a content security policy, rate limiting and bot checks. Internal access to case files requires authentication and two-factor authentication.",
      ],
    },
    {
      title: "Transfers of client data between countries",
      paragraphs: [
        "The work is carried out in India. If you are a client outside India, you are sending your data to India so that we can read and respond to the enquiry. We do not use a third-party form widget; the enquiry is submitted to our own server. If we use an email provider to send the acknowledgement, that provider processes the case number and your email address in order to deliver the message. Emails do not contain the body of your enquiry.",
        "If you later accept a written engagement, the contract will say where files are held.",
      ],
    },
    {
      title: "Your rights",
      paragraphs: [
        "You may ask us for a copy of the client data we hold about you, to correct it, or — where the law allows — to delete it or to restrict how we use it. Enquiries from a subject are handled on the Subject enquiries page. We may not be able to confirm or deny that a subject enquiry exists where doing so would disclose a client’s confidential instruction.",
        `To exercise a right, write to ${email} with your case reference if you have one. We will respond within the time the applicable law requires, and in any event within one month where UK GDPR / GDPR applies.`,
      ],
    },
    {
      title: "How to complain",
      paragraphs: [
        `Write to ${email} using the Complaints page process if you are a client. You may also complain to the Data Protection Board of India. If you are in the United Kingdom, you may complain to the Information Commissioner’s Office (ico.org.uk). If you are in the EEA, you may complain to your local supervisory authority.`,
      ],
    },
  ];
}

export function termsSections() {
  const email = contact();
  const copy = getCopy();
  return [
    {
      title: "These terms",
      paragraphs: [
        "These Terms of Engagement apply to enquiries submitted through cyberdubey.co.uk and to any later written engagement. Submitting the form does not create an engagement. An engagement exists only when we have sent a written scope and a fixed fee, and you have accepted that scope and fee in writing.",
        `Questions: ${email}.`,
      ],
    },
    {
      title: "What we do — and where",
      paragraphs: [
        copy.tagline,
        "We carry out investigations in India only. We accept clients from anywhere in the world. We do no investigative work outside India.",
        "We are not a law enforcement agency and we do not act under any statutory authority. Enquiries we carry out are private enquiries and are not investigations conducted under law.",
      ],
    },
    {
      title: "Quote after review",
      paragraphs: [
        "We do not price a case we have not read. A senior reviewer reads the enquiry and responds within 24 to 48 working hours, India Standard Time. The response is questions, a written scope and a fixed fee, or a decline.",
        "Nothing starts until you accept the written scope and fee in writing. No fee is payable before that. The acknowledgement email is not an acceptance.",
      ],
    },
    {
      title: "Payment",
      paragraphs: [
        "Fees, timing and method of payment are set out in the written scope. Work does not begin until the payment terms in that scope have been met.",
      ],
    },
    {
      title: "What we will not do",
      paragraphs: [
        "The published page “What we will not do” forms part of these terms. We will not accept an instruction that requires anything on that list.",
      ],
    },
    {
      title: "Right to decline and to withdraw",
      paragraphs: [
        "We reserve the right to decline any instruction, at any stage, without giving reasons. We may withdraw from an accepted engagement if continuing would be unlawful, unsafe, or outside the written scope, or if you have not met the payment terms. If we withdraw, we will say what work has been done and how any unused fee will be treated, as set out in the scope.",
      ],
    },
    {
      title: "No guarantee of outcome",
      paragraphs: [
        "We establish what can be verified, and tell you plainly what cannot. We do not guarantee a result, a finding, or that a fact can be proved. A written report with sourced findings and an honest account of what we could not establish is what you receive.",
      ],
    },
    {
      title: "Confidentiality",
      paragraphs: [
        "We keep the enquiry and the file confidential within the review and investigation team assigned to the case, except where disclosure is required by law, or where you ask us in writing to speak to a named third party (for example, your lawyer).",
      ],
    },
    {
      title: "Limitation of liability",
      paragraphs: [
        "Our findings are provided for the information of the instructing client. Whether any material may be used in legal proceedings is a matter for the court and for the client’s own legal advisers. Documented to an evidential standard does not mean a court will admit it.",
        "To the fullest extent permitted by law, we are not liable for loss of profit, loss of business, or indirect or consequential loss, or for a decision you take on the basis of a report. Where liability cannot be excluded, it is limited to the fee paid for the engagement that gave rise to the claim. Nothing in these terms excludes liability for death or personal injury caused by negligence, or for fraud.",
      ],
    },
    {
      title: "Governing law and jurisdiction",
      paragraphs: [
        "These terms, and any engagement, are governed by the laws of India. The courts of India have exclusive jurisdiction. The written scope for an accepted case may name a more specific forum; if it does, that forum applies to that engagement.",
      ],
    },
  ];
}
