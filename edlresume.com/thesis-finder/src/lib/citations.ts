import { OpenAlexWork } from "./openalex";

function getAuthors(work: OpenAlexWork): string[] {
  return work.authorships.map((a) => a.author.display_name).filter(Boolean);
}

function lastFirst(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const last = parts.pop()!;
  return `${last}, ${parts.join(" ")}`;
}

function doiUrl(work: OpenAlexWork): string {
  if (work.doi) {
    return work.doi.startsWith("http") ? work.doi : `https://doi.org/${work.doi}`;
  }
  return "";
}

export function toBibtex(work: OpenAlexWork): string {
  const authors = getAuthors(work);
  const key =
    (authors[0]?.split(/\s+/).pop()?.toLowerCase() ?? "unknown") +
    (work.publication_year ?? "nd");
  const journal = work.primary_location?.source?.display_name ?? "";
  const doi = work.doi?.replace(/^https?:\/\/doi\.org\//, "") ?? "";

  const fields: string[] = [
    `  title     = {${work.title ?? "Untitled"}}`,
    `  author    = {${authors.map(lastFirst).join(" and ")}}`,
    `  year      = {${work.publication_year ?? ""}}`,
  ];
  if (journal) fields.push(`  journal   = {${journal}}`);
  if (doi) fields.push(`  doi       = {${doi}}`);

  return `@article{${key},\n${fields.join(",\n")}\n}`;
}

export function toAPA(work: OpenAlexWork): string {
  const authors = getAuthors(work);
  let authorStr: string;
  if (authors.length === 0) {
    authorStr = "Unknown";
  } else if (authors.length <= 2) {
    authorStr = authors.map(lastFirst).join(", & ");
  } else {
    authorStr = `${lastFirst(authors[0])}, et al.`;
  }

  const year = work.publication_year ? `(${work.publication_year})` : "(n.d.)";
  const title = work.title ?? "Untitled";
  const source = work.primary_location?.source?.display_name;
  const doi = doiUrl(work);

  let citation = `${authorStr} ${year}. ${title}.`;
  if (source) citation += ` *${source}*.`;
  if (doi) citation += ` ${doi}`;
  return citation;
}

export function toMLA(work: OpenAlexWork): string {
  const authors = getAuthors(work);
  let authorStr: string;
  if (authors.length === 0) {
    authorStr = "Unknown";
  } else if (authors.length === 1) {
    authorStr = lastFirst(authors[0]);
  } else if (authors.length === 2) {
    authorStr = `${lastFirst(authors[0])}, and ${authors[1]}`;
  } else {
    authorStr = `${lastFirst(authors[0])}, et al.`;
  }

  const title = `"${work.title ?? "Untitled"}."`;
  const source = work.primary_location?.source?.display_name;
  const year = work.publication_year ?? "n.d.";
  const doi = doiUrl(work);

  let citation = `${authorStr}. ${title}`;
  if (source) citation += ` *${source}*,`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}.`;
  return citation;
}

export function toChicago(work: OpenAlexWork): string {
  const authors = getAuthors(work);
  let authorStr: string;
  if (authors.length === 0) {
    authorStr = "Unknown";
  } else if (authors.length <= 3) {
    authorStr = authors.map(lastFirst).join(", ");
  } else {
    authorStr = `${lastFirst(authors[0])}, et al.`;
  }

  const title = `"${work.title ?? "Untitled"}"`;
  const source = work.primary_location?.source?.display_name;
  const year = work.publication_year ?? "n.d.";
  const doi = doiUrl(work);

  let citation = `${authorStr}. ${title}.`;
  if (source) citation += ` *${source}*`;
  citation += ` (${year}).`;
  if (doi) citation += ` ${doi}.`;
  return citation;
}
