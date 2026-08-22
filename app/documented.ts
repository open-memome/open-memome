export type EvidenceItem = {
  label: string;
  date: string;
  kind: "Historical occurrence" | "Modern occurrence" | "Reach observation" | "Research review";
  note: string;
  url: string;
};

export type RecordDocumentation = {
  level: "Meme family" | "Specific frame" | "Specific practice" | "Belief system";
  period: string;
  region: string;
  scope: string;
  evidence: EvidenceItem[];
};

const globalReligionReach = {
  label: "Global religious change",
  date: "2010 to 2020",
  kind: "Reach observation" as const,
  note: "Pew estimates the size and geographic distribution of major religious populations from censuses and surveys.",
  url: "https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/",
};

export const documentedRecords: Record<string, RecordDocumentation> = {
  "wd-q5043": {
    level: "Meme family",
    period: "1st century CE to present",
    region: "West Asia to global",
    scope: "Christianity is mapped here as a family of related teachings, narratives, rituals and institutions. Denominations and doctrines should be represented as child records.",
    evidence: [
      {label:"Codex Sinaiticus",date:"4th century CE",kind:"Historical occurrence",note:"One of the earliest substantially complete Christian Bibles, including the oldest complete New Testament copy.",url:"https://www.codexsinaiticus.org/"},
      globalReligionReach,
    ],
  },
  "wd-q432": {
    level: "Meme family",
    period: "7th century CE to present",
    region: "Arabia to global",
    scope: "Islam is mapped as a family of teachings, practices, legal traditions and communal identities. Schools, movements and doctrines belong in child records.",
    evidence: [
      {label:"Birmingham Qur'an manuscript",date:"7th century CE",kind:"Historical occurrence",note:"An early surviving Qur'an fragment preserves parts of surahs 18 to 20 in Hijazi script.",url:"https://www.birmingham.ac.uk/facilities/cadbury/birmingham-quran-mingana-collection/birmingham-quran"},
      globalReligionReach,
    ],
  },
  "wd-q748": {
    level: "Meme family",
    period: "5th century BCE to present",
    region: "South Asia to global",
    scope: "Buddhism is mapped as a family of teachings and practices concerned with suffering, conduct and liberation. Traditions and doctrines require child records.",
    evidence: [
      {label:"Early Buddhist Manuscripts Project",date:"1st century BCE to 3rd century CE",kind:"Historical occurrence",note:"The oldest surviving Buddhist manuscripts document early textual transmission into Central and East Asia.",url:"https://asian.washington.edu/early-buddhist-manuscripts-project"},
      globalReligionReach,
    ],
  },
  "wd-q9089": {
    level: "Meme family",
    period: "2nd millennium BCE to present",
    region: "South Asia and global diaspora",
    scope: "Hinduism is mapped as a family of diverse traditions linked by overlapping texts, practices and concepts. Specific schools and practices require child records.",
    evidence: [
      {label:"Rigveda manuscripts",date:"2nd millennium BCE tradition",kind:"Historical occurrence",note:"UNESCO documents the Rigveda as the oldest Veda and a foundational source transmitted across South and Southeast Asia.",url:"https://www.unesco.org/en/memory-world/rigveda"},
      globalReligionReach,
    ],
  },
  "wd-q9268": {
    level: "Meme family",
    period: "1st millennium BCE to present",
    region: "West Asia and global diaspora",
    scope: "Judaism is mapped as a family of covenantal narratives, law, ritual and communal identity. Movements and particular teachings require child records.",
    evidence: [
      {label:"Digital Dead Sea Scrolls",date:"3rd century BCE to 1st century CE",kind:"Historical occurrence",note:"Ancient biblical and communal manuscripts provide inspectable evidence of textual variation and transmission.",url:"https://dss.collections.imj.org.il/"},
      globalReligionReach,
    ],
  },
  "wd-q7174": {
    level: "Meme family",
    period: "18th century to present",
    region: "Global",
    scope: "Modern democracy is represented as a family of claims about popular authority, elections, rights and accountability. Particular institutional models require child records.",
    evidence: [
      {label:"Universal Declaration of Human Rights, Article 21",date:"1948",kind:"Historical occurrence",note:"The declaration states that the will of the people is the basis of governmental authority and specifies genuine elections.",url:"https://www.un.org/en/about-us/universal-declaration-of-human-rights"},
      {label:"V-Dem electoral democracy series",date:"1789 to present",kind:"Reach observation",note:"Country-year observations track the expansion and contraction of democratic institutions over time.",url:"https://ourworldindata.org/grapher/electoral-democracy-index"},
    ],
  },
  "wd-q6206": {
    level: "Meme family",
    period: "18th century to present",
    region: "Global",
    scope: "Capitalism is treated as an economic memeplex linking private ownership, wage labour, markets, accumulation and profit. Its institutional variants require child records.",
    evidence: [
      {label:"Capital, Volume I",date:"1867",kind:"Historical occurrence",note:"Marx's critique gives a dated, widely reproduced account of capitalist production and its internal categories.",url:"https://www.marxists.org/archive/marx/works/1867-c1/"},
      {label:"What is capitalism?",date:"2015",kind:"Modern occurrence",note:"The IMF documents the contemporary system through private ownership, market prices, capital and profit.",url:"https://www.imf.org/external/pubs/ft/fandd/2015/06/basics.htm"},
    ],
  },
  "wd-q6235": {
    level: "Belief system",
    period: "Late 18th century to present",
    region: "Global",
    scope: "This record covers the belief that a nation is a primary political community entitled to loyalty and collective self-rule. Particular nationalisms require child records.",
    evidence: [
      {label:"Nationalism",date:"Research synthesis",kind:"Research review",note:"The Stanford Encyclopedia distinguishes nationalism as ideology, political movement and psychological disposition.",url:"https://plato.stanford.edu/entries/nationalism/"},
      {label:"World Values Survey",date:"1981 to present",kind:"Reach observation",note:"Repeated cross-national surveys measure national pride, identity and related political values.",url:"https://www.worldvaluessurvey.org/WVSDocumentationWV7.jsp"},
    ],
  },
  "wd-q1368": {
    level: "Specific frame",
    period: "Ancient to present",
    region: "Global",
    scope: "The mapped frame is that money works because people expect others to recognize and accept it. It is narrower than money as a whole.",
    evidence: [
      {label:"Money gallery",date:"4,000 years of material evidence",kind:"Historical occurrence",note:"The British Museum documents changing monetary carriers, from shells and coins to banknotes and digital forms.",url:"https://www.britishmuseum.org/collection/galleries/money"},
      {label:"Why does money depend on trust?",date:"2020",kind:"Modern occurrence",note:"The Bank of England explicitly communicates shared acceptance and institutional trust as foundations of monetary value.",url:"https://www.bankofengland.co.uk/explainers/why-does-money-depend-on-trust"},
    ],
  },
  "wd-q48235": {
    level: "Belief system",
    period: "3rd century BCE to present",
    region: "Mediterranean to global",
    scope: "Stoicism is a connected philosophical system, not one slogan. Particular doctrines such as the primacy of virtue should also be mapped separately.",
    evidence: [
      {label:"Stoicism",date:"Research synthesis",kind:"Research review",note:"The Stanford Encyclopedia traces the school's doctrines, sources and transmission from the Hellenistic period onward.",url:"https://plato.stanford.edu/entries/stoicism/"},
      {label:"Meditations of Marcus Aurelius",date:"2nd century CE",kind:"Historical occurrence",note:"A widely recopied Roman carrier of Stoic ethical practice and self-instruction.",url:"https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:2008.01.0641"},
    ],
  },
  "wd-q34362": {
    level: "Belief system",
    period: "1st millennium BCE to present",
    region: "Eurasia and global",
    scope: "The copied belief is that celestial positions bear meaning for human events or character. Specific systems and horoscope formats require child records.",
    evidence: [
      {label:"Late Babylonian zodiac tablet",date:"1st millennium BCE",kind:"Historical occurrence",note:"A material carrier lists months with associated signs of the zodiac.",url:"https://www.britishmuseum.org/collection/object/W_1885-0430-15"},
      {label:"Belief in astrology survey",date:"2024",kind:"Reach observation",note:"A representative Pew survey measures contemporary belief and use in the United States.",url:"https://www.pewresearch.org/religion/2025/05/21/3-in-10-americans-consult-astrology-tarot-cards-or-fortune-tellers/"},
    ],
  },
  "wd-q237525": {
    level: "Specific frame",
    period: "1993 to present",
    region: "Global technology culture",
    scope: "The frame predicts a discontinuity after the creation of greater-than-human intelligence. Claims about dates, mechanisms and outcomes are variants.",
    evidence: [
      {label:"The Coming Technological Singularity",date:"1993",kind:"Historical occurrence",note:"Vernor Vinge's NASA-hosted conference paper states and develops the modern technological-singularity frame.",url:"https://ntrs.nasa.gov/citations/19940022856"},
      {label:"The Singularity Is Nearer",date:"2024",kind:"Modern occurrence",note:"Ray Kurzweil's later formulation shows continued reproduction and mutation of the frame.",url:"https://www.penguinrandomhouse.com/books/288771/the-singularity-is-nearer-by-ray-kurzweil/"},
    ],
  },
  "wd-q131723": {
    level: "Specific frame",
    period: "2010s to present",
    region: "Global financial culture",
    scope: "This record covers the claim that Bitcoin's scarcity makes it a durable store of value comparable to gold. It does not assert that the comparison is true.",
    evidence: [
      {label:"Should we compare Bitcoin to gold?",date:"2024",kind:"Modern occurrence",note:"Wharton documents the spread of the digital-gold comparison and examines its limits.",url:"https://knowledge.wharton.upenn.edu/article/should-we-compare-bitcoin-to-gold-lessons-from-the-last-financial-crisis/"},
      {label:"Institutional demand for Bitcoin",date:"2025",kind:"Modern occurrence",note:"State Street repeats the digital-gold label while recording differences in volatility and ownership.",url:"https://www.ssga.com/us/en/institutional/insights/why-bitcoin-institutional-demand-is-on-the-rise"},
    ],
  },
  "wd-q1070684": {
    level: "Specific practice",
    period: "1921 to present",
    region: "Clinical medicine to global lifestyle culture",
    scope: "The practice deliberately restricts carbohydrate to induce nutritional ketosis. Therapeutic protocols and lifestyle variants should be distinguished.",
    evidence: [
      {label:"History of the ketogenic diet",date:"1920s onward",kind:"Historical occurrence",note:"A medical history traces the diet's creation for epilepsy, decline and later revival.",url:"https://pubmed.ncbi.nlm.nih.gov/19049574/"},
      {label:"Ketogenic diets and health outcomes",date:"2023",kind:"Research review",note:"An umbrella review maps the modern clinical literature and the varying strength of health claims.",url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10574428/"},
    ],
  },
  "wd-q181138": {
    level: "Specific practice",
    period: "1944 to present",
    region: "Britain to global",
    scope: "Modern veganism combines avoidance of animal-derived products with an anti-exploitation ethic. Dietary and ethical variants should remain distinguishable.",
    evidence: [
      {label:"History of The Vegan Society",date:"1944 onward",kind:"Historical occurrence",note:"The organization documents the coinage, early carriers and changing definition of veganism.",url:"https://www.vegansociety.com/about-us/history"},
      {label:"Vegetarian and vegan survey data",date:"2018 onward",kind:"Reach observation",note:"Our World in Data compiles survey estimates while retaining differences in definitions and samples.",url:"https://ourworldindata.org/vegetarian-vegan"},
    ],
  },
  "wd-q83364": {
    level: "Specific practice",
    period: "Ancient to present",
    region: "Multiple independent regions",
    scope: "Vegetarianism covers intentional abstention from meat. Religious, ethical and health rationales are related variants with partly independent histories.",
    evidence: [
      {label:"Historical development of vegetarianism",date:"Ancient to modern",kind:"Research review",note:"A historical review distinguishes older religious and ethical practices from modern health rationales.",url:"https://ajcn.nutrition.org/article/S0002-9165%2823%2919578-5/fulltext"},
      {label:"Vegetarian and vegan survey data",date:"2018 onward",kind:"Reach observation",note:"Cross-country surveys provide bounded, dated estimates with visible methodological limits.",url:"https://ourworldindata.org/vegetarian-vegan"},
    ],
  },
  "wd-q1666254": {
    level: "Specific practice",
    period: "Ancient ritual variants to modern health practice",
    region: "Global",
    scope: "The modern umbrella groups recurring fasting and feeding schedules. Ramadan, alternate-day fasting and time-restricted eating are distinct variants.",
    evidence: [
      {label:"Origins and modern forms",date:"2022",kind:"Research review",note:"A review connects current protocols to older religious fasting traditions while distinguishing their purposes.",url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9946909/"},
      {label:"Intermittent fasting outcomes",date:"2024",kind:"Research review",note:"An umbrella review documents multiple recurring protocols and evaluates their measured effects.",url:"https://pubmed.ncbi.nlm.nih.gov/38500840/"},
    ],
  },
  "wd-q87409576": {
    level: "Specific practice",
    period: "2010s to present",
    region: "Online health culture, mainly Anglophone",
    scope: "The copied practice is eating only or almost only animal foods. It may be modeled as a radical low-carbohydrate variant, but that lineage remains under review.",
    evidence: [
      {label:"Carnivore diet participant survey",date:"2021",kind:"Modern occurrence",note:"A survey of 2,029 self-identified adherents documents a recognizable practice and its stated motivations, with self-report limitations.",url:"https://pubmed.ncbi.nlm.nih.gov/34934897/"},
      {label:"Carnivore diet scoping review",date:"2026",kind:"Research review",note:"A review identifies nine human studies and emphasizes the limited, heterogeneous evidence base.",url:"https://pubmed.ncbi.nlm.nih.gov/41599961/"},
    ],
  },
};

export const statusOverrides: Record<string, "Discovery lead"> = {
  "wd-q9174": "Discovery lead",
};
