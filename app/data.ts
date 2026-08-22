export type Kind = "Belief" | "Narrative" | "Norm" | "Practice" | "Frame" | "Symbol";

export type Meme = {
  id: string;
  title: string;
  domain: string;
  kind: Kind;
  era: string;
  region: string;
  summary: string;
  confidence: "Candidate" | "Documented" | "Probable" | "Contested";
  sourceIds: string[];
};

export const domains = [
  "Belief & cosmology", "Governance & power", "Economy & exchange", "Identity & belonging",
  "Ethics & social order", "Knowledge & truth", "Technology & progress", "Health & body",
  "Family & kinship", "Nature & ecology", "Culture & aesthetics", "Digital culture",
] as const;

const domainSources: Record<string, string[]> = {
  "Belief & cosmology": ["hraf", "wvs", "sperber"],
  "Governance & power": ["wvs", "loc", "unesco"],
  "Economy & exchange": ["hraf", "wvs", "boyd"],
  "Identity & belonging": ["hraf", "wvs", "dplace"],
  "Ethics & social order": ["wvs", "hraf", "unesco"],
  "Knowledge & truth": ["loc", "unesco", "mesoudi"],
  "Technology & progress": ["loc", "ngrams", "boyd"],
  "Health & body": ["loc", "wvs", "hraf"],
  "Family & kinship": ["dplace", "hraf", "wvs"],
  "Nature & ecology": ["wvs", "unesco", "gdelt"],
  "Culture & aesthetics": ["loc", "unesco", "shifman"],
  "Digital culture": ["shifman", "families", "kym"],
};

const raw: Record<string, string> = {
  "Belief & cosmology": `
Animism~Belief~Prehistory~Global~Nonhuman beings, places, and forces are treated as having agency or spirit.
Ancestor veneration~Practice~Ancient~Global~The dead remain socially present and may influence the living.
Divine kingship~Frame~Ancient~Afro-Eurasia~Political authority is legitimated through divine ancestry or sacred office.
Monotheism~Belief~1st millennium BCE~West Asia~One supreme deity is held to govern moral and cosmic order.
Karma~Belief~1st millennium BCE~South Asia~Actions are understood to shape future consequences across a moral cosmos.
Reincarnation~Narrative~Ancient~South Asia and global~Persons or souls return in new lives after death.
Apocalypse~Narrative~Ancient~Global~History culminates in catastrophic judgment, renewal, or revelation.
Sacred pilgrimage~Practice~Ancient~Global~Travel to a holy place is framed as spiritually transformative.
Martyrdom~Narrative~Ancient~Global~Death for a cause becomes moral testimony and a model for others.
Secularism~Norm~Early modern~Europe and global~Public institutions should be distinct from religious authority.
Spiritual but not religious~Frame~Late 20th century~Global North~Personal spirituality is separated from formal institutions.
Simulation hypothesis~Belief~Late 20th century~Global digital culture~Experienced reality may be an artificial simulation.`,
  "Governance & power": `
Rule of law~Norm~Ancient~Global~Rulers and citizens are both subject to publicly known law.
Divine right of kings~Frame~Medieval~Europe~Monarchical power is represented as authorized directly by God.
Mandate of Heaven~Narrative~Ancient~China~Legitimate rule depends on moral conduct and can be withdrawn.
Popular sovereignty~Norm~Early modern~Atlantic world~Political authority is said to originate in the people.
Social contract~Frame~Early modern~Europe~Government is justified as an agreement among governed persons.
Separation of powers~Norm~18th century~Atlantic world~Dividing state powers is expected to prevent tyranny.
Self-determination~Norm~20th century~Global~Peoples should choose their political status and institutions.
Liberal democracy~Frame~18th century~Global~Elections, rights, law, and pluralism legitimate government.
Communism~Narrative~19th century~Global~Class ownership is replaced by common ownership and classless society.
Anarchism~Norm~19th century~Europe and global~Coercive hierarchy is unnecessary and should be dismantled.
Technocracy~Frame~20th century~Global~Experts and technical methods should guide complex public decisions.`,
  "Economy & exchange": `
Private property~Norm~Ancient~Global~Individuals or groups can hold exclusive rights over resources.
Gift reciprocity~Practice~Prehistory~Global~Gifts create durable obligations, alliances, and social status.
Usury taboo~Norm~Ancient~Afro-Eurasia~Charging interest is framed as morally dangerous or exploitative.
Just price~Norm~Medieval~Afro-Eurasia~Exchange should reflect fairness rather than bargaining power alone.
Mercantilism~Frame~Early modern~Europe~National wealth is linked to trade surpluses and state protection.
Socialism~Narrative~19th century~Global~Collective ownership can overcome exploitation and inequality.
Consumerism~Practice~20th century~Global~Identity and progress are expressed through acquiring goods.
Growth imperative~Norm~20th century~Global~Continuous economic expansion is treated as necessary and desirable.
Universal basic income~Norm~18th century to present~Global~All people should receive an unconditional income floor.
Degrowth~Narrative~Late 20th century~Global~Wellbeing can improve while material throughput deliberately contracts.`,
  "Identity & belonging": `
Kinship clan~Frame~Prehistory~Global~Descent groups define obligation, identity, and political solidarity.
Caste hierarchy~Norm~Ancient~South Asia and comparative~Birth status organizes occupation, marriage, and social rank.
Ethnic peoplehood~Narrative~Ancient~Global~Shared ancestry, language, and custom define a collective people.
Race as social category~Frame~Early modern~Atlantic world and global~Human variation is sorted into inherited political categories.
Citizenship~Norm~Ancient~Global~Membership in a polity creates rights, duties, and belonging.
Class consciousness~Frame~19th century~Global~People recognize shared interests through their position in production.
Gender binary~Norm~Ancient~Global~Social roles are organized around two opposing gender categories.
Feminism~Narrative~18th century~Global~Gender hierarchy is unjust and should be transformed.
Queer identity~Frame~Late 20th century~Global~Sexual and gender difference can ground identity and solidarity.
Intersectionality~Frame~Late 20th century~United States and global~Systems of power interact rather than acting independently.
Cosmopolitanism~Norm~Ancient~Global~Moral obligations extend beyond tribe, nation, or state.
Indigenous resurgence~Narrative~Late 20th century~Global~Indigenous sovereignty, knowledge, and land relations are renewed.`,
  "Ethics & social order": `
Golden rule~Norm~Ancient~Global~One should treat others as one wishes to be treated.
Honor and shame~Frame~Ancient~Global~Reputation and public standing regulate conduct.
Purity and pollution~Frame~Ancient~Global~Moral and social boundaries are expressed through cleanliness and taboo.
Human dignity~Norm~Ancient to modern~Global~Every person possesses intrinsic worth that limits how they may be treated.
Individual liberty~Norm~Early modern~Global~People should be free from unnecessary coercion.
Equality before law~Norm~Ancient to modern~Global~Legal standing should not depend on inherited rank.
Meritocracy~Frame~Ancient to modern~Global~Status should reflect ability and achievement rather than birth.
Duty to family~Norm~Ancient~Global~Kin obligations take priority over individual preference.
Nonviolence~Practice~Ancient~South Asia and global~Refusal of violence is both moral discipline and political strategy.
Animal rights~Norm~18th century~Global~Nonhuman animals possess interests that constrain human use.
Effective altruism~Practice~21st century~Global~Evidence and comparison should guide charitable effort.
Restorative justice~Practice~Ancient and modern~Global~Repair, accountability, and relationship restoration can replace punishment.`,
  "Knowledge & truth": `
Oral tradition~Practice~Prehistory~Global~Memory, performance, and repetition preserve knowledge across generations.
Writing preserves knowledge~Frame~Ancient~Global~Inscription allows claims to travel beyond a speaker's life and location.
Authority of scripture~Norm~Ancient~Global~Canonical texts are treated as privileged sources of truth.
Scholasticism~Practice~Medieval~Afro-Eurasia~Truth is pursued through commentary, disputation, and synthesis of authorities.
Scientific method~Practice~Early modern~Europe and global~Systematic observation and experiment constrain explanations.
Enlightenment reason~Narrative~18th century~Europe and global~Public reason can free humanity from ignorance and arbitrary authority.
Peer review~Practice~17th century~Global science~Specialists evaluate claims before formal publication.
Falsifiability~Norm~20th century~Global science~Scientific claims should expose themselves to possible refutation.
Expertise~Frame~Ancient to modern~Global~Specialized training grants greater authority within a defined field.
Conspiracy thinking~Narrative~Ancient~Global~Hidden coordinated actors are said to explain complex events.
Lived experience~Frame~20th century~Global~First-person experience is treated as an important source of knowledge.
Open knowledge~Norm~Late 20th century~Global~Information and research should be freely accessible and reusable.`,
  "Technology & progress": `
Tools extend humanity~Frame~Prehistory~Global~Artifacts are understood as extensions of human capacity.
Printing spreads reform~Narrative~15th century~Europe and global~Cheap reproduction lets new doctrines bypass established gatekeepers.
Industrial progress~Narrative~18th century~Global~Mechanization is framed as a general path toward prosperity.
Technological unemployment~Narrative~19th century~Global~Machines may permanently replace human labor.
Electrification as modernity~Symbol~19th century~Global~Electric light and power signify modernization.
Nuclear utopia~Narrative~20th century~Global~Atomic energy promises near-limitless clean power and abundance.
Nuclear apocalypse~Narrative~20th century~Global~Civilization may end through technologically amplified war.
Space frontier~Narrative~20th century~Global~Human destiny is projected outward through exploration and settlement.
Internet freedom~Norm~Late 20th century~Global~Open networks should resist censorship and centralized control.
Open source~Practice~Late 20th century~Global~Shared code enables collective improvement and distributed ownership.
Disruption~Frame~Late 20th century~Global business~Replacing incumbents is treated as evidence of innovation.
Transhumanism~Narrative~20th century~Global~Technology can and should expand human capacities and lifespan.`,
  "Health & body": `
Humoral medicine~Frame~Ancient~Afro-Eurasia~Health is explained as balance among bodily substances and qualities.
Vitalism~Belief~Ancient to modern~Global~Living systems are thought to possess a special animating force.
Germ theory~Frame~19th century~Global~Specific microorganisms are understood to cause infectious disease.
Public sanitation~Practice~19th century~Global~Collective infrastructure prevents disease through clean water and waste control.
Vaccination~Practice~18th century~Global~Controlled immune exposure can prevent later disease.
Biomedical model~Frame~19th century~Global~Disease is located in measurable biological dysfunction.
Eugenics~Narrative~19th century~Global~State or social control of reproduction is claimed to improve populations.
Psychoanalysis~Frame~19th century~Europe and global~Unconscious conflict is used to explain thought and behavior.
Fitness culture~Practice~20th century~Global~Exercise becomes a project of health, identity, and self-discipline.
Body positivity~Norm~Late 20th century~Global~Bodies outside dominant ideals deserve acceptance and visibility.
Wellness naturalism~Frame~Late 20th century~Global~Natural products and ancestral practices are framed as inherently healthier.
Quantified self~Practice~21st century~Global~Personal data is used to understand and optimize the body.`,
  "Family & kinship": `
Monogamy~Norm~Ancient~Global~Exclusive pair bonding is institutionalized as the preferred family form.
Polygyny~Practice~Ancient~Global~One man may hold socially recognized marriages with multiple women.
Arranged marriage~Practice~Ancient~Global~Families select spouses to align kinship, status, and resources.
Romantic love~Narrative~Medieval to modern~Global~Personal passion is treated as the proper basis for partnership.
Nuclear family~Frame~Modern~Global~Parents and dependent children are represented as the basic household unit.
Extended family duty~Norm~Ancient~Global~Wider kin share care, resources, and decision authority.
Childhood innocence~Frame~Early modern~Global~Children are treated as a distinct protected stage of life.
Pronatalism~Norm~Ancient~Global~Having children is framed as civic, religious, or personal duty.
Childfree identity~Frame~Late 20th century~Global~Voluntary non-parenthood becomes a legitimate life path.
Chosen family~Practice~20th century~Global~Non-kin relationships take on durable familial roles.
Companionate marriage~Norm~20th century~Global~Marriage is expected to center affection, intimacy, and mutual fulfillment.
Filial piety~Norm~Ancient~East Asia and comparative~Respect and care for parents structure family morality.`,
  "Nature & ecology": `
Human dominion over nature~Frame~Ancient~Global~Nature is represented as existing for human use and stewardship.
Sacred nature~Belief~Ancient~Global~Landscapes and living beings hold intrinsic spiritual significance.
Wilderness~Frame~Early modern~Global~Nature is imagined as a realm separate from civilization.
Conservation~Practice~19th century~Global~Species and habitats are managed to prevent loss.
Environmentalism~Narrative~20th century~Global~Industrial society must reduce harm to ecological systems.
Limits to growth~Narrative~20th century~Global~Finite planetary resources constrain material expansion.
Climate justice~Norm~Late 20th century~Global~Climate harms and responsibilities are distributed unequally.
Animal conservation~Norm~19th century~Global~Wild species possess value that justifies protection.
Sustainable development~Frame~20th century~Global~Development should meet present needs without eroding future capacity.
Circular economy~Frame~Late 20th century~Global~Materials should circulate through reuse rather than become waste.
Rewilding~Practice~Late 20th century~Global~Ecological processes can recover through reduced human control.
Planetary boundaries~Frame~21st century~Global~Earth systems have thresholds that define a safe operating space.`,
  "Culture & aesthetics": `
Epic hero~Narrative~Ancient~Global~A larger-than-life protagonist embodies collective virtues and origins.
Tragedy~Narrative~Ancient~Mediterranean and global~Human greatness and error unfold under irreversible consequence.
Romanticism~Frame~18th century~Europe and global~Emotion, nature, and individual imagination resist strict rationalism.
Realism~Norm~19th century~Global~Art should depict ordinary life and social conditions without idealization.
Modernism~Narrative~Late 19th century~Global~Inherited forms must be broken to represent modern life.
Avant-garde~Practice~19th century~Global~Art advances by deliberately violating convention.
Mass culture~Frame~20th century~Global~Industrial media produces shared entertainment at population scale.
Celebrity~Frame~19th century~Global~Public personalities become vessels for aspiration and collective attention.
Authenticity~Norm~Modern~Global~Expression is valued when it appears faithful to an inner self or origin.
Nostalgia~Narrative~Ancient to modern~Global~An idealized past is used to interpret loss and change.
Cultural appropriation~Frame~Late 20th century~Global~Borrowing can reproduce unequal power and detach forms from communities.
Remix culture~Practice~Late 20th century~Global~New works emerge through recombination, quotation, and transformation.`,
  "Digital culture": `
Emoticon~Symbol~1982~Global internet~Typed punctuation transmits facial expression across text networks.
Chain email~Practice~1990s~Global internet~Messages spread by asking each recipient to forward them onward.
LOLcats~Narrative~2000s~Global internet~Captioned animal images create a participatory comic dialect.
Image macro~Practice~2000s~Global internet~Reusable image templates carry changing text and viewpoints.
Rickrolling~Practice~2007~Global internet~A misleading link redirects audiences to a shared musical joke.
Hashtag activism~Practice~2009 onward~Global internet~A short tag coordinates attention, testimony, and collective action.
Selfie culture~Practice~2000s~Global~Self-portraiture becomes routine social communication and identity work.
Influencer authenticity~Frame~2010s~Global~Commercial persuasion is presented through personal intimacy and relatability.
Virality~Frame~1990s~Global~Rapid copying is treated as a measure of cultural success.
Fandom~Practice~20th century to present~Global~Audiences collectively interpret, celebrate, and transform cultural works.
Doomscrolling~Practice~2020s~Global~Compulsive consumption of negative feeds becomes a named behavior.
Algorithmic personalization~Frame~2010s~Global~Automated ranking is expected to tailor reality to each user.`,
};

const kinds: Kind[] = ["Belief", "Narrative", "Norm", "Practice", "Frame", "Symbol"];
let index = 0;
export const memes: Meme[] = Object.entries(raw).flatMap(([domain, block]) =>
  block.trim().split("\n").map((line) => {
    const [title, kind, era, region, summary] = line.split("~");
    index += 1;
    return {
      id: `m${index}`,
      title,
      domain,
      kind: kinds.includes(kind as Kind) ? kind as Kind : "Frame",
      era,
      region,
      summary,
      confidence: "Candidate",
      sourceIds: domainSources[domain],
    };
  })
);

export const sources = [
  {id:"dawkins",type:"Book",title:"The Selfish Gene",creator:"Richard Dawkins",year:"1976",url:"https://global.oup.com/academic/product/the-selfish-gene-9780198788607",use:"Introduced the term meme as a unit of cultural transmission."},
  {id:"girard",type:"Theory",title:"Mimetic Theory",creator:"René Girard",year:"1961 onward",url:"https://www.imitatio.org/brief-intro",use:"Explains how people imitate models, desires, rivalries, and collective behavior."},
  {id:"boyd",type:"Book",title:"Culture and the Evolutionary Process",creator:"Robert Boyd and Peter J. Richerson",year:"1985",url:"https://press.uchicago.edu/ucp/books/book/chicago/C/bo5970597.html",use:"Formal models of cultural inheritance and transmission bias."},
  {id:"mesoudi",type:"Book",title:"Cultural Evolution",creator:"Alex Mesoudi",year:"2011",url:"https://press.uchicago.edu/ucp/books/book/chicago/C/bo8787426.html",use:"Research synthesis spanning psychology, anthropology, and biology."},
  {id:"sperber",type:"Book",title:"Explaining Culture",creator:"Dan Sperber",year:"1996",url:"https://www.wiley.com/en-us/Explaining+Culture%3A+A+Naturalistic+Approach-p-9780631200451",use:"Epidemiology of representations and cultural attraction."},
  {id:"shifman",type:"Book",title:"Memes in Digital Culture",creator:"Limor Shifman",year:"2014",url:"https://mitpress.mit.edu/9780262525435/memes-in-digital-culture/",use:"Defines internet memes as groups of related digital items."},
  {id:"families",type:"Paper",title:"Families and Networks of Internet Memes",creator:"Elad Segev et al.",year:"2015",url:"https://academic.oup.com/jcmc/article/20/4/417/4067574",use:"Network analysis of more than one thousand meme instances."},
  {id:"traits",type:"Paper",title:"Cultural Traits as Units of Analysis",creator:"Michael J. O'Brien et al.",year:"2010",url:"https://royalsocietypublishing.org/doi/10.1098/rstb.2010.0012",use:"Operationalizes cultural traits as identifiable units of transmission and diffusion."},
  {id:"mind-viruses",type:"Paper",title:"Mind Viruses in Multi-Agent LLM Systems",creator:"Vassilis Papadopoulos et al.",year:"2026",url:"https://arxiv.org/abs/2608.10218",use:"Tests self-propagating ideas across interacting AI agents and identifies factors affecting spread."},
  {id:"hraf",type:"Dataset",title:"eHRAF World Cultures",creator:"Human Relations Area Files at Yale",year:"Ongoing",url:"https://ehrafworldcultures.yale.edu/ehrafe/",use:"Cross-cultural ethnographic evidence indexed by subject and society."},
  {id:"dplace",type:"Dataset",title:"D-PLACE",creator:"Max Planck Institute and collaborators",year:"Ongoing",url:"https://d-place.org/",use:"Places, languages, cultures, and environmental variables."},
  {id:"wvs",type:"Dataset",title:"World Values Survey",creator:"World Values Survey Association",year:"1981 to present",url:"https://www.worldvaluessurvey.org/",use:"Comparative values and beliefs across societies and time."},
  {id:"ngrams",type:"Dataset",title:"Google Books Ngram Viewer",creator:"Google Research",year:"1800 to present",url:"https://books.google.com/ngrams/",use:"Long-run frequency traces across digitized books."},
  {id:"loc",type:"Archive",title:"Library of Congress Digital Collections",creator:"Library of Congress",year:"Ongoing",url:"https://www.loc.gov/collections/",use:"Primary texts, photographs, recordings, maps, and ephemera."},
  {id:"unesco",type:"Archive",title:"Memory of the World",creator:"UNESCO",year:"Ongoing",url:"https://www.unesco.org/en/memory-world",use:"Documentary heritage of global historical significance."},
  {id:"gdelt",type:"Dataset",title:"GDELT Project",creator:"GDELT",year:"1979 to present",url:"https://www.gdeltproject.org/",use:"Global news events, themes, locations, and emotions."},
  {id:"kym",type:"Archive",title:"Know Your Meme",creator:"Literally Media",year:"2008 to present",url:"https://knowyourmeme.com/",use:"Community-documented histories of internet meme formats."},
];

export const events = [
  {year:"c. 3200 BCE",title:"Writing systems emerge",place:"Mesopotamia and Egypt",text:"Ideas acquire durable, inspectable forms that can cross generations without a living teller.",source:"https://www.britishmuseum.org/collection/galleries/writing",image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cuneiform_script2.jpg?width=1000"},
  {year:"c. 500 BCE",title:"Axial traditions consolidate",place:"Afro-Eurasia",text:"Philosophical and religious systems formalize portable moral teachings and universal claims.",source:"https://plato.stanford.edu/entries/comparphil-chiwes/",image:""},
  {year:"105",title:"Paper-making recorded",place:"Han China",text:"A lighter writing surface lowers the cost of copying and administration.",source:"https://www.metmuseum.org/toah/hd/pape/hd_pape.htm",image:""},
  {year:"c. 1450",title:"Movable-type printing expands",place:"Europe",text:"Reproducible text accelerates religious, scientific, and political contention.",source:"https://www.loc.gov/exhibits/world/world-record.html",image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Printing_press,_Gutenberg_Museum,_Mainz.jpg?width=1000"},
  {year:"1517",title:"Reformation theses circulate",place:"Europe",text:"Print networks help a doctrinal dispute become a mass movement with local variants.",source:"https://www.loc.gov/exhibits/dres/dres3.html",image:""},
  {year:"1776 to 1789",title:"Rights revolutions",place:"Atlantic world",text:"Declarations turn popular sovereignty and universal rights into copyable political programs.",source:"https://www.archives.gov/founding-docs/declaration",image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/United_States_Declaration_of_Independence.jpg?width=1000"},
  {year:"1848",title:"The Communist Manifesto",place:"Europe and global",text:"A compact political text becomes a template for parties, revolutions, and counter-movements.",source:"https://www.marxists.org/archive/marx/works/1848/communist-manifesto/",image:""},
  {year:"1895",title:"Cinema becomes public spectacle",place:"France and global",text:"Moving images create a new high-fidelity channel for gestures, stories, and lifestyles.",source:"https://www.institut-lumiere.org/musee/les-freres-lumiere-et-leurs-inventions.html",image:""},
  {year:"1920s",title:"Broadcast radio scales",place:"Global",text:"One-to-many transmission synchronizes national audiences and political messaging.",source:"https://www.loc.gov/collections/national-jukebox/about-this-collection/",image:""},
  {year:"1948",title:"Universal Declaration of Human Rights",place:"United Nations",text:"A rights vocabulary becomes a global reference point, even where application remains contested.",source:"https://www.un.org/en/about-us/universal-declaration-of-human-rights",image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Eleanor_Roosevelt_UDHR.jpg?width=1000"},
  {year:"1968",title:"Earthrise",place:"Lunar orbit",text:"A single photograph strengthens the image of Earth as one fragile shared system.",source:"https://www.archives.gov/exhibits/picturing_the_century/century/century_img89.html",image:"https://www.archives.gov/exhibits/picturing_the_century/images/century_089_v142.jpg"},
  {year:"1989",title:"Berlin Wall falls",place:"Berlin",text:"Televised crowds and copied slogans materialize the collapse of a political order.",source:"https://www.bundesregierung.de/breg-en/service/archive/media-center/the-fall-of-the-berlin-wall-1989-1992048",image:"https://upload.wikimedia.org/wikipedia/commons/6/62/Berlin_1989%2C_Fall_der_Mauer%2C_Chute_du_mur_18.jpg"},
  {year:"1989",title:"The Web is proposed",place:"CERN",text:"Linked documents create an open distribution layer for near-instant global copying.",source:"https://home.cern/science/computing/birth-web",image:""},
  {year:"2007",title:"Hashtags become social infrastructure",place:"Global internet",text:"A user convention evolves into a mechanism for discovery, coordination, and protest.",source:"https://www.loc.gov/item/2015648026/",image:""},
  {year:"2020",title:"Pandemic infodemic",place:"Global",text:"Public-health knowledge, rumor, identity, and platform dynamics collide at unprecedented speed.",source:"https://www.who.int/health-topics/infodemic",image:""},
];
