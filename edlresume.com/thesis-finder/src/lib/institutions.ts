export interface Institution {
  id: string;
  name: string;
  tradition: "reformed" | "evangelical" | "catholic";
}

export const CHRISTIAN_INSTITUTIONS: Institution[] = [
  // Reformed
  { id: "I177154391", name: "Westminster Theological Seminary", tradition: "reformed" },
  { id: "I196659088", name: "Calvin Theological Seminary", tradition: "reformed" },
  { id: "I163795733", name: "Calvin University", tradition: "reformed" },
  { id: "I2799340656", name: "Covenant Theological Seminary", tradition: "reformed" },
  { id: "I22283106", name: "Knox Theological Seminary", tradition: "reformed" },
  { id: "I159308992", name: "Princeton Theological Seminary", tradition: "reformed" },

  // Evangelical
  { id: "I90098092", name: "Gordon-Conwell Theological Seminary", tradition: "evangelical" },
  { id: "I4400600937", name: "Southern Baptist Theological Seminary", tradition: "evangelical" },
  { id: "I73236664", name: "Wheaton College", tradition: "evangelical" },
  { id: "I152479009", name: "Biola University", tradition: "evangelical" },
  { id: "I31698873", name: "Dallas Theological Seminary", tradition: "evangelical" },
  { id: "I96521982", name: "Fuller Theological Seminary", tradition: "evangelical" },
  { id: "I335788046", name: "Moody Bible Institute", tradition: "evangelical" },

  // Conservative Catholic
  { id: "I191159885", name: "Ave Maria University", tradition: "catholic" },
  { id: "I200450580", name: "Christendom College", tradition: "catholic" },
  { id: "I109358023", name: "Franciscan University of Steubenville", tradition: "catholic" },
  { id: "I84470341", name: "Catholic University of America", tradition: "catholic" },
  { id: "I2799580044", name: "Thomas Aquinas College", tradition: "catholic" },
];

export function getInstitutionFilter(): string {
  return CHRISTIAN_INSTITUTIONS.map((i) => i.id).join("|");
}
