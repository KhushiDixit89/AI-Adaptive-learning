function cleanChapterTitle(rawTitle) {
  let clean = rawTitle
    .replace(/^(?:chapter|unit|module|lesson|section|part|theme)\s*(?:[0-9]+|[ivx]+)?\s*[:.,\-–—\u2500\u2014\u2015]*\s*/i, '')
    .replace(/^(?:[0-9]{1,2}|[IVX]{1,5})\s*[\.\)\]\-–—\u2500\u2014\u2015:,]+\s*/i, '')
    .replace(/^(?:[0-9]{1,2}|[IVX]{1,5})\s+([A-Z])/i, '$1')
    .replace(/^[•\-\*▪►\uF0B7\u2022\u25E6\u25AA\u25CF\u2023·\s]+/, '')
    .replace(/\s*\(?\d+\s*(?:marks?|periods?|hours?|hrs?|pts?)\)?\s*$/i, '')
    .replace(/\s+\d{1,2}\s*$/, '')
    .replace(/[:.,\-–—\u2500\u2014\u2015]+$/, '')
    .trim();

  if (clean === clean.toUpperCase() && clean.length > 4) {
    clean = clean
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return clean;
}

function splitInlineChapters(text) {
  if (!text || !text.trim()) return [];
  const trimmed = text.trim();

  // If multiple numbers are in the line (e.g. "Quadratic , 2 - Integration,3- Statistic, 4- Probability")
  const hasMultipleNumbers = /(?:^|[,;])\s*(?:(?:chapter|unit)?\s*\d+\s*[-–—\u2500\.:\)]\s*|\b\d+\s*[-–—\u2500\.:\)]\s*)/gi;
  const numMatches = trimmed.match(hasMultipleNumbers);
  if (numMatches && numMatches.length >= 2) {
    const numberedSplit = trimmed.split(/(?:^|[,;])\s*(?:(?:chapter|unit)?\s*\d+\s*[-–—\u2500\.:\)]\s*|\b\d+\s*[-–—\u2500\.:\)]\s*)/i);
    const valid = numberedSplit.map(s => cleanChapterTitle(s)).filter(s => s.length >= 3);
    if (valid.length >= 2) {
      return valid;
    }
  }

  // If line starts with a single chapter number (e.g. "2 ── Acids, Bases and Salts"), keep it intact!
  if (/^\s*(?:(?:chapter|unit|module|lesson)\s*(?:[0-9]+|[ivx]+)?\s*[:.,\-–—\u2500\u2014\u2015]*|(?:[0-9]{1,2}|[IVX]{1,5})\s*[\.\)\]\-–—\u2500\u2014\u2015:,]*|[0-9]{1,2}\s+[A-Z])/i.test(trimmed)) {
    return [trimmed];
  }

  // If comma-separated list of short chapter titles (e.g. "Quadratic, Integration, Statistics, Probability")
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(s => cleanChapterTitle(s)).filter(Boolean);
    if (parts.length >= 2 && parts.every(p => p.length >= 3 && p.length <= 50)) {
      return parts;
    }
  }

  return [trimmed];
}

function testExtractChapters(text) {
  const chapters = [];
  const seen = new Set();
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const lines = [];
  for (const rawLine of rawLines) {
    const inlines = splitInlineChapters(rawLine);
    lines.push(...inlines);
  }

  const numberedPatterns = [
    /^\s*(?:chapter|unit|module|lesson|section|part|theme)\s*(?:[0-9]+|[ivx]+)?\s*[:.,\-–—\u2500\u2014\u2015]+\s*(.+)$/i,
    /^\s*(?:[0-9]{1,2}|[IVX]{1,5})\s*[\.\)\]\-–—\u2500\u2014\u2015:]+\s*(.+)$/i,
    /^\s*(?:[0-9]{1,2})\s+([A-Z][A-Za-z0-9\s,\-–—&'()]{2,60})\s*$/,
    /^\s*(?:[IVX]{1,5})\s+([A-Za-z][A-Za-z0-9\s,\-–—&']{3,60})\s*$/i
  ];

  // 1. First scan for numbered chapters
  for (const line of lines) {
    for (const pattern of numberedPatterns) {
      const match = line.match(pattern);
      if (match) {
        const title = (match[1] || match[2] || match[0]).trim();
        const candidate = cleanChapterTitle(title);
        if (candidate.length >= 3 && !seen.has(candidate.toLowerCase())) {
          seen.add(candidate.toLowerCase());
          chapters.push(candidate);
        }
        break;
      }
    }
  }

  // 2. If numbered chapters found, return them (bullets are topics!)
  if (chapters.length >= 2) {
    return chapters;
  }

  // 3. Fallback to bullet / unnumbered list if no numbered chapters
  for (const line of lines) {
    const bulletMatch = line.match(/^\s*[•\-\*▪►\uF0B7\u2022\u25E6\u25AA\u25CF\u2023]\s+([A-Z][A-Za-z0-9\s,\-–—&']{3,60})$/);
    if (bulletMatch) {
      const candidate = cleanChapterTitle(bulletMatch[1]);
      if (candidate.length >= 3 && !seen.has(candidate.toLowerCase())) {
        seen.add(candidate.toLowerCase());
        chapters.push(candidate);
      }
    }
  }

  // 4. Fallback to plain non-prose lines
  if (chapters.length === 0 && lines.length <= 15) {
    for (const line of lines) {
      const candidate = cleanChapterTitle(line);
      if (candidate.length >= 3 && !seen.has(candidate.toLowerCase())) {
        seen.add(candidate.toLowerCase());
        chapters.push(candidate);
      }
    }
  }

  return chapters;
}

// Test PDF 1
const pdf1Text = ` 1 ── Chemical Reactions and Equations
 2 ── Acids, Bases and Salts
 3 ── Metals and Non-metals
 4 ── Carbon and Its Compounds
 5 ── Life Processes
 6 ── Control and Coordination
 7 ── Reproduction
 8 ── Heredity
 9 ── Our Environment
 10 ── Light
 11 ─ Human Eye
 12 ─ Electricity
 13 ── Magnetic Effects
 14 ─ Sources of Energy `;

// Test PDF 2
const pdf2Text = `1 Real Numbers
 Fundamental Theorem of Arithmetic 
 Irrational numbers 
 Rational numbers and decimal expansions 
2 Polynomials
 Zeroes of a polynomial 
 Relationship between zeroes and coefficients 
 Division algorithm 
3 Pair of Linear Equations in Two Variables
 Graphical solution 
 Substitution method 
 Elimination method 
 Cross-multiplication method 
 Equations reducible to linear equations 
4 Quadratic Equations
 Standard form 
 Factorisation 
 Quadratic formula 
 Nature of roots 
 Relationship between roots and coefficients 
5 Arithmetic Progressions
 General term 
 Sum of first n terms 
 Applications 
6 Triangles
 Similar figures 
 Similarity of triangles 
 Basic Proportionality Theorem 
 Areas of similar triangles 
 Pythagoras theorem 
7 Coordinate Geometry
 Distance formula 
 Section formula 
 Area of triangle 
8 Introduction to Trigonometry
 Trigonometric ratios 
 Values of standard angles 
 Relationships between trigonometric ratios 
 Trigonometric identities 
9 Some Applications of Trigonometry
 Heights and distances 
 Angle of elevation 
 Angle of depression 
10 Circles
 Tangent to a circle 
 Properties of tangents 
 Tangent-related theorems 
11 Areas Related to Circles
 Circumference 
 Area of circle 
 Sector 
 Segment 
 Areas of combinations of plane figures 
12 Surface Areas and Volumes
 Cube and cuboid 
 Cylinder 
 Cone 
 Sphere  
 Hemisphere 
 Combination of solids 
13 Statistics
 Mean 
 Median 
 Mode 
 Grouped data 
 Cumulative frequency 
 Graphical representation 
14 Probability
 Classical probability 
 Probability of an event 
 Experimental probability`;

// Test User Screenshot Input
const userSsInput = `Quadratic , 2 - Integration,3- Statistic, 4- Probability`;

console.log('=== PDF 1 RESULTS ===');
const p1 = testExtractChapters(pdf1Text);
console.log(`Count: ${p1.length}`);
console.log(p1);

console.log('\n=== PDF 2 TOPICS PER CHAPTER ===');
const p2 = testExtractChapters(pdf2Text);
console.log(`Chapters Count: ${p2.length}`);

function extractTopics(slice, chName) {
  const lines = slice.split('\n').map(l => l.trim()).filter(Boolean);
  const topics = [];
  const seen = new Set();
  const pattern = /^[\uF0B7•\-\*▪►\u2022\u25E6\u25AA\u25CF\u2023·]\s*([A-Za-z0-9][A-Za-z0-9\s,\-–—&'()]{2,65})$/;
  for (const line of lines) {
    const match = line.match(pattern);
    if (match) {
      const cand = cleanChapterTitle(match[1]);
      if (cand.length >= 3 && !seen.has(cand.toLowerCase()) && cand.toLowerCase() !== chName.toLowerCase()) {
        seen.add(cand.toLowerCase());
        topics.push(cand);
      }
    }
  }
  return topics;
}

// Slice text between chapters
for (let i = 0; i < p2.length; i++) {
  const ch = p2[i];
  const nextCh = p2[i + 1];
  const startIdx = pdf2Text.indexOf(ch);
  const endIdx = nextCh ? pdf2Text.indexOf(nextCh) : pdf2Text.length;
  const slice = pdf2Text.slice(startIdx + ch.length, endIdx);
  const topics = extractTopics(slice, ch);
  console.log(`[${ch}]: ${topics.join(' | ')}`);
}

