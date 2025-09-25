import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

export async function seedAIBETest17() {
  try {
    // ensure a system user exists for the foreign-key `createdBy`
    let systemUser = await prisma.user.findFirst({ where: { email: 'system@local' } });
    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: { name: 'System', email: 'system@local' }
      });
    }

    const aibeTest = await prisma.test.create({
      data: {
        title: "AIBE-XVII Mock Test - Set Code A",
        description: "Original All India Bar Examination XVII practice test.",
        category: "AIBE - All India Bar Examination",
        difficulty: "HARD",
        timeLimit: 180,
        totalQuestions: 100,
        passingScore: 40.0,
        isPublished: true,
        createdBy: systemUser.id
      }
    });

    const questions = [
      { questionNumber: 1, question: "The title of the Constitution of India is laid down", options: { A: "Article 1", B: "Article 5", C: "Article 390", D: "Article 393" }, correctAnswer: "D" },
      { questionNumber: 2, question: "Constitutional provisions of Fundamental Rights (FRs) are given under which part of the Constitution?", options: { A: "Part I", B: "Part II", C: "Part III", D: "Part IV" }, correctAnswer: "C" },
      { questionNumber: 3, question: "By which of the following Amendment Acts of 1985 Anti Defection Law was added to the Constitution of India?", options: { A: "51st Constitutional Amendment", B: "52nd Constitutional Amendment", C: "53rd Constitutional Amendment", D: "54th Constitutional Amendment" }, correctAnswer: "B" },
      { questionNumber: 4, question: "In which one of the following cases the Supreme Court decided that a constitutional amendment is a 'law' within the meaning of Article 13(2) and therefore if it violates any of the fundamental rights it may be declared void?", options: { A: "Sajjan Singh v. State of Rajasthan", B: "Keshvananda Bharati v. State of Kerala", C: "Indra Sawhney v. Union of India", D: "Golak Nath v. State of Punjab" }, correctAnswer: "D" },
      { questionNumber: 5, question: "Uniform Civil Code in India is:", options: { A: "Fundamental Rights", B: "Directive Principles of State Policy", C: "Government Policy", D: "Constitutional Right" }, correctAnswer: "B" },
      { questionNumber: 6, question: "As per Article 16, no citizen shall, on grounds only of or any of them, be ineligible for, or discriminated against in respect of, any employment or office under the State. Which set lists those grounds?", options: { A: "religion, race, caste, sex, descent, place of birth, residence", B: "religion, age, caste, sex, descent, place of birth, residence", C: "religion, race, age, sex, descent, place of birth, residence", D: "religion, race, caste, sex, descent, place of birth, age" }, correctAnswer: "A" },
      { questionNumber: 7, question: "The minimum number of Judges who are to sit for the purpose of deciding any case involving a substantial question of law as to the interpretation of this Constitution or any reference under Article 143 shall be", options: { A: "2", B: "3", C: "4", D: "5" }, correctAnswer: "D" },
      { questionNumber: 8, question: "According to Article 300A of the Constitution of India, a _____ shall not be deprived of his property save by authority of law.", options: { A: "person", B: "citizen", C: "foreigner", D: "Indian" }, correctAnswer: "A" },
      { questionNumber: 9, question: "Which of the following is not 'law' according to Article 13 of the Indian Constitution?", options: { A: "Rule", B: "By-laws", C: "Custom or usage", D: "None of these" }, correctAnswer: "D" },
      { questionNumber: 10, question: "Which of the following Schedule deals with Union list, State list and Concurrent list in the Constitution of India?", options: { A: "Schedule 7", B: "Schedule 10", C: "Schedule 11", D: "Schedule 12" }, correctAnswer: "A" },
      { questionNumber: 11, question: "Under Section 82 and 83 of IPC, an offence is punishable if it is done by a child", options: { A: "of below seven years of age", B: "of above seven years of age but below twelve years having attained sufficient maturity and understanding", C: "of above seven years of age but below ten years having attained sufficient maturity and understanding", D: "of above seven years of age but below twelve years not having attained sufficient maturity and understanding" }, correctAnswer: "B" },
      { questionNumber: 12, question: "Name two essential conditions of Penal Liability.", options: { A: "Guilty Body & Rightful Act", B: "Guilty Intent & Wrong Motive", C: "Guilty Mind & Wrongful Act", D: "Guilty Motive and Wrongful Act" }, correctAnswer: "C" },
      { questionNumber: 13, question: "Provisions for Right of Private Defence is given between", options: { A: "Sections 74-84", B: "Sections 96-106", C: "Sections 107-120", D: "Sections 141-160" }, correctAnswer: "B" },
      { questionNumber: 14, question: "Consent is not a valid consent under Section 90 of IPC if", options: { A: "If given under fear of injury or misconception of fact", B: "If given by person of unsound mind", C: "If given by child below 12 years of age", D: "All of these" }, correctAnswer: "D" },
      { questionNumber: 15, question: "Causing of the death of child in the mother's womb is not homicide as provided under", options: { A: "Explanation III to Section 300", B: "Explanation III to Section 299", C: "Explanation III to Section 301", D: "Explanation III to Section 302" }, correctAnswer: "B" },
      { questionNumber: 16, question: "Punishment for Defamation under IPC is simple imprisonment for a term which may extend to", options: { A: "2 Years", B: "3 Years", C: "4 Years", D: "5 Years" }, correctAnswer: "A" },
      { questionNumber: 17, question: "Assault or criminal force to women with intent to outrage her modesty under IPC is which kind of offence?", options: { A: "Non-Cognizable and Bailable", B: "Cognizable and Bailable", C: "Cognizable and Non-Bailable", D: "Non-Cognizable and Non-Bailable" }, correctAnswer: "C" },
      { questionNumber: 18, question: "A places men with firearms at the outlets of a building and tells 'Z' they will fire at Z if Z attempts to leave the building. 'A' is guilty of", options: { A: "wrongful confinement", B: "wrongful restraint", C: "Both wrongful confinement and wrongful restraint", D: "None of these" }, correctAnswer: "A" },
      { questionNumber: 19, question: "The provision of 'Plea Bargaining' under chapter XXIA of CrPC are not applicable if the offence is committed against a child below the age of", options: { A: "12 years", B: "14 years", C: "16 years", D: "18 years" }, correctAnswer: "B" },
      { questionNumber: 20, question: "Section 125 of the Criminal Procedure Code is 'SECULAR' in character was observed in which case?", options: { A: "Lalita Kumari v. State of Uttar Pradesh", B: "Amesh Kumar's Case", C: "Mohd. Ahmed Khan v. Shah Bano Begum", D: "Selvy v. State of Karnataka" }, correctAnswer: "C" },
      { questionNumber: 21, question: "Who has the power of summary trial of a case?", options: { A: "Chief Judicial Magistrate", B: "Metropolitan Magistrate", C: "Any Magistrate of first class specially empowered by the High Court", D: "All of these" }, correctAnswer: "D" },
      { questionNumber: 22, question: "Which Sections deal with the processes to compel appearance under Code of Criminal Procedure 1973?", options: { A: "Sections 61 to 90", B: "Sections 154 to 173", C: "Sections 211 to 219", D: "Sections 274 to 282" }, correctAnswer: "A" },
      { questionNumber: 23, question: "Which type of offence is one which a police officer may arrest a person without warrant?", options: { A: "Non-cognizable offence", B: "Cognizable offence", C: "Bailable offence", D: "None of these" }, correctAnswer: "B" },
      { questionNumber: 24, question: "In a summons trial case instituted on a complaint wherein the summons has been issued to the accused, the non-appearance or death of the complainant shall entail", options: { A: "Discharge of the accused", B: "Acquittal of the accused", C: "Either discharge or acquittal depending on the facts & circumstances of the case", D: "None of these" }, correctAnswer: "B" },
      { questionNumber: 25, question: "Suppose F.I.R. is not registered by the Station House Officer. What are the options that the complainant has?", options: { A: "Approach Superintendent of Police", B: "Approach Magistrate by filing Private Complaint", C: "None of these", D: "Both (Approach Superintendent of Police) & (Approach Magistrate by filing Private Complaint)" }, correctAnswer: "D" },
      { questionNumber: 26, question: "Any police officer making an investigation under Section 160 of CrPC cannot require the attendance of a male, at a place other than the place of his residence who is", options: { A: "under the age of 15 years and above the age of 60 years", B: "under the age of 18 years and above the age of 60 years", C: "under the age of 15 years and above the age of 65 years", D: "under the age of 18 years and above the age of 65 years" }, correctAnswer: "C" },
      { questionNumber: 27, question: "If someone lies before the court on affidavit, how can it be tackled by the Advocate/s?", options: { A: "Perjury Application can be filed", B: "Withdraw from the case", C: "File application to support that", D: "Pay the fine for the same" }, correctAnswer: "A" },
      { questionNumber: 28, question: "Proclamation for person absconding shall be published as follows: which options are correct?", options: { A: "Only i, ii, iv are correct", B: "Only ii and iii are correct", C: "Only i, ii, iv are correct", D: "All i, ii, iii, iv are correct" }, correctAnswer: "D" },
      { questionNumber: 29, question: "Which Order of Civil Procedure Code deals with Temporary Injunction and Interlocutory Injunction?", options: { A: "Order 38", B: "Order 39", C: "Order 40", D: "Order 41" }, correctAnswer: "B" },
      { questionNumber: 30, question: "A is a tradesman in Ahmedabad, B carries on business in Delhi. B, by his agent in Ahmedabad, buys goods of A and requests A to deliver them to the Western Roadways Transport Company. A delivers the goods accordingly in Ahmedabad. A may sue B for the price of the goods", options: { A: "In Ahmedabad only", B: "In Delhi only", C: "In either Ahmedabad or Delhi", D: "Anywhere in India" }, correctAnswer: "C" },
      { questionNumber: 31, question: "Which of the following Section of Civil Procedure Code deals with the concept of Res Judicata?", options: { A: "Section 10", B: "Section 11", C: "Section 12", D: "Section 13" }, correctAnswer: "B" },
      { questionNumber: 32, question: "Mr. X, Mr. Y and Mr. Z are jointly and severally liable for 10,000 under a decree obtained by Mr. A. Mr. Y obtains a decree for 10,000 against Mr. A singly and applies for execution to the Court in which the joint-decree is being executed. Which option is correct for Mr. A?", options: { A: "Mr. A may treat his joint-decree as cross-decree under Order 21 Rule 18", B: "Mr. A cannot treat his joint-decree as cross-decree under Order 21 Rule 18", C: "Mr. A cannot treat his joint-decree as cross-decree under Order 22 Rule 18", D: "None of these" }, correctAnswer: "A" },
      { questionNumber: 33, question: "A, B and C are coparceners of Joint Hindu Family. They jointly execute a mortgage in favour of Y. Y files a suit against all of them. Summons is served to C but not to A and B. None of them appears and an ex parte decree is passed against all. A and B applied to set aside the ex parte decree. The decree will be set aside against", options: { A: "Only C", B: "Only A & B", C: "A, B and C", D: "None of these" }, correctAnswer: "C" },
      { questionNumber: 34, question: "Which of the following provision of Civil Procedure Code, 1908 deals with the Institution of Suits?", options: { A: "Section 22", B: "Section 24", C: "Section 26", D: "Section 28" }, correctAnswer: "C" },
      { questionNumber: 35, question: "Defendant shall, within ___ days from the date of service of summon on him, present a Written Statement of his defence (ORDER VIII).", options: { A: "15", B: "30", C: "60", D: "45" }, correctAnswer: "B" },
      { questionNumber: 36, question: "Which of the following statement is incorrect?", options: { A: "First appeal can be on question of fact or law or both", B: "Second appeal can be on substantial question of law only", C: "Second appeal can be on question of fact or law or both", D: "First appeal may or may not be in the High Court, Second appeal has to be in the High Court" }, correctAnswer: "C" },
      { questionNumber: 37, question: "As per Order VI, Pleading shall mean?", options: { A: "Plaint", B: "Written Statement", C: "Both Plaint and Written Statement", D: "None of these" }, correctAnswer: "C" },
      { questionNumber: 38, question: "Which of the following Order deals with 'Death, Marriage and Insolvency of Parties'?", options: { A: "Order 20", B: "Order 21", C: "Order 22", D: "Order 23" }, correctAnswer: "C" },
      { questionNumber: 39, question: "The doctrine of 'Res Gestae' has been discussed in which Section of the Evidence Act?", options: { A: "Section 5", B: "Section 6", C: "Section 10", D: "Section 11" }, correctAnswer: "B" },
      { questionNumber: 40, question: "When the liability of a person who is one of the parties to the suit depends upon the liability of a stranger to the suit, then an admission by the stranger in respect of his liability shall be an admission on the part of that person who is a party to the suit. It has been so provided under which Section of the Indian Evidence Act, 1872?", options: { A: "Section 17", B: "Section 18", C: "Section 19", D: "Section 21" }, correctAnswer: "C" },
      { questionNumber: 41, question: "Judicial Evidence means", options: { A: "Evidence received by Courts in proof or disproof of facts", B: "Evidence received by Police Officer", C: "Evidence received by Home Department", D: "Evidence received by Tribunal" }, correctAnswer: "A" },
      { questionNumber: 42, question: "Which of the following is not a 'document' according to the Indian Evidence Act, 1872?", options: { A: "An inscription on a metal plate or stone", B: "A map or plan", C: "A caricature", D: "None of these" }, correctAnswer: "D" },
      { questionNumber: 43, question: "'Presumptions as to Dowry Deaths' is given under which Section?", options: { A: "113A", B: "113B", C: "114A", D: "114B" }, correctAnswer: "B" },
      { questionNumber: 44, question: "Which of the following is not 'Secondary evidence' as per Section 63 of Indian Evidence Act, 1872?", options: { A: "Copies made from the original by mechanical processes which in themselves insure the accuracy of the copy, and copies compared with such copies", B: "Copies made from or compared with the original", C: "Oral accounts of the contents of a document given by some person who has himself seen it", D: "Copies not certified under Section 63" }, correctAnswer: "D" },
      { questionNumber: 45, question: "A leading question may be asked in", options: { A: "Examination-in-chief", B: "Re-examination", C: "Cross examination", D: "None of these" }, correctAnswer: "C" },
      { questionNumber: 46, question: "Extra Judicial Confession means", options: { A: "Confessions made either to Police or person other than Judges and Magistrates", B: "Confessions made before Magistrates", C: "Confessions made before Judges", D: "None of these" }, correctAnswer: "A" },
      { questionNumber: 47, question: "In the determination of rules of procedure the Arbitral Tribunal shall not be bound by", options: { A: "The Code of Civil Procedure, 1908", B: "The Indian Evidence Act, 1872", C: "The Code of Criminal Procedure, 1973", D: "Both (The Code of Civil Procedure, 1908) and (The Indian Evidence Act, 1872)" }, correctAnswer: "D" },
      { questionNumber: 48, question: "Which of the following Section deals with 'Arbitration Agreement' in Arbitration and Conciliation Act, 1996?", options: { A: "Section 6", B: "Section 7", C: "Section 8", D: "Section 9" }, correctAnswer: "B" },
      { questionNumber: 49, question: "Under what circumstances the arbitral proceedings can be terminated? (1) Final Arbitral award (2) Interim award (3) Where the arbitral tribunal issues an order for the termination", options: { A: "1 and 3", B: "1 and 2", C: "2 and 3", D: "1, 2 and 3" }, correctAnswer: "A" },
      { questionNumber: 50, question: "Under Section 29 of The Arbitration And Conciliation Act, 1996 in arbitral proceedings with more than one arbitrator, any decision of the arbitral tribunal", options: { A: "shall be made by all members", B: "shall be made by 2/3 majority of its members", C: "shall be made by the chief arbitrator", D: "shall be made by majority of its members" }, correctAnswer: "D" },
      { questionNumber: 51, question: "The provision for 'maintenance pendente lite' in Hindu Marriage Act, 1955 is given in", options: { A: "Section 22", B: "Section 23", C: "Section 24", D: "Section 25" }, correctAnswer: "C" },
      { questionNumber: 52, question: "A Muslim wife may sue for divorce under the Dissolution of Muslim Marriage Act, 1959 Section 2, if the husband has been insane for a period of:", options: { A: "1 year", B: "2 years", C: "5 years", D: "7 years" }, correctAnswer: "B" },
      { questionNumber: 53, question: "Which section of The Muslim Women (Protection of Rights on Divorce) Act, 1986 deals with the option of a Muslim woman to be governed by provisions of CrPC?", options: { A: "Section 5", B: "Section 6", C: "Section 7", D: "None of these" }, correctAnswer: "A" },
      { questionNumber: 54, question: "Which of the following is not a ground of void marriage under Section 11 of the Marriage Act?", options: { A: "Bigamy", B: "Degrees of Prohibited Relationship", C: "Sapinda Relationship", D: "Child marriage" }, correctAnswer: "D" },
      { questionNumber: 55, question: "Sapinda Relationship means", options: { A: "3rd generation (mother), 7th generation (father)", B: "3rd generation (mother), 5th generation (father)", C: "3rd generation (mother), 4th generation (father)", D: "2nd generation (mother), 5th generation (father)" }, correctAnswer: "B" },
      { questionNumber: 56, question: "Which one of the following is not a ground of divorce in the Hindu Marriage Act?", options: { A: "Mental Disorder", B: "Venereal Disease in communicable form", C: "Incurable Unsound Mind", D: "Living separately for less than three months" }, correctAnswer: "D" },
      { questionNumber: 57, question: "Indian Christians can obtain divorce under which of the following enactments?", options: { A: "Special Marriage Act, 1954", B: "Christian Marriage Act, 1872", C: "Indian Divorce Act, 1869", D: "Special Marriage Act, 1872" }, correctAnswer: "C" },
      { questionNumber: 58, question: "Section 12 of Hindu Adoptions and Maintenance Act, 1956 deals with", options: { A: "Rights of adoptive parents to dispose of their properties", B: "Effects of adoption", C: "Presumption as to the document relating to adoption", D: "Cancellation of adoption" }, correctAnswer: "B" },
      { questionNumber: 59, question: "Which of the following categories of cases will not be entertained as Public Interest Litigation (PIL)?", options: { A: "Family Pension", B: "Petitions from riot victims", C: "Neglected Children", D: "Landlord-Tenant matter" }, correctAnswer: "D" },
      { questionNumber: 60, question: "Who is known as Father of Public Interest Litigation in India?", options: { A: "Justice A. N. Ray", B: "Justice Y. V. Chandrachud", C: "Justice R. S. Pathak", D: "Justice P. N. Bhagwati" }, correctAnswer: "D" },
      { questionNumber: 61, question: "Which of the following is not a real purpose of Public Interest Litigation?", options: { A: "Vindication of the rule of law", B: "Facilitate effective access to Justice", C: "Meaningful realization of Fundamental Rights", D: "Getting famous and making wealth" }, correctAnswer: "D" },
      { questionNumber: 62, question: "In Hussainara Khatoon v. State of Bihar, which right emerged as a basic fundamental right?", options: { A: "Right to Speedy Justice", B: "Right to Clean Environment", C: "Right to Free Legal Aid", D: "None of these" }, correctAnswer: "A" },
      { questionNumber: 63, question: "Which of the following writ can be issued against usurpation of public office?", options: { A: "Writ of Mandamus", B: "Writ of Certiorari", C: "Writ of Quo Warranto", D: "Writ of Prohibition" }, correctAnswer: "C" },
      { questionNumber: 64, question: "Ridge v. Baldwin's case deals with", options: { A: "Corporation", B: "Natural Justice", C: "State Liability", D: "Delegated Legislation" }, correctAnswer: "B" },
      { questionNumber: 65, question: "Meaning of 'Audi alteram partem':", options: { A: "A person cannot be condemned without being heard", B: "An adjudicating authority must give a speaking order", C: "No man can be a judge in his own case", D: "No one should fear the courts" }, correctAnswer: "A" },
      { questionNumber: 66, question: "Rules made by Bar Council of India in exercising its rule making power under which Act?", options: { A: "The Advocates Act, 1951", B: "The Advocates Act, 1954", C: "The Advocates Act, 1961", D: "The Advocates Act, 1964" }, correctAnswer: "C" },
      { questionNumber: 67, question: "An advocate may, while practicing, take up teaching of Law in any educational institution which is affiliated to a University, so long as the hours during which he is so engaged in the teaching of Law do not exceed how many hours in a day?", options: { A: "5", B: "3", C: "2", D: "4" }, correctAnswer: "B" },
      { questionNumber: 68, question: "In which landmark case the advocate was held guilty of professional misconduct as he had forged the court order?", options: { A: "Pratap Narain v. Y. P. Raheja", B: "Vikramaditya v. Smt. Jamila Khatoon", C: "Babulal Jain v. Subhash Jain", D: "Smt. P. Pankajam v. B. H. Chandrashekhar" }, correctAnswer: "A" },
      { questionNumber: 69, question: "If any advocate is aggrieved by an order of Disciplinary Committee of State Bar Council made under Section 35 of the Advocates Act, he may prefer an appeal to the Bar Council of India within how many days of the date of communication of order?", options: { A: "30", B: "45", C: "60", D: "90" }, correctAnswer: "C" },
      { questionNumber: 70, question: "ABC Private Limited Company choose to convert itself into a Public Company. It can do so by altering its Memorandum of Association and Articles of Association and by passing", options: { A: "Ordinary Resolution", B: "Special Resolution", C: "Board Resolution", D: "None of these" }, correctAnswer: "B" },
      { questionNumber: 71, question: "Doctrine of 'lifting of or piercing the corporate veil' is associated with", options: { A: "Labour Law", B: "Company Law", C: "Banking Law", D: "Service Law" }, correctAnswer: "B" },
      { questionNumber: 72, question: "Under which Section of The Environment (Protection) Act, 1986, an appeal to National Green Tribunal (NGT) lies?", options: { A: "Section 4A", B: "Section 5A", C: "Section 6A", D: "Section 7A" }, correctAnswer: "B" },
      { questionNumber: 73, question: "Which one of the following Fundamental Duties relates to Environmental Protection?", options: { A: "Article 51A (b)", B: "Article 51A (g)", C: "Article 51A (j)", D: "Article 51A (k)" }, correctAnswer: "B" },
      { questionNumber: 74, question: "If aggrieved by an order of Controller or adjudicating officer, an appeal from Cyber Appellate Tribunal may be preferred", options: { A: "In any District Court", B: "In Higher Tribunal", C: "Only in High Court", D: "Only in Supreme Court" }, correctAnswer: "C" },
      { questionNumber: 75, question: "Mr. X, a person who is intended by Mr. Y an originator to receive the electronic record is, under the IT Act, known as", options: { A: "Intermediary", B: "Originator's Agent", C: "Addressee", D: "Key Holder" }, correctAnswer: "C" },
      { questionNumber: 76, question: "The minimum number of members required for registration of a trade union is", options: { A: "2", B: "3", C: "5", D: "7" }, correctAnswer: "D" },
      { questionNumber: 77, question: "The text of the Certified Standing Orders shall be prominently posted by the employer in the language understood by the majority of his workmen. Which language?", options: { A: "Hindi", B: "English", C: "Devanagari Script", D: "Language specified in 8th Schedule of the Constitution" }, correctAnswer: "B" },
      { questionNumber: 78, question: "A person who has ultimate control over the affairs of the factory under Factories Act, 1948 is called as", options: { A: "Occupier", B: "Managing Director", C: "Chairman", D: "Manager" }, correctAnswer: "A" },
      { questionNumber: 79, question: "If the factory employs more than 1000 workers, they should appoint qualified ____ to carry out the prescribed duties.", options: { A: "Safety officer", B: "Welfare officer", C: "Development officer", D: "None of these" }, correctAnswer: "A" },
      { questionNumber: 80, question: "Suppose road accident occurs, then being an Advocate what is the correct way of approaching the situation?", options: { A: "FIR > Petition > Summon to Insurance Company", B: "Petition > FIR > Summon to Insurance Company", C: "Summon to Insurance Company > Petition > FIR", D: "FIR > Summon to Insurance Company > Petition" }, correctAnswer: "A" },
      { questionNumber: 81, question: "The principle of 'Ubi jus ibi remedium' was recognized in", options: { A: "Winterbottom v. Wright", B: "Chapman v. Pickersgill", C: "Ashby v. White", D: "Rylands v. Fletcher" }, correctAnswer: "C" },
      { questionNumber: 82, question: "Gloucester Grammar School Case is a landmark case based on which maxim?", options: { A: "Damnum sine injuria", B: "Injuria sine damno", C: "Volenti non fit injuria", D: "Audi alteram partem" }, correctAnswer: "A" },
      { questionNumber: 83, question: "The National Consumer Disputes Redressal Commission under Consumer Protection Act, 2019 shall have the jurisdiction to complaints where the value of the goods or services paid as consideration exceeds", options: { A: "1 Crore", B: "10 Crores", C: "50 Crores", D: "100 Crores" }, correctAnswer: "B" },
      { questionNumber: 84, question: "Under Section 41 of Consumer Protection Act, 2019 an appeal from the order of District Commission lies to", options: { A: "State Commission", B: "Consumer Tribunal", C: "National Commission", D: "High Court" }, correctAnswer: "A" },
      { questionNumber: 85, question: "For an individual to be deemed to be resident in India in any previous year one condition is:", options: { A: "If he is in India for a period of 182 days or more during the previous year", B: "If he is in India for a period of 180 days or more during the previous year", C: "If he is in India for a period of 181 days or more during the previous year", D: "If he is in India for a period of 360 days or more during the previous year" }, correctAnswer: "A" },
      { questionNumber: 86, question: "Mr. Kapoor purchased a residential house in January, 2021 for 80,00,000. He sold the house in April, 2022 for 94,00,000. The gain of 14,00,000 arising on account of sale of residential house will be charged to tax under which head?", options: { A: "Income from capital gains", B: "Income from house property", C: "Income from profits and gains from business or profession", D: "Income from other sources" }, correctAnswer: "A" },
      { questionNumber: 87, question: "Mr. Manjot is a trader supplying goods from his M/s Singh Traders. The office of the firm is located in Delhi whereas its godowns are located in the State of Uttar Pradesh, Punjab and Jammu & Kashmir respectively. Ascertain the States in which Mr. Manjot is required to take registration under GST.", options: { A: "Delhi, Punjab, Uttar Pradesh and J&K", B: "Delhi, Uttar Pradesh and J&K", C: "Delhi and Uttar Pradesh", D: "Delhi" }, correctAnswer: "B" },
      { questionNumber: 88, question: "The primary GST slabs for any regular taxpayers are presently pegged at", options: { A: "0%, 5%, 12%, 18%, 26%", B: "0%, 6%, 12%, 18%, 28%", C: "0%, 5%, 12%, 18%, 28%", D: "0%, 5%, 12%, 16%, 28%" }, correctAnswer: "C" },
      { questionNumber: 89, question: "B, the proprietor of a newspaper, publishes at A's request, a libel upon C in the paper. A indemnity B against the consequences of the publication. B is sued by C and has to pay damages and incurs expenses. Decide in the light of Section 224 of the Indian Contract Act.", options: { A: "A is not liable to B upon indemnity", B: "A is liable to B upon indemnity", C: "A is not liable to C upon indemnity", D: "None of these" }, correctAnswer: "A" },
      { questionNumber: 90, question: "A person whom the agent names to act for the principal in the business of agency, under the express or implied authority to name, is called", options: { A: "Sub-agent", B: "Substituted Agent", C: "Agent", D: "Procured Agent" }, correctAnswer: "B" },
      { questionNumber: 91, question: "Which injunction can only be granted by the decree made at the hearing and upon the merits of the suit; the defendant is thereby perpetually enjoined?", options: { A: "Temporary", B: "Perpetual", C: "Both Temporary and Perpetual", D: "None of these" }, correctAnswer: "B" },
      { questionNumber: 92, question: "According to Section 5 of Specific Relief Act, 1963 a person entitled to the possession of specific immovable property may recover it in the manner provided in", options: { A: "The Specific Relief Act, 1963", B: "The Code of Civil Procedure, 1908", C: "The Code of Criminal Procedure, 1973", D: "The Transfer of Property Act, 1882" }, correctAnswer: "B" },
      { questionNumber: 93, question: "Where the mortgagor delivers possession of the mortgaged property to the mortgagee and permits him to retain such possession until payment of the mortgage-money, and to receive rents and profits accruing from the property in lieu of interest, or in payment of the mortgage-money, the transaction is called a ____ mortgage.", options: { A: "Conditional", B: "English", C: "Simple", D: "Usufructuary" }, correctAnswer: "D" },
      { questionNumber: 94, question: "In which of the following cases it was decided that a contract with minor is void?", options: { A: "Carlill v. Carbolic Smoke Ball Co", B: "Chinnaih v. Ramaiah", C: "Mohori Bibee v. Dharmodas Ghose", D: "Harvey v. Facey" }, correctAnswer: "C" },
      { questionNumber: 95, question: "Which of the following is/are CORRECT with respect to 'Declaratory Decrees' under The Specific Relief Act, 1963?", options: { A: "Section 34 of the said Act deals with it", B: "It is discretionary in nature", C: "Both (Section 34 of the said Act deals with it) and (It is discretionary in nature)", D: "None of these" }, correctAnswer: "C" },
      { questionNumber: 96, question: "Which of the following is not a Negotiable Instrument as defined under The Negotiable Instruments Act, 1881?", options: { A: "Promissory Note", B: "Bill of Exchange", C: "Cheque", D: "Billing Receipt" }, correctAnswer: "D" },
      { questionNumber: 97, question: "According to Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 appropriate Government can acquire the land for which of the following purposes? (1) strategic purposes relating to naval, military, air force, and armed forces of the Union (2) project for water harvesting and water conservation structures, sanitation (3) project for project affected families (4) project for sports, health care, tourism, transportation or space programme", options: { A: "1,2 and 3", B: "2,3 and 4", C: "1,2 and 4", D: "1,2,3 and 4" }, correctAnswer: "D" },
      { questionNumber: 98, question: "'Specified person' under Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 means any person other than", options: { A: "appropriate Government", B: "association of persons or trust or society wholly or partially aided by the appropriate Government", C: "Government company or controlled by the appropriate Government", D: "All of these" }, correctAnswer: "D" },
      { questionNumber: 99, question: "Who shall be the Registrar of Trade Marks for the purposes of Trade Marks Act, 1999?", options: { A: "Controller-General of Patents, Designs and Trade Marks", B: "Controller-General of Copyright, Designs and Trade Marks", C: "Director-General of Patents, Designs and Trade Marks", D: "Director-General of Copyright, Designs and Trade Marks" }, correctAnswer: "A" },
      { questionNumber: 100, question: "Which one of the following is not a type/s of IPR?", options: { A: "Copyright", B: "Patents", C: "Designs", D: "Historical Indications" }, correctAnswer: "D" }
    ];

    for (const q of questions) {
      await prisma.question.create({
        data: {
          testId: aibeTest.id,
          questionNumber: q.questionNumber,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        }
      });
    }

    console.log(`✅ AIBE-17 Mock Test created with ${questions.length} questions`);
    console.log(`📝 Test ID: ${aibeTest.id}`);
    return aibeTest;
  } catch (error) {
    console.error('Error seeding AIBE-17 test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ESM-safe runner
async function runIfMain() {
  try {
    await seedAIBETest17();
    console.log('🎉 AIBE-17 Mock Test seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding AIBE-17 test:', error);
    process.exit(1);
  }
}

const entry = process.argv[1] ?? '';
const scriptName = path.basename(entry).toLowerCase();

if (scriptName === 'aibe-17-test.ts' || scriptName === 'aibe-17-test.js') {
  runIfMain();
}