import fs from "fs";
import path from "path";

const archivesDir = path.join(process.cwd(), "content", "archives");

function parseIssueMeta(contents, fallbackIssue) {
  const issueMatch = contents.match(/Issue\s+(\d+\.\d+)\s+([^\n*]+)/i);
  if (issueMatch) {
    return {
      issue: issueMatch[1].trim(),
      season: issueMatch[2].trim(),
    };
  }
  return { issue: fallbackIssue, season: "" };
}

function sortByIssueDesc(a, b) {
  const [aMajor, aMinor] = a.issue.split(".").map(Number);
  const [bMajor, bMinor] = b.issue.split(".").map(Number);
  if (aMajor !== bMajor) return bMajor - aMajor;
  return bMinor - aMinor;
}

export default function () {
  if (!fs.existsSync(archivesDir)) return [];

  const entries = fs.readdirSync(archivesDir, { withFileTypes: true });
  const issues = entries
    .filter((entry) => entry.isDirectory() && /^\d+\.\d+$/.test(entry.name))
    .map((entry) => {
      const issueDir = path.join(archivesDir, entry.name);
      const indexMd = path.join(issueDir, "index.md");
      const index2Md = path.join(issueDir, "index2.md");
      const indexFile = fs.existsSync(indexMd)
        ? indexMd
        : fs.existsSync(index2Md)
          ? index2Md
          : null;

      let issueMeta = { issue: entry.name, season: "" };
      if (indexFile) {
        const contents = fs.readFileSync(indexFile, "utf8");
        issueMeta = parseIssueMeta(contents, entry.name);
      }

      return {
        ...issueMeta,
        url: `/archives/${entry.name}/`,
      };
    })
    .sort(sortByIssueDesc);

  return issues;
}
