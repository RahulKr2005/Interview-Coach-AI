import pdf from 'pdf-parse/lib/pdf-parse.js';

// Curated tech skills list for heuristic extraction across placement roles
export const KNOWN_SKILLS = [
  // MERN & Frontend
  'React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JavaScript', 'TypeScript',
  'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Zustand', 'Next.js', 'Vite', 'REST APIs',
  'GraphQL', 'WebSockets', 'Jest', 'Cypress',
  // Backend & Databases
  'Python', 'FastAPI', 'Django', 'Flask', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis',
  'Prisma', 'SQL', 'Sequelize', 'Kafka', 'RabbitMQ',
  // Java & Systems
  'Java', 'Spring Boot', 'Hibernate', 'JPA', 'Microservices', 'Maven', 'Gradle', 'JUnit',
  'Data Structures', 'Algorithms', 'C++', 'C#',
  // DevOps & Cloud
  'Git', 'GitHub', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS', 'Azure',
  'GCP', 'Terraform', 'Prometheus', 'Grafana', 'Nginx', 'Bash'
];

export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Extracts selectable text from a PDF buffer and analyzes skills.
 */
export async function parsePdfResume(buffer) {
  if (!buffer || buffer.length === 0) {
    return {
      text: '',
      isScannedOrEmpty: true,
      pageCount: 0,
      skills: [],
      experienceSummary: '',
      message: 'Empty or invalid file buffer provided.',
    };
  }

  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    throw new Error(`File exceeds maximum allowed size of 5MB (${(buffer.length / (1024 * 1024)).toFixed(1)}MB uploaded).`);
  }

  try {
    const data = await pdf(buffer);
    const rawText = (data.text || '').trim();
    const pageCount = data.numpages || 1;

    // Check for scanned / non-selectable PDF (very few characters per page)
    if (rawText.length < 30) {
      return {
        text: rawText,
        isScannedOrEmpty: true,
        pageCount,
        skills: [],
        experienceSummary: '',
        message: 'This PDF appears to be a scanned image or contains no selectable text. Local OCR is not included to keep the app lightweight and 4GB RAM friendly. Please use the "Paste Resume Text" option to input your resume details directly.',
      };
    }

    // Skill extraction via word boundaries
    const detectedSkills = [];
    for (const skill of KNOWN_SKILLS) {
      // Escape special regex characters like C++, .js
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
      if (pattern.test(rawText)) {
        detectedSkills.push(skill);
      }
    }

    // Generate concise experience summary snippet from first 400 chars
    const cleanedSnippet = rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 10)
      .join(' ')
      .slice(0, 300);

    return {
      text: rawText,
      isScannedOrEmpty: false,
      pageCount,
      skills: detectedSkills,
      experienceSummary: cleanedSnippet,
      message: `Successfully extracted text from ${pageCount} page(s) and identified ${detectedSkills.length} relevant skill(s).`,
    };
  } catch (err) {
    throw new Error(`Failed to parse PDF document: ${err.message}`);
  }
}

/**
 * Extracts skills from raw text (for pasted resume text).
 */
export function extractSkillsFromText(rawText = '') {
  if (!rawText) return [];
  const detected = [];
  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
    if (pattern.test(rawText)) {
      detected.push(skill);
    }
  }
  return detected;
}
