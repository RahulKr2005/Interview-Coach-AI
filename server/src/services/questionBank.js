/**
 * Curated Question Bank for InterviewCoach AI
 * Provides comprehensive technical and behavioral questions across all supported placement roles.
 * Includes MERN, Frontend, Backend, Java/DSA, DevOps, and HR/Behavioral questions.
 */

export const QUESTION_BANK = {
  // -------------------------------------------------------------
  // MERN STACK DEVELOPER
  // -------------------------------------------------------------
  'MERN Stack Developer': [
    {
      id: 'mern_1',
      role: 'MERN Stack Developer',
      type: 'Technical',
      difficulty: 'Beginner',
      topic: 'Full Stack Architecture',
      question: 'How do React, Express, Node.js, and MongoDB communicate in a standard MERN application? Trace a user login request end-to-end.',
      reference_answer: 'In MERN, React runs client-side in the browser. When the user logs in, React sends an asynchronous HTTP POST request (fetch or axios) to an Express route on the Node.js server with credentials. Express middleware parses the body (express.json()). The auth controller queries MongoDB via Mongoose to find the user by email, compares the password hash with bcrypt, generates a signed JWT, sets it in an HttpOnly cookie or response header, and returns a JSON payload. React receives the response and updates state.',
      checklist: [
        'Traced flow from browser React UI to Express server',
        'Mentioned body parsing and Mongoose database query',
        'Explained password hashing comparison (bcrypt) and JWT generation',
        'Noted secure cookie transmission and client state update'
      ]
    },
    {
      id: 'mern_2',
      role: 'MERN Stack Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'Authentication & Security',
      question: 'Why is storing JWTs in HttpOnly cookies considered more secure than localStorage in a MERN application? What additional protection is needed for cookies?',
      reference_answer: 'localStorage is fully accessible to JavaScript running on the page. If the application has any Cross-Site Scripting (XSS) vulnerability, malicious injected scripts can read and steal the JWT. HttpOnly cookies cannot be accessed by client-side JavaScript, neutralizing token theft via XSS. However, cookies are vulnerable to Cross-Site Request Forgery (CSRF). To protect cookies, set SameSite=Lax (or Strict), Secure=true (HTTPS in production), and use anti-CSRF tokens or custom request headers.',
      checklist: [
        'Explained localStorage vulnerability to XSS token theft',
        'Clarified HttpOnly prevents document.cookie JavaScript access',
        'Identified CSRF as the trade-off with cookies',
        'Provided CSRF mitigations: SameSite, Secure flag, custom headers'
      ]
    },
    {
      id: 'mern_3',
      role: 'MERN Stack Developer',
      type: 'Intermediate',
      difficulty: 'Intermediate',
      topic: 'Mongoose Schemas & Aggregations',
      question: 'Explain the difference between embedding documents versus referencing documents in Mongoose/MongoDB. When would you use each in a MERN project?',
      reference_answer: 'Embedding documents (denormalization) stores sub-documents directly inside the parent document, allowing atomic reads/writes in a single query with zero joins. It is best for 1-to-few relationships where data is bounded and almost always accessed together (e.g., an address or line items inside an order). Referencing documents (normalization with ObjectId) stores references and uses populate() or aggregation $lookup. It is best for 1-to-many or many-to-many relationships where sub-items grow unbounded, need independent querying, or are frequently modified independently (e.g., users and reviews).',
      checklist: [
        'Defined embedding (sub-documents in parent) vs referencing (ObjectId keys)',
        'Gave use-cases for embedding (1-to-few, bounded, read together)',
        'Gave use-cases for referencing (1-to-many, unbounded, independent lifecycle)',
        'Mentioned $lookup or populate() for referenced queries'
      ]
    },
    {
      id: 'mern_4',
      role: 'MERN Stack Developer',
      type: 'Technical',
      difficulty: 'Advanced',
      topic: 'Performance & Optimization',
      question: 'How do you optimize an Express + MongoDB backend handling thousands of concurrent read and write operations? Detail at least four specific techniques.',
      reference_answer: '1. Compound & Partial Indexing: Create compound B-tree indexes matching query filters and sort orders; use explain("executionStats") to eliminate COLLSCANs. 2. Connection Pooling: Configure Mongoose poolSize/maxPoolSize to prevent exhausting database TCP sockets. 3. In-Memory Caching: Use Redis to cache high-frequency, low-change queries (e.g., user profiles or session configurations) with TTL. 4. Lean Queries: Use .lean() on Mongoose queries to return plain JavaScript objects instead of heavy Mongoose Document instances. 5. Pagination & Projection: Implement cursor or range-based pagination and project only required fields using select().',
      checklist: [
        'Database indexing and explain() analysis',
        'Connection pooling configuration',
        'Redis caching with TTL',
        'Mongoose .lean() queries for reduced memory overhead',
        'Projection (select) and cursor pagination'
      ]
    },
    {
      id: 'mern_5',
      role: 'MERN Stack Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'State Management & API Sync',
      question: 'When React components need server data, how do you handle loading, error, and caching states without creating race conditions or stale closures?',
      reference_answer: 'Use structured effect management or libraries like TanStack Query (React Query) / RTK Query. When using standard useEffect: 1. Maintain boolean loading, error, and data states. 2. Use a cleanup flag (let isSubscribed = true; return () => { isSubscribed = false; }) or AbortController to cancel in-flight fetches on component unmount or dependency change, preventing state updates on unmounted components and race conditions from slow responses. 3. Ensure all variables referenced inside useEffect are listed in the dependency array or accessed via functional state setters to avoid stale closures.',
      checklist: [
        'Differentiated loading, error, and data states',
        'Explained cleanup flag or AbortController to prevent race conditions',
        'Addressed stale closures via dependency array or functional setters'
      ]
    }
  ],

  // -------------------------------------------------------------
  // FRONTEND DEVELOPER
  // -------------------------------------------------------------
  'Frontend Developer': [
    {
      id: 'fe_1',
      role: 'Frontend Developer',
      type: 'Technical',
      difficulty: 'Beginner',
      topic: 'DOM & Virtual DOM',
      question: 'Explain the difference between the Real DOM and the Virtual DOM. How does React reconciliation optimize updates?',
      reference_answer: 'The Real DOM represents the browser parsed HTML tree as objects. Direct mutations cause expensive reflows (recalculating layouts) and repaints. React Virtual DOM is an in-memory lightweight JavaScript object tree. When component state changes, React creates a new virtual tree, performs a diffing comparison against the previous tree using heuristics (same type elements, stable keys), and reconciles minimal mutations to the Real DOM via batched operations.',
      checklist: [
        'Explained Real DOM manipulation cost (reflow & repaint)',
        'Defined Virtual DOM as an in-memory JS representation',
        'Described diffing algorithm and reconciliation',
        'Mentioned batching updates'
      ]
    },
    {
      id: 'fe_2',
      role: 'Frontend Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'JavaScript Event Loop',
      question: 'How does the JavaScript Event Loop work? Specifically, explain how the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout) interact.',
      reference_answer: 'JavaScript is single-threaded. Synchronous code executes on the Call Stack. Asynchronous tasks dispatch callbacks to either the Microtask Queue (Promises, queueMicrotask) or the Macrotask Queue (setTimeout, setInterval, I/O). When the Call Stack empties, the Event Loop drains ALL pending microtasks before processing a single macrotask, repeating continuously.',
      checklist: [
        'Single-threaded execution model',
        'Differentiated Microtasks (Promises) from Macrotasks (setTimeout)',
        'Explained priority: Call Stack empties -> Microtasks drained -> Macrotask'
      ]
    },
    {
      id: 'fe_3',
      role: 'Frontend Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'React Hooks & Lifecycle',
      question: 'What is the purpose of useEffect dependency arrays, and what causes the "stale closure" bug in React functional components?',
      reference_answer: 'The dependency array tells React when to re-run an effect. Omitting it runs on every render, empty [] runs on mount/unmount, and [dep] runs when dep changes by reference (Object.is). Stale closures occur when a callback captures values from an earlier render without listing them in the dependencies, causing it to reference outdated state.',
      checklist: [
        'Explained comparison mechanism in dependency arrays',
        'Defined JavaScript closures and capturing outer scope variables',
        'Described how functional state updates or useRef avoid stale state'
      ]
    },
    {
      id: 'fe_4',
      role: 'Frontend Developer',
      type: 'Technical',
      difficulty: 'Advanced',
      topic: 'Web Performance',
      question: 'Explain Core Web Vitals (LCP, INP/FID, CLS), and describe techniques you would use to improve Largest Contentful Paint (LCP).',
      reference_answer: 'Core Web Vitals measure perceived user experience: LCP (perceived loading speed of largest above-the-fold content), INP (interaction latency/responsiveness), and CLS (unexpected visual shifts). To optimize LCP: preload hero images (<link rel="preload">), serve modern formats (WebP/AVIF), minimize server response time (TTFB) with CDN caching, eliminate render-blocking CSS/JS, and avoid client-side lazy loading of above-the-fold assets.',
      checklist: [
        'Accurately defined LCP, INP, and CLS metrics',
        'Proposed image preloading, compression, and modern formats',
        'Discussed eliminating render-blocking resources'
      ]
    },
    {
      id: 'fe_5',
      role: 'Frontend Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'CSS Architecture',
      question: 'When should you use CSS Flexbox versus CSS Grid? Provide a concrete layout scenario for each.',
      reference_answer: 'Flexbox is one-dimensional (handles items in either a row or a column), making it ideal for component-level UI elements such as navigation bars, aligning icon/text pairs, or distributed button groups. Grid is two-dimensional (handles rows and columns simultaneously), making it best suited for page-level structural layouts like dashboard grids, photo galleries, or multi-column templates.',
      checklist: [
        'Identified Flexbox as 1D (row or column)',
        'Identified Grid as 2D (rows and columns simultaneously)',
        'Provided realistic Flexbox example (e.g. navbar)',
        'Provided realistic Grid example (e.g. dashboard grid)'
      ]
    }
  ],

  // -------------------------------------------------------------
  // BACKEND DEVELOPER
  // -------------------------------------------------------------
  'Backend Developer': [
    {
      id: 'be_1',
      role: 'Backend Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'Database Optimization',
      question: 'Explain the difference between SQL database indexing strategies (B-Tree vs Hash Index) and how composite indexes work.',
      reference_answer: 'B-Tree indexes maintain balanced hierarchical order, making them ideal for equality (=) and range queries (<, >, BETWEEN, ORDER BY). Hash indexes provide O(1) equality lookups using a hash table but cannot support range queries or sorting. Composite indexes cover multiple columns; queries must use the leftmost prefix columns for the index to be utilized effectively.',
      checklist: [
        'Compared B-Tree vs Hash index use-cases and complexities',
        'Explained leftmost prefix rule for composite indexes',
        'Discussed index write overhead and maintenance trade-offs'
      ]
    },
    {
      id: 'be_2',
      role: 'Backend Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'Database Concurrency & ACID',
      question: 'Explain database isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) and the anomalies they prevent.',
      reference_answer: 'Read Uncommitted allows dirty reads. Read Committed prevents dirty reads by reading only committed rows. Repeatable Read prevents dirty and non-repeatable reads by ensuring repeated reads within a transaction return identical snapshots. Serializable prevents all anomalies including phantom reads and write skew using two-phase locking or serialization graphs.',
      checklist: [
        'Named 4 standard ACID isolation levels in order',
        'Defined dirty read, non-repeatable read, phantom read',
        'Addressed performance vs consistency trade-offs'
      ]
    },
    {
      id: 'be_3',
      role: 'Backend Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'API Architecture & Resilience',
      question: 'How do you design a rate limiter for a public API? Compare Token Bucket with Leaky Bucket and Sliding Window algorithms.',
      reference_answer: 'Rate limiters protect servers against brute-force and DDoS traffic. Token Bucket holds tokens up to a burst capacity and refills at a fixed rate, allowing bursts. Leaky Bucket smooths traffic by processing requests at a strictly constant egress rate. Sliding Window Counter divides time into segments to provide smooth rolling enforcement without memory bloat, commonly implemented using Redis sorted sets (ZREMRANGEBYSCORE/ZCARD).',
      checklist: [
        'Explained Token Bucket burst tolerance',
        'Compared Leaky Bucket smoothing behavior',
        'Discussed Redis distributed implementation'
      ]
    },
    {
      id: 'be_4',
      role: 'Backend Developer',
      type: 'Technical',
      difficulty: 'Advanced',
      topic: 'Distributed Systems & Microservices',
      question: 'What is idempotent API design and how do you implement idempotency keys for payment processing endpoints?',
      reference_answer: 'An idempotent operation produces the exact same outcome regardless of how many times it is repeated. For payment endpoints, the client generates a unique UUID idempotency key sent via headers (Idempotency-Key). The server uses an atomic store (Redis) to lock the key and store the request/response. If a duplicate arrives, the cached response is returned immediately without re-executing charges.',
      checklist: [
        'Defined idempotency in HTTP REST design',
        'Explained client-generated UUID key',
        'Detailed atomic distributed cache checking and response reuse'
      ]
    },
    {
      id: 'be_5',
      role: 'Backend Developer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'System Reliability',
      question: 'How does database connection pooling work, and what causes connection pool exhaustion in high-traffic services?',
      reference_answer: 'Establishing TCP and TLS connections with database authentication takes significant latency. A connection pool keeps a warm set of active connections ready for reuse. Exhaustion occurs when incoming requests outpace available connections due to slow long-running queries, missing indexes, unclosed transactions, or undersized pool limits relative to concurrent workers.',
      checklist: [
        'Identified TCP/TLS handshake overhead cost',
        'Described pool min/max size configuration',
        'Explained causes of exhaustion: slow queries, unclosed transactions'
      ]
    }
  ],

  // -------------------------------------------------------------
  // JAVA / DSA DEVELOPER
  // -------------------------------------------------------------
  'Java / DSA': [
    {
      id: 'java_1',
      role: 'Java / DSA',
      type: 'Technical',
      difficulty: 'Beginner',
      topic: 'Java Memory & JVM',
      question: 'Explain the difference between the Stack and the Heap memory in the Java Virtual Machine (JVM). How does Garbage Collection interact with them?',
      reference_answer: 'Stack memory is used for thread execution, storing primitive local variables and references to objects in the Heap. Each thread has its own stack with LIFO execution. Heap memory stores all instantiated objects and instances, shared across all threads. Garbage Collection operates exclusively on the Heap (Eden, Survivor, Old Gen) to deallocate unreferenced objects using Mark-and-Sweep algorithms.',
      checklist: [
        'Differentiated Stack (thread-specific, primitives, references) and Heap (shared objects)',
        'Identified Garbage Collection targets the Heap',
        'Mentioned generational memory (Eden, Survivor, Tenured/Old)'
      ]
    },
    {
      id: 'java_2',
      role: 'Java / DSA',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'Java Collections Framework',
      question: 'How does HashMap work internally in Java 8+? What happens during a hash collision and when does a linked list turn into a balanced tree?',
      reference_answer: 'HashMap uses an array of Node buckets. When put(K, V) is called, it computes hash(K) to determine the bucket index. If multiple keys hash to the same bucket (collision), Java stores them as a singly-linked list. In Java 8, when a bucket contains more than 8 elements (TREEIFY_THRESHOLD) and the array capacity is at least 64, the linked list converts into a Red-Black Tree, improving worst-case lookup from O(n) to O(log n).',
      checklist: [
        'Explained hashing and bucket index calculation',
        'Described linked list collision handling',
        'Identified Java 8 Red-Black Tree conversion at threshold 8 (O(log n))'
      ]
    },
    {
      id: 'java_3',
      role: 'Java / DSA',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'Data Structures & Algorithms',
      question: 'Compare Breadth-First Search (BFS) and Depth-First Search (DFS) for graph traversal. What data structures do they use and what are their time complexities?',
      reference_answer: 'BFS traverses level by level using a Queue (FIFO), making it optimal for finding the shortest path on unweighted graphs. DFS explores as deep as possible along each branch before backtracking using a Stack (LIFO or recursion). Both operate in O(V + E) time complexity where V is vertices and E is edges, using a visited set/array to prevent cycles.',
      checklist: [
        'BFS uses a Queue; DFS uses a Stack/recursion',
        'BFS finds shortest path in unweighted graphs',
        'Stated O(V + E) time and space complexity'
      ]
    },
    {
      id: 'java_4',
      role: 'Java / DSA',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'Concurrency in Java',
      question: 'What is the difference between synchronized keyword, volatile keyword, and ReentrantLock in Java concurrency?',
      reference_answer: 'volatile guarantees visibility across threads by reading/writing directly to main memory (preventing CPU cache staleness), but does NOT guarantee atomicity (e.g. count++ is not atomic). synchronized provides both mutual exclusion and memory visibility via intrinsic monitor locks. ReentrantLock from java.util.concurrent provides explicit locking with advanced features like fairness, tryLock() with timeouts, and interruptible locks.',
      checklist: [
        'volatile guarantees memory visibility but not atomicity',
        'synchronized guarantees mutual exclusion and visibility',
        'ReentrantLock offers tryLock timeouts and fairness policies'
      ]
    },
    {
      id: 'java_5',
      role: 'Java / DSA',
      type: 'Technical',
      difficulty: 'Advanced',
      topic: 'Dynamic Programming',
      question: 'What are the two key properties a problem must have to be solved using Dynamic Programming? Contrast Memoization (Top-Down) with Tabulation (Bottom-Up).',
      reference_answer: 'The two properties are: 1. Overlapping Subproblems (subproblems are computed repeatedly), and 2. Optimal Substructure (an optimal solution can be constructed from optimal solutions to subproblems). Memoization (Top-Down) solves recursively starting from the main problem, caching results in a map/array as they are solved. Tabulation (Bottom-Up) solves iteratively starting from base cases, building an array or table without recursion stack overhead.',
      checklist: [
        'Named Overlapping Subproblems and Optimal Substructure',
        'Explained Top-Down Memoization (recursive + cache)',
        'Explained Bottom-Up Tabulation (iterative table without call stack)'
      ]
    }
  ],

  // -------------------------------------------------------------
  // DEVOPS ENGINEER
  // -------------------------------------------------------------
  'DevOps Engineer': [
    {
      id: 'ops_1',
      role: 'DevOps Engineer',
      type: 'Technical',
      difficulty: 'Beginner',
      topic: 'Containerization',
      question: 'Explain the fundamental differences between a Docker Container and a Virtual Machine (VM). Why are containers preferred for microservices?',
      reference_answer: 'Virtual Machines run a full guest operating system on top of a hypervisor, consuming gigabytes of storage, requiring minutes to boot, and virtualizing hardware. Docker containers share the host Linux kernel and isolate processes using Linux namespaces and cgroups. Containers are lightweight (megabytes), boot in seconds, and share resources efficiently, making them ideal for high-density microservice deployments.',
      checklist: [
        'Hypervisor + guest OS for VMs vs shared kernel for containers',
        'Mentioned Linux namespaces (isolation) and cgroups (resource limits)',
        'Highlighted boot time and resource efficiency advantages'
      ]
    },
    {
      id: 'ops_2',
      role: 'DevOps Engineer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'Kubernetes Architecture',
      question: 'Explain the primary components of Kubernetes control plane and worker nodes. How does Kubernetes maintain desired state?',
      reference_answer: 'Control Plane: kube-apiserver (central REST API entry point), etcd (distributed key-value store for cluster state), kube-scheduler (assigns pods to worker nodes), kube-controller-manager (runs control loops to maintain desired state). Worker Nodes: kubelet (ensures containers in pods are running), kube-proxy (network rules and service routing), container runtime (containerd). Controllers continuously compare current state from etcd against desired state declared in manifests, applying corrective reconciliations.',
      checklist: [
        'Identified apiserver, etcd, scheduler, controller-manager',
        'Identified worker node components: kubelet, kube-proxy, runtime',
        'Explained the reconciliation control loop'
      ]
    },
    {
      id: 'ops_3',
      role: 'DevOps Engineer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'CI/CD Pipelines',
      question: 'Describe an ideal automated CI/CD pipeline from a Git commit to a production Kubernetes deployment. What gates and security checks should be included?',
      reference_answer: '1. Commit & Pull Request: Trigger pipeline on branch. 2. Build & Lint: Run static analysis, ESLint, and dependency checks. 3. Automated Tests: Unit and integration tests. 4. Security Scanning: SAST, dependency vulnerability scanning (Snyk/Trivy), and secret leak scanning. 5. Container Image Build: Build immutable Docker image tagged with Git SHA; scan image for CVEs; push to container registry. 6. Continuous Delivery: Deploy to Staging using GitOps (ArgoCD/Flux); run smoke/e2e tests. 7. Production: Blue-Green or Canary deployment with automated rollback on error rate spikes.',
      checklist: [
        'Detailed pipeline stages: Lint, Test, Security scan, Build, Deploy',
        'Included security vulnerability scanning (SAST / container scanning)',
        'Mentioned Blue-Green / Canary deployment strategy and automated rollback'
      ]
    },
    {
      id: 'ops_4',
      role: 'DevOps Engineer',
      type: 'Technical',
      difficulty: 'Advanced',
      topic: 'Observability & Monitoring',
      question: 'Explain the Three Pillars of Observability (Metrics, Logs, Traces). How do Prometheus and Grafana fit into this architecture?',
      reference_answer: 'Metrics are numerical aggregations measured over time (CPU %, memory, request latency), efficient for real-time alerting. Logs are timestamped discrete events providing deep textual context on failures. Traces follow a single request end-to-end through distributed services to identify latency bottlenecks. Prometheus scrapes and stores time-series metrics via pull mechanism, and evaluates alerting rules. Grafana queries Prometheus and log stores to visualize dashboards.',
      checklist: [
        'Defined Metrics, Logs, and Traces',
        'Explained Prometheus pull-based time-series scraping',
        'Explained Grafana dashboard visualization role'
      ]
    },
    {
      id: 'ops_5',
      role: 'DevOps Engineer',
      type: 'Technical',
      difficulty: 'Intermediate',
      topic: 'Infrastructure as Code',
      question: 'What is Infrastructure as Code (IaC)? How does Terraform manage state and prevent concurrent modification conflicts?',
      reference_answer: 'IaC manages infrastructure using declarative definition files rather than manual console clicks. Terraform records provisioned resource IDs and attributes in a terraform.tfstate file. To prevent concurrent modifications and race conditions across team members, state should be stored in a remote backend (e.g. AWS S3 with DynamoDB locking, or Terraform Cloud). DynamoDB locks the state file during terraform apply operations.',
      checklist: [
        'Defined declarative Infrastructure as Code',
        'Explained purpose of terraform.tfstate file',
        'Detailed remote state backend with state locking (e.g. DynamoDB/S3)'
      ]
    }
  ],

  // -------------------------------------------------------------
  // HR & BEHAVIORAL
  // -------------------------------------------------------------
  'HR': [
    {
      id: 'hr_1',
      role: 'HR',
      type: 'HR',
      difficulty: 'Intermediate',
      topic: 'Problem Solving & Resilience',
      question: 'Tell me about a challenging technical bug or blocker you encountered in a project. How did you diagnose the root cause and solve it?',
      reference_answer: 'Answer using the STAR method (Situation, Task, Action, Result). State the context clearly, explain the specific obstacle, describe systematic troubleshooting steps (reproducing the issue, analyzing logs, isolating components), detail the fix implemented, and conclude with the quantitative result and lessons learned.',
      checklist: [
        'Used STAR structure (Situation, Task, Action, Result)',
        'Described systematic diagnosis rather than random guessing',
        'Shared concrete resolution and key takeaways'
      ]
    },
    {
      id: 'hr_2',
      role: 'HR',
      type: 'HR',
      difficulty: 'Intermediate',
      topic: 'Teamwork & Conflict Resolution',
      question: 'Describe a situation where you had a disagreement with a teammate or project lead on technical approach or deadlines. How was it resolved?',
      reference_answer: 'Focus on constructive communication and objective evaluation. Explain the differing viewpoints, describe how you listened actively to the other perspective, presented data or prototypes to compare trade-offs objectively, and aligned on the best outcome for the project without personal conflict.',
      checklist: [
        'Demonstrated active listening and empathy',
        'Used data and trade-off comparison to resolve conflict',
        'Emphasized team alignment and project goals'
      ]
    },
    {
      id: 'hr_3',
      role: 'HR',
      type: 'HR',
      difficulty: 'Beginner',
      topic: 'Growth & Continuous Learning',
      question: 'How do you keep your technical skills updated with rapidly changing frameworks and tools? Give an example of a skill you recently learned independently.',
      reference_answer: 'Highlight deliberate learning habits: reading official documentation, building hands-on side projects, following release notes, and participating in tech communities. Provide a specific example of a technology recently mastered, why you chose it, what you built, and how it improved your problem-solving capabilities.',
      checklist: [
        'Shared specific learning channels (docs, open source, projects)',
        'Gave a concrete recent example with a tangible project',
        'Demonstrated self-motivation and curiosity'
      ]
    }
  ]
};

/**
 * Returns curated questions tailored to role, type, difficulty, and count.
 */
export function getQuestionsForSession(role = 'MERN Stack Developer', type = 'Technical', difficulty = 'Intermediate', count = 5) {
  const roleAliases = {
    'Full Stack Developer': 'MERN Stack Developer',
    'Java Developer': 'Java / DSA',
    'HR': 'HR',
    'HR & Behavioral': 'HR',
    'Data Analyst': 'Backend Developer',
  };
  const effectiveRole = roleAliases[role] || role;
  let roleBank = QUESTION_BANK[effectiveRole] || QUESTION_BANK[role] || QUESTION_BANK['MERN Stack Developer'];

  if (type === 'HR') {
    roleBank = QUESTION_BANK['HR'];
  }

  // Filter or match questions
  let selected = [...roleBank];

  if (selected.length < count) {
    // If not enough questions in specific role, blend with MERN/Backend questions
    const extra = [...(QUESTION_BANK['MERN Stack Developer'] || []), ...(QUESTION_BANK['Frontend Developer'] || [])];
    selected = [...selected, ...extra.filter(q => !selected.some(s => s.id === q.id))];
  }

  return selected.slice(0, count).map((q, idx) => ({
    question_index: idx + 1,
    question_text: q.question,
    topic: q.topic,
    reference_answer: q.reference_answer,
    checklist: q.checklist,
    user_answer: null,
    feedback: null,
    score: null,
    skipped: false,
    answered_at: null,
  }));
}

/**
 * Generates resume-tailored interview questions using extracted resume skills.
 */
export function generateResumeQuestions(skills = [], targetRole = 'MERN Stack Developer', count = 5) {
  const baseQuestions = getQuestionsForSession(targetRole, 'Technical', 'Intermediate', count);

  if (!skills || skills.length === 0) {
    return baseQuestions;
  }

  // Create tailored questions for the user's top skills
  const tailored = skills.slice(0, Math.min(count, skills.length)).map((skill, idx) => ({
    question_index: idx + 1,
    question_text: `Based on your resume experience with ${skill}: How have you utilized ${skill} in a production or academic project, and how did you handle performance, error boundaries, or debugging?`,
    topic: `${skill} Experience & Implementation`,
    reference_answer: `Candidates should articulate specific architectural use-cases for ${skill}, demonstrate familiarity with idiomatic patterns, describe common pitfalls or bugs encountered with ${skill}, and explain how they verified stability.`,
    checklist: [
      `Gave concrete project scenario involving ${skill}`,
      `Discussed best practices and idiomatic patterns in ${skill}`,
      `Addressed error handling and debugging approaches`
    ],
    user_answer: null,
    feedback: null,
    score: null,
    skipped: false,
    answered_at: null,
  }));

  // Fill remainder with base questions if needed
  while (tailored.length < count && tailored.length < baseQuestions.length) {
    const nextQ = baseQuestions[tailored.length];
    nextQ.question_index = tailored.length + 1;
    tailored.push(nextQ);
  }

  return tailored;
}
