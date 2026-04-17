export interface Institution {
  id: string;
  name: string;
  tradition: "reformed" | "evangelical" | "catholic";
}

export interface ChristianSource {
  id: string;
  name: string;
}

export const CHRISTIAN_INSTITUTIONS: Institution[] = [
  // Reformed / Presbyterian
  { id: "I177154391", name: "Westminster Theological Seminary", tradition: "reformed" },
  { id: "I196659088", name: "Calvin Theological Seminary", tradition: "reformed" },
  { id: "I163795733", name: "Calvin University", tradition: "reformed" },
  { id: "I4405265428", name: "Reformed Theological Seminary", tradition: "reformed" },
  { id: "I2799340656", name: "Covenant Theological Seminary", tradition: "reformed" },
  { id: "I22283106", name: "Knox Theological Seminary", tradition: "reformed" },
  { id: "I159308992", name: "Princeton Theological Seminary", tradition: "reformed" },

  // Evangelical / Broadly Protestant
  { id: "I90098092", name: "Gordon-Conwell Theological Seminary", tradition: "evangelical" },
  { id: "I4400600937", name: "Southern Baptist Theological Seminary", tradition: "evangelical" },
  { id: "I73236664", name: "Wheaton College", tradition: "evangelical" },
  { id: "I152479009", name: "Biola University", tradition: "evangelical" },
  { id: "I31698873", name: "Dallas Theological Seminary", tradition: "evangelical" },
  { id: "I96521982", name: "Fuller Theological Seminary", tradition: "evangelical" },
  { id: "I335788046", name: "Moody Bible Institute", tradition: "evangelical" },
  { id: "I19250435", name: "Trinity International University", tradition: "evangelical" },
  { id: "I4210115436", name: "The Master's Seminary", tradition: "evangelical" },
  { id: "I56691919", name: "Christian Theological Seminary", tradition: "evangelical" },
  { id: "I71645499", name: "Luther Seminary", tradition: "evangelical" },

  // Catholic / Anglican / Ecumenical
  { id: "I191159885", name: "Ave Maria University", tradition: "catholic" },
  { id: "I200450580", name: "Christendom College", tradition: "catholic" },
  { id: "I109358023", name: "Franciscan University of Steubenville", tradition: "catholic" },
  { id: "I84470341", name: "Catholic University of America", tradition: "catholic" },
  { id: "I2799580044", name: "Thomas Aquinas College", tradition: "catholic" },
  { id: "I40120149", name: "University of Oxford", tradition: "catholic" },
  { id: "I241749", name: "University of Cambridge", tradition: "catholic" },
  { id: "I16835326", name: "University of St Andrews", tradition: "catholic" },
  { id: "I190082696", name: "Durham University", tradition: "catholic" },
  { id: "I195460627", name: "University of Aberdeen", tradition: "catholic" },
  { id: "I107639228", name: "University of Notre Dame", tradition: "catholic" },
  { id: "I136199984", name: "Harvard University", tradition: "catholic" },
];

export const CHRISTIAN_JOURNALS: ChristianSource[] = [
  // Reformed / Presbyterian journals
  { id: "S172707683", name: "Westminster Theological Journal" },
  { id: "S1025265836", name: "Calvin Theological Journal" },
  { id: "S4393918999", name: "Reformed Theological Review" },
  { id: "S81350151", name: "Journal of Reformed Theology" },
  { id: "S4210195638", name: "Unio cum Christo" },
  { id: "S977514457", name: "Kerux" },

  // Evangelical journals
  { id: "S2210832", name: "Journal of the Evangelical Theological Society" },
  { id: "S4256064", name: "Bibliotheca Sacra" },
  { id: "S9748430", name: "Themelios" },
  { id: "S98946164", name: "Tyndale Bulletin" },
  { id: "S4394735752", name: "The Evangelical Quarterly" },
  { id: "S5407042541", name: "Pneumatikos (Chafer Theological Seminary)" },

  // Catholic / Anglican / Ecumenical journals
  { id: "S70443789", name: "Scottish Journal of Theology" },
  { id: "S4210195324", name: "Pro Ecclesia" },
  { id: "S57189099", name: "First Things" },
  { id: "S185278035", name: "Modern Theology" },
  { id: "S70396470", name: "Neue Zeitschrift für Systematische Theologie" },
];

export function getInstitutionFilter(): string {
  return CHRISTIAN_INSTITUTIONS.map((i) => i.id).join("|");
}

export function getSourceFilter(): string {
  return CHRISTIAN_JOURNALS.map((s) => s.id).join("|");
}
