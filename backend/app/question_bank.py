"""
Curated question bank for placement interview preparation.
Contains 10+ technical questions per role:
- Frontend Developer (12 questions)
- Backend Developer (12 questions)
- Full Stack Developer (12 questions)
- Java Developer (12 questions)
- Data Analyst (12 questions)
- DevOps Engineer (12 questions)
Plus a rich HR and Behavioral question bank (15 questions).
"""

from typing import List, Dict, Any

QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {
    # ---------------------------------------------------------
    # FRONTEND DEVELOPER
    # ---------------------------------------------------------
    "Frontend Developer": [
        {
            "id": "fe_1",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "DOM & Virtual DOM",
            "question": "Explain the difference between the Real DOM and the Virtual DOM. How does React's reconciliation algorithm leverage the Virtual DOM to optimize updates?",
            "reference_answer": "The Real DOM represents the browser's parsed HTML tree as objects. Manipulating it directly triggers expensive recalculations like style calculations, layout (reflow), and repainting. React's Virtual DOM is an in-memory lightweight JavaScript object representation of the real DOM. When state changes, React renders a new virtual tree, performs a 'diffing' comparison against the previous snapshot, and computes the minimal set of batch operations needed to update the Real DOM via reconciliation (Fiber architecture).",
            "checklist": [
                "Defined Real DOM manipulation overhead (reflow/layout & repaint)",
                "Explained Virtual DOM as an in-memory lightweight JavaScript representation",
                "Mentioned the diffing algorithm comparing snapshots",
                "Noted batching or minimal DOM mutations during reconciliation"
            ]
        },
        {
            "id": "fe_2",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "CSS Layout",
            "question": "When should you use CSS Flexbox versus CSS Grid? Provide a concrete layout scenario for each.",
            "reference_answer": "CSS Flexbox is one-dimensional (handles content in a single row or column), making it ideal for component-level UI elements like navigation bars, aligning buttons, or centering items. CSS Grid is two-dimensional (handles rows and columns simultaneously), making it best suited for page-level structural layouts such as dashboard grids, complex photo galleries, or multi-column newspaper layouts with header, sidebar, and footer.",
            "checklist": [
                "Identified Flexbox as 1D (row or column)",
                "Identified Grid as 2D (rows and columns simultaneously)",
                "Gave an appropriate Flexbox example (e.g., navbar or centered card)",
                "Gave an appropriate Grid example (e.g., dashboard grid or layout template)"
            ]
        },
        {
            "id": "fe_3",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "JavaScript Event Loop",
            "question": "How does the JavaScript Event Loop work? Specifically, explain how the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout) interact.",
            "reference_answer": "JavaScript is single-threaded. Synchronous code runs on the Call Stack. When an asynchronous operation occurs, its callback is dispatched to either the Microtask Queue (Promises, queueMicrotask, MutationObserver) or the Macrotask Queue (setTimeout, setInterval, I/O). When the Call Stack becomes completely empty, the Event Loop drains ALL pending microtasks before taking a single macrotask from the Macrotask Queue, repeating this cycle continuously.",
            "checklist": [
                "Clarified single-threaded nature and Call Stack execution",
                "Distinguished Microtasks (Promises) from Macrotasks (setTimeout)",
                "Explained that Microtasks have higher priority and drain before next Macrotask",
                "Highlighted the loop cycle condition (Call Stack must be empty)"
            ]
        },
        {
            "id": "fe_4",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "React Hooks & Lifecycle",
            "question": "What is the purpose of useEffect dependency arrays, and what causes the 'stale closure' bug in React functional components?",
            "reference_answer": "The dependency array tells React when to re-run the effect: omitting it runs on every render, empty `[]` runs only on mount/unmount, and `[dep]` runs when `dep` changes by referential equality (`Object.is`). A stale closure occurs when a callback or effect captures a state variable from an earlier render cycle because the dependency array omitted it or a timer/event listener wasn't updated, causing the function to read outdated values.",
            "checklist": [
                "Differentiated behavior between missing deps, empty deps [], and specific deps",
                "Mentioned referential equality (Object.is) comparisons",
                "Explained closure capturing variables from a past render frame",
                "Mentioned fixes (adding deps, using functional state updates `prev => prev + 1`, or `useRef`)"
            ]
        },
        {
            "id": "fe_5",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Web Performance",
            "question": "What are Core Web Vitals (LCP, INP/FID, CLS), and what techniques would you use to improve Largest Contentful Paint (LCP)?",
            "reference_answer": "Core Web Vitals measure real-world user experience: LCP (Largest Contentful Paint) measures perceived loading speed; INP (Interaction to Next Paint, replacing FID) measures responsiveness; CLS (Cumulative Layout Shift) measures visual stability. To optimize LCP: preload the hero image using `<link rel='preload'>`, optimize image formats (WebP/AVIF) and sizing, ensure server response time (TTFB) is low via CDN caching, eliminate render-blocking JavaScript/CSS, and avoid client-side lazy loading of above-the-fold assets.",
            "checklist": [
                "Defined LCP, INP/FID, and CLS correctly",
                "Mentioned hero image preloading or proper image compression/formats",
                "Mentioned reducing render-blocking resources or TTFB/CDN caching",
                "Noted that above-the-fold content should not be lazy-loaded"
            ]
        },
        {
            "id": "fe_6",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "State Management",
            "question": "Compare React Context with dedicated external state stores like Redux Toolkit or Zustand. When does Context cause performance bottlenecks?",
            "reference_answer": "React Context is designed for dependency injection and low-frequency global data (e.g. theme, authenticated user, locale). Whenever a Context value changes, EVERY component consuming that context re-renders, even if it only uses an unchanged property of that context object. Zustand and Redux Toolkit offer fine-grained selector subscriptions (`useStore(state => state.foo)`), triggering re-renders only when the specifically selected slice changes, making them far better for high-frequency or complex state.",
            "checklist": [
                "Identified Context's ideal use cases (low frequency data: auth, theme)",
                "Explained the re-render issue (all consumers re-render when context value changes)",
                "Mentioned selector-based subscriptions in Zustand/Redux",
                "Discussed how to mitigate Context bottlenecks (splitting contexts, memoization)"
            ]
        },
        {
            "id": "fe_7",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Web Security",
            "question": "What are Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)? How do modern frontend frameworks and browser security headers mitigate them?",
            "reference_answer": "XSS allows attackers to inject malicious client-side scripts into web pages viewed by other users. React mitigates this by default-escaping variables in JSX before rendering, while avoiding `dangerouslySetInnerHTML`. Content Security Policy (CSP) headers restrict script origins. CSRF tricks an authenticated browser into sending unauthorized requests to a trusted site. Mitigations include SameSite cookies (`SameSite=Strict` or `Lax`), Anti-CSRF tokens, and checking custom request headers.",
            "checklist": [
                "Differentiated XSS (injected script) and CSRF (unauthorized authenticated request)",
                "Mentioned JSX auto-escaping and danger of `dangerouslySetInnerHTML`",
                "Mentioned Content Security Policy (CSP) headers",
                "Mentioned SameSite cookie attribute and CSRF tokens"
            ]
        },
        {
            "id": "fe_8",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Browser Storage & Offline",
            "question": "Compare LocalStorage, SessionStorage, and IndexedDB. Which would you use for caching large datasets or offline-first applications, and why?",
            "reference_answer": "LocalStorage is synchronous, domain-bound, persistent across sessions, and capped at ~5MB of key-value strings. SessionStorage is similar but scoped to the browser tab lifetime. Both block the main JavaScript thread on I/O. IndexedDB is an asynchronous, transactional, indexed object store capable of storing hundreds of megabytes of structured data (blobs, JSON) without blocking the main UI thread. IndexedDB is the standard choice for offline caching, PWA storage, and large client datasets.",
            "checklist": [
                "Noted storage limits (~5MB for LocalStorage vs hundreds of MB for IndexedDB)",
                "Mentioned synchronous/blocking nature of LocalStorage vs asynchronous IndexedDB",
                "Explained SessionStorage tab-scoped lifetime",
                "Selected IndexedDB for offline-first applications and justified with non-blocking I/O"
            ]
        },
        {
            "id": "fe_9",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "Accessibility (a11y)",
            "question": "What is semantic HTML, and how does it benefit accessibility (WCAG compliance) and SEO?",
            "reference_answer": "Semantic HTML uses tags that convey the meaning of the content (e.g., `<header>`, `<nav>`, `<main>`, `<article>`, `<button>`) rather than generic `<div>` or `<span>`. For screen readers and assistive technology, semantic tags create a meaningful accessibility tree with built-in roles, keyboard tab navigation, and focus management. For search engines, semantic markup clarifies content hierarchy and indexing.",
            "checklist": [
                "Defined semantic elements with concrete examples (<header>, <nav>, <button>)",
                "Explained accessibility tree benefits for screen readers",
                "Mentioned built-in keyboard accessibility and focus states",
                "Mentioned SEO indexing benefits"
            ]
        },
        {
            "id": "fe_10",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "TypeScript in Frontend",
            "question": "In TypeScript, what is the difference between `interface` and `type`? When would you use a generic type parameter?",
            "reference_answer": "`interface` is primarily for declaring object shapes and supports declaration merging (augmenting third-party modules or global window properties). `type` aliases can define objects, unions (`A | B`), intersections (`A & B`), primitives, and tuple types. Generics allow writing reusable, type-safe components or functions where the concrete type is determined at invocation (e.g. an API response wrapper `interface ApiResponse<T> { data: T; status: number; }`).",
            "checklist": [
                "Identified declaration merging as unique to interfaces",
                "Identified union/primitive/tuple capabilities of type aliases",
                "Defined Generics as parameterized type placeholders",
                "Gave an example of generics (e.g. API response wrapper or reusable component props)"
            ]
        },
        {
            "id": "fe_11",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Build Tools & Bundling",
            "question": "How does Vite achieve faster local development builds compared to traditional Webpack bundlers?",
            "reference_answer": "Webpack bundles all application source code into a single bundle before serving it locally. Vite leverages native browser ES Modules (ESM). In development, Vite only transforms and serves individual files on demand when requested by the browser. For third-party node_modules dependencies, Vite pre-bundles them using esbuild (written in Go), which is 10-100x faster than JavaScript-based bundlers, resulting in near-instant server start and Hot Module Replacement (HMR).",
            "checklist": [
                "Mentioned native ES Modules (ESM) serving in browser during dev",
                "Contrasted with Webpack whole-app pre-bundling",
                "Mentioned esbuild pre-bundling for node_modules dependencies",
                "Highlighted fast Hot Module Replacement (HMR)"
            ]
        },
        {
            "id": "fe_12",
            "role": "Frontend Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Rendering Paradigms",
            "question": "Compare Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG). What are the trade-offs of each?",
            "reference_answer": "CSR ships an empty HTML shell and bundles JavaScript; fast subsequent navigation, but poor initial load time (FCP/LCP) and indexing hurdles. SSR renders HTML per-request on the server; great for SEO and dynamic real-time data, but higher server compute load and Time to First Byte (TTFB). SSG pre-renders HTML at build time; unbeatable speed and cheap CDN edge caching, but build times grow with page count and it cannot serve personalized real-time data without client hydration.",
            "checklist": [
                "Explained CSR mechanics and trade-offs (client JS burden, slow initial paint)",
                "Explained SSR mechanics and trade-offs (per-request server render, better SEO, higher server load)",
                "Explained SSG mechanics and trade-offs (pre-rendered at build time, instant CDN delivery)",
                "Summarized hydration concept connecting client JS to server HTML"
            ]
        }
    ],

    # ---------------------------------------------------------
    # BACKEND DEVELOPER
    # ---------------------------------------------------------
    "Backend Developer": [
        {
            "id": "be_1",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "RESTful API Design",
            "question": "What are the core constraints of REST architecture, and what makes an HTTP method idempotent?",
            "reference_answer": "REST principles include statelessness, client-server separation, uniform interface, cacheability, and layered systems. An HTTP method is idempotent if executing it multiple times with the same parameters produces the exact same server resource state as executing it once. GET, PUT, DELETE, and HEAD are idempotent; POST is typically not idempotent because multiple requests create multiple distinct resources.",
            "checklist": [
                "Listed key REST constraints (stateless, client-server, uniform interface)",
                "Defined idempotency precisely (repeated requests leave server state unchanged)",
                "Identified idempotent methods (GET, PUT, DELETE, HEAD)",
                "Noted that POST is generally non-idempotent"
            ]
        },
        {
            "id": "be_2",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Database Indexing",
            "question": "How do B-Tree indexes work in relational databases? Why shouldn't you index every column in a table?",
            "reference_answer": "B-Tree indexes maintain a balanced multi-way search tree where leaf nodes store column values and row pointers sorted in order, enabling O(log N) lookup, range scans, and sorting. You shouldn't index every column because: 1) Every INSERT, UPDATE, and DELETE must update all corresponding indexes, degrading write throughput; 2) Indexes consume significant memory and disk space; 3) Low-cardinality columns (e.g. boolean flags) provide poor selectivity and query planners may ignore them.",
            "checklist": [
                "Explained B-Tree structure and O(log N) search/range lookup",
                "Explained write performance penalty (INSERT/UPDATE/DELETE index overhead)",
                "Mentioned disk and buffer pool RAM consumption",
                "Mentioned column cardinality and selectivity considerations"
            ]
        },
        {
            "id": "be_3",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Concurrency & Async",
            "question": "Explain the difference between CPU-bound and I/O-bound tasks in a backend service. When should you use asynchronous programming (e.g., Python asyncio/async-await) versus multithreading/multiprocessing?",
            "reference_answer": "I/O-bound tasks spend most of their time waiting for external operations (network requests, database queries, disk reads). Async/await (event loop) handles tens of thousands of concurrent I/O operations cooperatively on a single thread with minimal memory footprint. CPU-bound tasks (image processing, data crunching, cryptography) consume CPU cycles; here, async provides no benefit because one calculation blocks the event loop. In Python, multiprocessing or worker pools bypass the GIL to utilize multiple CPU cores.",
            "checklist": [
                "Differentiated I/O-bound (waiting on network/DB) and CPU-bound (heavy calculations)",
                "Explained how async/await event loops excel at concurrent I/O with low overhead",
                "Explained why CPU-bound tasks block single-threaded event loops",
                "Mentioned multiprocessing or thread/worker pools for CPU parallelism"
            ]
        },
        {
            "id": "be_4",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Database Transactions & ACID",
            "question": "Explain each of the ACID properties in database management. What is a dirty read?",
            "reference_answer": "Atomicity ensures all statements in a transaction succeed or all roll back. Consistency guarantees data transitions only between valid states satisfying constraints. Isolation prevents concurrent transactions from interfering with each other. Durability guarantees committed transactions survive system crashes. A dirty read occurs at the Read Uncommitted isolation level when Transaction A reads data modified by Transaction B that has not yet been committed and might later roll back.",
            "checklist": [
                "Correctly defined Atomicity, Consistency, Isolation, and Durability",
                "Defined a dirty read as reading uncommitted, rollback-prone data",
                "Mentioned transaction isolation levels (Read Committed, Repeatable Read, Serializable)",
                "Explained the trade-off between strict isolation and concurrent throughput"
            ]
        },
        {
            "id": "be_5",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Caching Strategies",
            "question": "Compare Cache-Aside (Lazy Loading) and Write-Through caching patterns. How do you handle cache invalidation and the 'thundering herd' problem?",
            "reference_answer": "In Cache-Aside, the application first queries the cache; on a miss, it fetches from the DB and writes to the cache. In Write-Through, writes update the cache and the DB synchronously. The 'thundering herd' (or cache stampede) happens when a hot cache key expires and thousands of concurrent requests all hit the database simultaneously. Mitigations include: probabilistic early expiration (XFetch), mutex locks around cache misses, and setting stale-while-revalidate TTLs.",
            "checklist": [
                "Described Cache-Aside workflow (read cache, fallback to DB, populate cache)",
                "Described Write-Through workflow (write to cache and DB simultaneously)",
                "Explained thundering herd/cache stampede on hot key expiration",
                "Suggested solutions (mutex locking, jittered TTLs, stale-while-revalidate)"
            ]
        },
        {
            "id": "be_6",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Authentication & Authorization",
            "question": "How do JWTs (JSON Web Tokens) work? What are the security risks of storing sensitive permissions in JWTs, and how do you implement token revocation?",
            "reference_answer": "A JWT consists of Header, Payload, and Signature, cryptographically signed by the server. Because JWTs are self-contained and stateless, verifying them doesn't require a database hit. However, payloads are base64-encoded (not encrypted), so sensitive secrets must never be placed inside. Since they are stateless, revoking a compromised token before its expiration requires an invalidation blacklist (e.g. in Redis), short-lived access tokens (15 mins) with refresh token rotation, or a user-specific token version counter.",
            "checklist": [
                "Identified Header, Payload, Signature components",
                "Emphasized that JWT payloads are readable by anyone (encoded, not encrypted)",
                "Explained the difficulty of immediate revocation in purely stateless setups",
                "Proposed revocation strategies (short TTLs + refresh rotation, Redis blacklist)"
            ]
        },
        {
            "id": "be_7",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Message Queues & Event-Driven Architecture",
            "question": "When would you introduce a message broker (such as RabbitMQ, Kafka, or AWS SQS) into a backend architecture? What is the difference between at-least-once and exactly-once delivery?",
            "reference_answer": "Message brokers decouple producers and consumers, absorb sudden traffic spikes (rate leveling), enable asynchronous background processing (e.g. email sending, heavy reports), and support fan-out Pub/Sub. At-least-once delivery guarantees messages are never lost, but network retries or worker crashes before ACK may cause duplicates; consumers must therefore be idempotent. Exactly-once delivery requires end-to-end distributed transaction coordination or two-phase commits and idempotency keys.",
            "checklist": [
                "Identified use cases (decoupling, spike smoothing, async jobs)",
                "Defined at-least-once delivery and the necessity of idempotent consumers",
                "Defined exactly-once delivery and its complexity/performance cost",
                "Mentioned acknowledgments (ACK/NACK) and dead-letter queues"
            ]
        },
        {
            "id": "be_8",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "API Rate Limiting",
            "question": "Describe two rate limiting algorithms (e.g., Token Bucket and Sliding Window). How would you implement distributed rate limiting across multiple server instances?",
            "reference_answer": "Token Bucket adds tokens at a fixed rate up to a capacity; requests consume tokens and pass if available, allowing bursts. Sliding Window Log/Counter tracks timestamps or time slices, smoothing out burst abuse at window boundaries. For distributed rate limiting, local in-memory counters fail because traffic is load-balanced; a shared in-memory data store like Redis using atomic operations (Redis Lua scripts or Redis Cell) tracks user keys consistently across instances.",
            "checklist": [
                "Explained Token Bucket mechanics and burst tolerance",
                "Explained Sliding Window mechanics and window boundary handling",
                "Recognized need for centralized state (e.g. Redis) across multi-instance backends",
                "Mentioned atomic execution (Lua scripts) to avoid race conditions"
            ]
        },
        {
            "id": "be_9",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "HTTP Status Codes & Error Handling",
            "question": "What is the difference between 401 Unauthorized, 403 Forbidden, 422 Unprocessable Entity, and 500 Internal Server Error?",
            "reference_answer": "401 Unauthorized means the request lacks valid authentication credentials (user identity unknown). 403 Forbidden means the user is authenticated, but lacks permissions/authorization to access the resource. 422 Unprocessable Entity means the syntax and headers are valid, but semantic/validation errors exist in the request body. 500 Internal Server Error indicates an unhandled server-side exception or crash.",
            "checklist": [
                "Distinguished 401 (not authenticated) from 403 (authenticated but not authorized)",
                "Defined 422 as semantic validation failure on valid payload",
                "Defined 500 as unexpected server fault",
                "Emphasized standardized JSON error responses"
            ]
        },
        {
            "id": "be_10",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Database Sharding & Replication",
            "question": "What is the difference between horizontal database sharding and read replicas? When do you choose each?",
            "reference_answer": "Read replicas duplicate the primary database to serve read-heavy queries; writes go to the primary and stream asynchronously to replicas. Sharding partitions data horizontally across multiple database servers based on a shard key (e.g., tenant ID or user ID range). You use read replicas when read traffic outpaces write traffic and the total dataset fits on one machine. You use sharding when dataset size or write volume exceeds the capacity of a single physical server.",
            "checklist": [
                "Defined read replicas (copies for read scaling, single primary for writes)",
                "Defined horizontal sharding (splitting rows across instances by shard key)",
                "Explained replica replication lag and eventual consistency",
                "Highlighted when to shard (write bottlenecks, dataset larger than single machine)"
            ]
        },
        {
            "id": "be_11",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Microservices vs Monolith",
            "question": "What are the primary operational challenges introduced when transitioning from a modular monolith to microservices?",
            "reference_answer": "Microservices introduce distributed system complexity: network latency and partial failures, distributed transactions (replacing ACID with Saga pattern and eventual consistency), distributed tracing and log aggregation across dozens of services, API contract versioning, data duplication across independent databases, and complex deployment/orchestration infrastructure (Kubernetes, service meshes).",
            "checklist": [
                "Mentioned network latency and partial failure handling (circuit breakers)",
                "Addressed distributed data consistency (Sagas vs ACID)",
                "Identified observability needs (distributed tracing, centralized logging)",
                "Discussed operational overhead (CI/CD, container orchestration)"
            ]
        },
        {
            "id": "be_12",
            "role": "Backend Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "SQL vs NoSQL",
            "question": "When would you choose a Document store (like MongoDB) over a Relational SQL database (like PostgreSQL)?",
            "reference_answer": "Choose SQL/PostgreSQL when data is inherently relational, requires strict schemas, complex joins, and transactional ACID guarantees (financial data, order fulfillment). Choose MongoDB/Document store when data is hierarchical/nested and naturally queried together, schema is polymorphic or evolves rapidly, high-velocity ingestion requires horizontal partitioning, and relational joins are minimal or unnecessary.",
            "checklist": [
                "Identified relational strength (joins, normalized integrity, ACID)",
                "Identified Document store strength (nested documents, schema flexibility)",
                "Gave appropriate use case scenarios for each",
                "Mentioned modern PostgreSQL JSONB capabilities bridging the gap"
            ]
        }
    ],

    # ---------------------------------------------------------
    # FULL STACK DEVELOPER
    # ---------------------------------------------------------
    "Full Stack Developer": [
        {
            "id": "fs_1",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "End-to-End Request Flow",
            "question": "Walk through what happens from the moment a user submits a form on a React frontend to when the updated data is persisted in a database and reflected back on the UI.",
            "reference_answer": "1) React event handler intercepts form submit, prevents default page reload, and performs client validation. 2) Sends an asynchronous HTTP request (e.g. fetch/axios) with JSON payload to backend endpoint. 3) Backend router receives request, middleware verifies CORS and auth token. 4) Controller parses and validates body using a schema (e.g. Pydantic/Zod). 5) Business logic opens a DB transaction and executes an INSERT/UPDATE. 6) Database writes to disk and returns success. 7) Backend responds with HTTP 200/201 and updated record. 8) React updates local state, triggering a re-render showing the updated UI.",
            "checklist": [
                "Prevent default form submit and client validation",
                "HTTP request dispatch with JSON payload and auth headers",
                "Backend middleware, routing, and schema validation",
                "Database transaction and persistence",
                "Frontend state update and UI re-render"
            ]
        },
        {
            "id": "fs_2",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Optimistic UI Updates",
            "question": "What is an Optimistic UI update? How do you implement it, and how do you handle server-side errors or rollbacks?",
            "reference_answer": "Optimistic UI immediately updates the client interface assuming the server mutation will succeed, providing zero perceived latency (e.g., liking a post). To implement: 1) Save snapshot of current UI state. 2) Immediately update client state and render new value. 3) Dispatch async API call. 4) If the API succeeds, sync real server IDs/timestamps. 5) If the API fails, catch the error, roll back client state to the snapshot, and display an actionable toast/notification explaining the failure.",
            "checklist": [
                "Defined Optimistic UI (instant visual feedback before server confirms)",
                "Explained saving prior state snapshot",
                "Described rollback mechanism if server request fails",
                "Mentioned user error communication (toasts/notifications)"
            ]
        },
        {
            "id": "fs_3",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "WebSockets vs Polling",
            "question": "Compare Short Polling, Long Polling, Server-Sent Events (SSE), and WebSockets. When would you use SSE over WebSockets?",
            "reference_answer": "Short Polling sends repetitive requests at fixed intervals (high server overhead). Long Polling keeps connections open until data arrives. SSE is a lightweight, unidirectional HTTP connection from server to client with automatic reconnection and text stream support. WebSockets provide full-duplex, bidirectional TCP communication. Use SSE when you only need server-to-client updates (e.g., live stock tickers, AI response streaming, notification feeds) because it uses standard HTTP/2, traverses proxies easily, and requires no custom socket protocol.",
            "checklist": [
                "Explained polling overhead compared to streaming connections",
                "Differentiated SSE (unidirectional, HTTP) from WebSockets (bidirectional, full-duplex TCP)",
                "Identified SSE advantages for server-to-client streaming (AI tokens, notifications)",
                "Identified WebSocket advantages for two-way collaboration (chat, multiplayer)"
            ]
        },
        {
            "id": "fs_4",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "CORS & Security",
            "question": "Explain how Cross-Origin Resource Sharing (CORS) works. What is a preflight OPTIONS request, and why doesn't CORS protect a backend against server-to-server attacks?",
            "reference_answer": "CORS is a browser security mechanism that restricts a web page on one origin from making requests to a different origin. For non-simple requests (custom headers like Authorization, Content-Type: application/json, or methods like PUT/DELETE), the browser sends an HTTP OPTIONS preflight request. The server must respond with `Access-Control-Allow-Origin` and allowed methods. CORS is enforced exclusively by web browsers; curl scripts, Postman, or malicious backend servers bypass browser CORS checks entirely.",
            "checklist": [
                "Defined CORS as a browser-enforced security mechanism",
                "Explained preflight OPTIONS request trigger conditions",
                "Explained key CORS headers (Access-Control-Allow-Origin, Allow-Headers)",
                "Clarified that non-browser clients (curl, bots) ignore CORS"
            ]
        },
        {
            "id": "fs_5",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "File Upload Pipelines",
            "question": "How should a scalable full-stack application handle large file uploads (e.g., 500MB videos or multi-page documents)? Why shouldn't files be uploaded directly through the application server?",
            "reference_answer": "Uploading directly through app servers blocks backend worker threads, consumes server memory/disk, and risks timeout under slow client connections. The scalable architecture uses pre-signed direct uploads: 1) Client requests an upload URL from backend. 2) Backend validates permissions and returns a short-lived Pre-Signed S3/Blob URL. 3) Frontend uploads directly to object storage via PUT/multipart upload. 4) Storage triggers a webhook/event notifying the backend upon completion.",
            "checklist": [
                "Identified app server bottleneck (memory, thread consumption, timeouts)",
                "Explained pre-signed URL workflow",
                "Described client uploading directly to Object Storage (S3/GCS)",
                "Mentioned asynchronous webhook/notification upon upload completion"
            ]
        },
        {
            "id": "fs_6",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Database Migrations",
            "question": "How do you manage zero-downtime database schema migrations in production when renaming or removing a column?",
            "reference_answer": "Renaming a column directly breaks running instances of the app still expecting the old name. Zero-downtime migrations use the Expand and Contract pattern: 1) Expand: Add new column without removing old one. 2) Deploy app version that writes to both columns and reads from old. 3) Backfill historical data from old column to new column. 4) Deploy app version that reads and writes solely to new column. 5) Contract: Safely drop the old column in a final migration.",
            "checklist": [
                "Identified the danger of single-step rename/drop on running servers",
                "Described Expand-and-Contract (multi-phase) migration pattern",
                "Mentioned dual-writing and historical data backfill",
                "Mentioned final cleanup step dropping the legacy column"
            ]
        },
        {
            "id": "fs_7",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "SSR Hydration & Architecture",
            "question": "What is 'Hydration' in Server-Side Rendered (SSR) React applications, and what causes Hydration Mismatch errors?",
            "reference_answer": "SSR generates static HTML on the server and sends it to the browser for instant visual display. Hydration is the client-side process where React loads JavaScript, walks the existing DOM tree, attaches event listeners, and binds interactive state. A Hydration Mismatch occurs when the HTML generated on the server does not match the DOM generated during client initial render (e.g., using `window.innerWidth`, `localStorage`, non-deterministic dates `new Date()`, or invalid HTML nesting).",
            "checklist": [
                "Defined hydration (attaching event listeners to server-rendered HTML)",
                "Explained the difference between server-rendered markup and client hydration",
                "Identified causes of mismatch (window checks, dates, math.random, invalid HTML)",
                "Explained how to fix (useEffect for client-only state, suppressing warnings)"
            ]
        },
        {
            "id": "fs_8",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Authentication State Management",
            "question": "Where should authentication tokens be stored in a modern full-stack web app: LocalStorage or HttpOnly Cookies? Discuss the trade-offs.",
            "reference_answer": "LocalStorage is vulnerable to XSS attacks; if malicious JavaScript executes, it can steal the token. HttpOnly cookies cannot be read by JavaScript, protecting against XSS token exfiltration, but are vulnerable to CSRF attacks unless paired with `SameSite=Lax/Strict` and anti-CSRF headers. Best practice: Store short-lived access tokens in memory (React state) and refresh tokens in secure, `HttpOnly`, `SameSite` cookies.",
            "checklist": [
                "Explained LocalStorage vulnerability to XSS script exfiltration",
                "Explained HttpOnly cookie immunity to JavaScript access",
                "Addressed CSRF vulnerability with cookies and SameSite mitigation",
                "Recommended in-memory access token + HttpOnly refresh token architecture"
            ]
        },
        {
            "id": "fs_9",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "Form Handling & Validation",
            "question": "Why should form validation always be performed on both the client side and the server side?",
            "reference_answer": "Client-side validation provides immediate, friendly user experience (instant error messages, disabled buttons) without waiting for network round-trips. However, client validation provides ZERO security because malicious actors can bypass the browser using curl, Postman, or disabled JS. Server-side validation is strictly required as the authoritative security boundary to ensure data integrity, prevent injection attacks, and protect the database.",
            "checklist": [
                "Client-side role: User experience, immediate feedback, reduced network load",
                "Client-side limitation: Easily bypassed by direct HTTP requests",
                "Server-side role: Authoritative security boundary and database protection",
                "Emphasized schema validation libraries (e.g. Zod / Pydantic)"
            ]
        },
        {
            "id": "fs_10",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Containerization & Docker",
            "question": "Explain multi-stage Docker builds. Why are they particularly beneficial when containerizing a React frontend and Python FastAPI backend?",
            "reference_answer": "A standard build leaves compilers, devDependencies, and build tools inside the container, bloating image size and security attack surface. Multi-stage builds separate build environments from runtime environments. For React: Stage 1 uses Node to install packages and compile static files (`npm run build`); Stage 2 copies only the static `dist` folder into a tiny Nginx/Caddy container (~20MB). For Python: wheels are built in a build stage, and only wheels/dependencies are copied into a slim Python runtime image.",
            "checklist": [
                "Explained multi-stage build concept (build stage vs production runtime stage)",
                "Highlighted image size reduction and reduced attack surface",
                "Applied to frontend (discarding Node/npm, keeping only static HTML/JS in Nginx)",
                "Applied to backend (compiling wheels, using slim base image)"
            ]
        },
        {
            "id": "fs_11",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "API Contract Testing",
            "question": "What is API contract testing (e.g., Pact or OpenAPI spec verification), and how does it prevent regressions between frontend and backend teams?",
            "reference_answer": "Contract testing verifies that the provider (backend) and consumer (frontend) agree on the shared API interface (request parameters, status codes, payload schemas). Instead of fragile end-to-end integration tests, contract testing generates a shared specification. If backend changes a field name or makes a previously optional field required, the contract test fails immediately in CI before breaking production.",
            "checklist": [
                "Defined API contract as explicit agreed schema between consumer and provider",
                "Contrasted with slow/flaky full E2E environments",
                "Explained how automated contract verification runs in CI",
                "Highlighted early detection of breaking schema changes"
            ]
        },
        {
            "id": "fs_12",
            "role": "Full Stack Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Error Handling & Boundaries",
            "question": "How do you implement comprehensive error handling across a full-stack stack, from backend global exception handlers to React Error Boundaries?",
            "reference_answer": "On the backend: Use a global exception handler middleware to catch unhandled errors, log stack traces internally with correlation IDs, and return consistent, sanitized JSON responses (`{ error: 'message', code: 'CODE' }`) without leaking raw DB errors. On the frontend: API wrappers intercept non-2xx responses and display toasts. React Error Boundaries catch render crashes in component subtrees, logging them to monitoring tools while displaying fallback UI instead of crashing the whole screen.",
            "checklist": [
                "Backend global exception handler and sanitized error payloads",
                "Correlation/Request IDs for debugging without leaking internal stack traces",
                "Frontend HTTP client response interception",
                "React Error Boundaries catching runtime component tree crashes"
            ]
        }
    ],

    # ---------------------------------------------------------
    # JAVA DEVELOPER
    # ---------------------------------------------------------
    "Java Developer": [
        {
            "id": "jv_1",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "JVM Architecture & Memory",
            "question": "Explain the different memory regions of the JVM (Heap, Stack, Metaspace, PC Register) and what each stores.",
            "reference_answer": "Heap: Shared memory where all objects and instance variables are allocated, managed by Garbage Collection. Stack: Thread-private memory storing frame information, local primitive variables, and references to objects on the heap. Metaspace: Stores class metadata, bytecode, and method structures outside the heap in native memory. PC Register: Holds the address of the current JVM instruction being executed per thread.",
            "checklist": [
                "Heap stores objects/instances and is GC-managed",
                "Stack is thread-private and stores method frames and local variables/pointers",
                "Metaspace stores class metadata in native memory (replaces PermGen)",
                "Differentiated thread-shared (Heap, Metaspace) vs thread-private (Stack, PC)"
            ]
        },
        {
            "id": "jv_2",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Garbage Collection",
            "question": "How do generational Garbage Collectors (such as G1 GC or ZGC) work in modern Java?",
            "reference_answer": "Generational GC is based on the weak generational hypothesis: most objects die young. Heap is divided into Young Generation (Eden and Survivor spaces S0/S1) and Old (Tenured) Generation. New objects allocate in Eden; survivors of Minor GC cycles age and promote to Old Generation. G1 GC partitions heap into equal regions and prioritizes regions with the most garbage ('Garbage-First') to meet pause time goals. ZGC uses colored pointers and load barriers to achieve concurrent pause times under 1 millisecond.",
            "checklist": [
                "Explained weak generational hypothesis (most objects die young)",
                "Described Eden, Survivor spaces, and Tenured/Old generation promotion",
                "Explained G1 GC region-based partitioning and pause-time goals",
                "Mentioned low-latency collectors like ZGC or Shenandoah"
            ]
        },
        {
            "id": "jv_3",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Spring Boot Core & DI",
            "question": "How does Spring's Inversion of Control (IoC) and Dependency Injection (DI) work? What is the difference between `@Component`, `@Service`, and `@Repository`?",
            "reference_answer": "IoC transfers the responsibility of creating and wiring object dependencies from the programmer to the Spring ApplicationContext container. DI injects these dependencies (preferably via constructor injection). `@Component` is the generic archetype for any Spring-managed bean. `@Service` specializes `@Component` for business logic. `@Repository` specializes `@Component` for data access and enables automatic persistence exception translation into Spring's DataAccessException hierarchy.",
            "checklist": [
                "Defined Inversion of Control (container creates and wires beans)",
                "Advocated constructor injection over field injection",
                "Clarified @Component as the base stereotype",
                "Highlighted @Repository's automatic exception translation"
            ]
        },
        {
            "id": "jv_4",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Java Collections & Concurrency",
            "question": "How does `ConcurrentHashMap` achieve thread safety without locking the entire map like `Hashtable` or `Collections.synchronizedMap`?",
            "reference_answer": "`Hashtable` synchronizes every method, creating a single global bottleneck. In Java 8+, `ConcurrentHashMap` uses fine-grained synchronization: reads are completely lock-free via volatile reads, while writes lock only the specific hash bucket head node using `synchronized` (or CAS - Compare-And-Swap for empty bins). This allows concurrent reads and concurrent writes to different buckets without blocking each other.",
            "checklist": [
                "Criticized Hashtable's coarse-grained single lock",
                "Explained CAS (Compare-And-Swap) for empty bucket insertion",
                "Explained synchronized locking limited to the head node of a specific bucket",
                "Noted lock-free reads using volatile memory semantics"
            ]
        },
        {
            "id": "jv_5",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "OOP & SOLID",
            "question": "Explain the SOLID design principles in object-oriented programming with a brief Java example.",
            "reference_answer": "S: Single Responsibility (a class has one reason to change). O: Open/Closed (open for extension via interfaces, closed for modification). L: Liskov Substitution (subtypes must be substitutable for base types without breaking behavior). I: Interface Segregation (clients shouldn't depend on interfaces they don't use; favor small interfaces). D: Dependency Inversion (high-level modules depend on abstractions, not concrete implementations).",
            "checklist": [
                "Defined Single Responsibility and Open/Closed",
                "Defined Liskov Substitution and Interface Segregation",
                "Defined Dependency Inversion",
                "Provided practical object-oriented design context"
            ]
        },
        {
            "id": "jv_6",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Hibernate & JPA N+1 Problem",
            "question": "What is the N+1 SELECT problem in Hibernate/JPA, and what are three ways to resolve it?",
            "reference_answer": "The N+1 problem occurs when fetching an entity with lazy relationships: executing 1 query to retrieve N parent entities results in N additional separate queries to fetch each parent's associated children. Solutions: 1) Use `JOIN FETCH` in JPQL/HQL to load parents and children in a single SQL query; 2) Use `@EntityGraph` to define fetch plans declaratively; 3) Set `@BatchSize` (e.g. `@BatchSize(size = 25)`) to batch child queries using `WHERE id IN (...)`.",
            "checklist": [
                "Clearly defined N+1 problem (1 initial query + N child queries)",
                "Proposed JOIN FETCH solution",
                "Proposed @EntityGraph solution",
                "Proposed @BatchSize / batch fetching solution"
            ]
        },
        {
            "id": "jv_7",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Java Streams & Lambdas",
            "question": "What is the difference between intermediate and terminal operations in the Java Streams API? What does laziness mean in this context?",
            "reference_answer": "Intermediate operations (such as `filter`, `map`, `sorted`) return a new Stream and are lazy: they do not process elements until a terminal operation is invoked. Terminal operations (such as `collect`, `forEach`, `reduce`, `count`) consume the stream, trigger element processing, and return a concrete result or side effect. Laziness optimizes performance via loop fusion and short-circuiting (e.g. `findFirst` stops after the first matching item).",
            "checklist": [
                "Differentiated intermediate (returns Stream) from terminal (returns result/void)",
                "Defined lazy evaluation (execution is deferred until terminal call)",
                "Gave examples of both types of operations",
                "Explained optimization benefits like loop fusion and short-circuiting"
            ]
        },
        {
            "id": "jv_8",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Java Concurrency & Threads",
            "question": "What is the difference between `volatile`, `synchronized`, and `AtomicInteger` in Java multithreading?",
            "reference_answer": "`volatile` guarantees visibility across CPU caches (reads/writes bypass L1/L2 caches directly to main memory) and prevents instruction reordering, but does NOT guarantee atomicity for compound operations like `count++`. `synchronized` provides mutual exclusion (locking) and visibility, guaranteeing atomicity at the cost of thread blocking/context switches. `AtomicInteger` provides atomic operations (like `incrementAndGet`) lock-free using hardware-level CAS (Compare-And-Swap) instructions.",
            "checklist": [
                "volatile guarantees visibility and prevents reordering, but not compound atomicity",
                "synchronized guarantees mutual exclusion and visibility via locking",
                "AtomicInteger uses lock-free hardware CAS operations",
                "Highlighted performance trade-offs"
            ]
        },
        {
            "id": "jv_9",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Exception Handling",
            "question": "What is the difference between Checked and Unchecked exceptions in Java? How should exceptions be handled in a Spring Boot REST API?",
            "reference_answer": "Checked exceptions inherit from `Exception` (excluding `RuntimeException`) and are verified at compile time; the compiler forces you to handle them via `try-catch` or `throws`. Unchecked exceptions inherit from `RuntimeException` (e.g., `NullPointerException`, `IllegalArgumentException`) and occur at runtime. In Spring Boot, avoid catching and swallowing exceptions in controllers; instead, throw domain-specific unchecked exceptions and handle them globally using `@RestControllerAdvice` with `@ExceptionHandler` methods returning standard error responses.",
            "checklist": [
                "Checked exceptions checked at compile-time (inherit Exception)",
                "Unchecked exceptions happen at runtime (inherit RuntimeException)",
                "Best practice in Spring: custom unchecked domain exceptions",
                "Global handling via @RestControllerAdvice and @ExceptionHandler"
            ]
        },
        {
            "id": "jv_10",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Spring Transaction Management",
            "question": "How does `@Transactional` work in Spring Boot? Why does calling a `@Transactional` method from within the same class (self-invocation) fail to start a new transaction?",
            "reference_answer": "Spring uses dynamic AOP (Aspect-Oriented Programming) proxies (CGLIB or JDK dynamic proxies) around `@Transactional` beans to intercept calls, open a transaction via `PlatformTransactionManager`, and commit or rollback. Self-invocation (`this.method()`) bypasses the proxy and calls the target instance directly, meaning the transaction interceptor is never invoked. Workarounds include injecting the bean into itself, refactoring the method into a separate service, or using AspectJ compile-time weaving.",
            "checklist": [
                "Explained Spring AOP proxy interception mechanism",
                "Explained why self-invocation (`this.method()`) bypasses the proxy",
                "Mentioned transaction lifecycle (begin, commit, rollback on RuntimeException)",
                "Provided solutions (refactor into separate service or inject self)"
            ]
        },
        {
            "id": "jv_11",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "String Immutability & Pool",
            "question": "Why is `String` immutable in Java, and how does the String Constant Pool save memory?",
            "reference_answer": "Strings are immutable for: 1) Security (safe to pass as usernames, DB URLs, file paths without risk of mutation); 2) Thread safety (can be shared across threads without synchronization); 3) HashCode caching (computed once and cached, crucial for `HashMap` keys). The String Constant Pool in the JVM Heap stores only one instance of any literal string. When multiple variables declare `String s = \"hello\"`, they all reference the same shared object in the pool.",
            "checklist": [
                "Explained security rationale (unalterable paths, connection URLs)",
                "Explained thread-safety benefits without locking",
                "Mentioned hashCode caching efficiency in HashMaps",
                "Described String Constant Pool deduplication"
            ]
        },
        {
            "id": "jv_12",
            "role": "Java Developer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Java Virtual Threads (Project Loom)",
            "question": "What are Virtual Threads introduced in Java 21, and how do they differ from traditional Platform (OS) threads?",
            "reference_answer": "Traditional Platform threads are 1:1 wrappers around operating system threads, consuming ~1MB of stack memory and making thread creation expensive, limiting servers to a few thousand threads. Virtual Threads (Project Loom) are lightweight threads managed entirely by the JVM (M:N mapping). Millions of virtual threads can run concurrently. When a virtual thread blocks on I/O (e.g. database read), the JVM unmounts it from the carrier OS thread, allowing the carrier thread to execute other work, enabling high-throughput request-per-thread servers.",
            "checklist": [
                "Platform threads are 1:1 with OS threads and consume substantial memory (~1MB)",
                "Virtual threads are lightweight JVM-managed threads (low memory KB footprint)",
                "Explained unmounting from carrier thread during blocking I/O",
                "Highlighted benefits for high-throughput synchronous-style I/O servers"
            ]
        }
    ],

    # ---------------------------------------------------------
    # DATA ANALYST
    # ---------------------------------------------------------
    "Data Analyst": [
        {
            "id": "da_1",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "SQL Joins",
            "question": "Explain the difference between INNER JOIN, LEFT JOIN, FULL OUTER JOIN, and CROSS JOIN with a business example.",
            "reference_answer": "INNER JOIN returns only rows with matching keys in both tables (e.g., customers who have placed at least one order). LEFT JOIN returns all rows from the left table and matched rows from the right, with NULLs for unmatched right records (e.g., all registered customers and their orders, showing NULL for customers with zero orders). FULL OUTER JOIN returns all rows from both tables, filling with NULL where matches don't exist. CROSS JOIN produces a Cartesian product matching every left row with every right row (e.g., all store locations crossed with all product SKUs).",
            "checklist": [
                "Accurately defined INNER JOIN (intersection of keys)",
                "Accurately defined LEFT JOIN (all left + matched right + NULLs)",
                "Accurately defined FULL OUTER JOIN and CROSS JOIN",
                "Provided practical business context for each"
            ]
        },
        {
            "id": "da_2",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "SQL Window Functions",
            "question": "What are SQL Window Functions, and how do `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()` differ when handling ties?",
            "reference_answer": "Window functions perform calculations across a set of table rows related to the current row without collapsing the rows into a single summary output like `GROUP BY`. When values tie: `ROW_NUMBER()` assigns sequential unique integers arbitrarily (1, 2, 3, 4); `RANK()` assigns identical ranks to ties and skips subsequent numbers (1, 2, 2, 4); `DENSE_RANK()` assigns identical ranks to ties without skipping subsequent numbers (1, 2, 2, 3).",
            "checklist": [
                "Differentiated window functions from GROUP BY (rows remain uncollapsed)",
                "ROW_NUMBER gives strict unique sequential integers",
                "RANK handles ties by duplicating and skipping next ranks",
                "DENSE_RANK handles ties by duplicating without skipping"
            ]
        },
        {
            "id": "da_3",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Data Cleaning & Missing Values",
            "question": "What strategies do you use to detect and handle missing data (MCAR, MAR, MNAR) in a dataset?",
            "reference_answer": "First, classify the missingness mechanism: MCAR (Missing Completely at Random), MAR (Missing at Random, dependent on observed data), or MNAR (Missing Not at Random, dependent on unobserved values). Handling strategies: 1) Deletion (listwise/pairwise) if missingness is MCAR and <5%; 2) Imputation with mean/median for numerical or mode for categorical when variance won't be distorted; 3) Predictive imputation (KNN, regression, MICE) for nuanced relationships; 4) Creating an indicator column `is_missing` so the model/analysis captures missingness as a signal.",
            "checklist": [
                "Mentioned missing data mechanisms (MCAR, MAR, MNAR)",
                "Discussed deletion vs imputation trade-offs",
                "Mentioned mean/median vs advanced imputation (KNN/MICE)",
                "Suggested missingness indicator flags"
            ]
        },
        {
            "id": "da_4",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "A/B Testing & Statistics",
            "question": "How do you evaluate an A/B test? Explain p-value, statistical significance, Type I vs Type II errors, and sample size determination.",
            "reference_answer": "A p-value is the probability of observing results as extreme as the experiment given that the null hypothesis is true. If p < alpha (typically 0.05), we reject the null hypothesis as statistically significant. Type I error (false positive, alpha) is declaring an effect that doesn't exist. Type II error (false negative, beta) is failing to detect a real effect (statistical power = 1 - beta, usually 80%). Sample size must be pre-calculated using baseline conversion rate, Minimum Detectable Effect (MDE), alpha, and power to avoid peeking bias.",
            "checklist": [
                "Defined p-value correctly (probability under null hypothesis)",
                "Differentiated Type I (false positive) and Type II (false negative) errors",
                "Explained statistical power (1 - beta, typically 80%)",
                "Emphasized power analysis for sample size calculation before launching"
            ]
        },
        {
            "id": "da_5",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "Data Visualization & Communication",
            "question": "How do you choose the right chart for different types of data (e.g., trend over time, part-to-whole, distribution, relationship)?",
            "reference_answer": "Trend over time: Line chart or area chart (shows continuous progression). Part-to-whole: 100% stacked bar chart or treemap (better than pie charts which struggle with >3 slices). Distribution: Histogram or Box plot (shows median, quartiles, spread, and outliers). Relationship/Correlation: Scatter plot with trend line. Qualitative/Ranking: Horizontal bar chart sorted descending.",
            "checklist": [
                "Line chart for continuous temporal trends",
                "Stacked bar or treemap for part-to-whole (caution against busy pie charts)",
                "Histogram/Box plot for distributions and outliers",
                "Scatter plot for variable relationships/correlations"
            ]
        },
        {
            "id": "da_6",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Cohort Analysis & Retention",
            "question": "What is cohort analysis, and how do you calculate user retention curves in SQL or Python?",
            "reference_answer": "Cohort analysis groups users by a shared characteristic and time period (e.g. signup month). To calculate retention: 1) Assign each user to an acquisition cohort (e.g. `DATE_TRUNC('month', signup_date)`). 2) Calculate activity periods for each user action (`DATE_TRUNC('month', activity_date)`). 3) Compute `period_number` as difference in months between activity and signup. 4) Aggregate distinct users per cohort and period. 5) Divide by cohort initial size to compute retention percentage across periods.",
            "checklist": [
                "Defined cohort (grouped by shared temporal milestone/signup)",
                "Calculated relative period offset (month 0, month 1, month 2...)",
                "Divided active users by initial cohort size for retention %",
                "Explained how retention curves diagnose product-market fit"
            ]
        },
        {
            "id": "da_7",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Data Modeling & Warehousing",
            "question": "Compare Star Schema versus Snowflake Schema in dimensional data modeling. What are Fact tables and Dimension tables?",
            "reference_answer": "Fact tables contain quantitative metrics and business events (e.g. sales amount, quantity sold) along with foreign keys. Dimension tables contain descriptive context (customer details, store location, time attributes). Star Schema connects fact tables directly to denormalized dimension tables, resulting in simpler queries and faster join performance. Snowflake Schema normalizes dimension tables into multiple sub-tables (e.g. product -> subcategory -> category), saving storage but requiring more complex multi-table joins.",
            "checklist": [
                "Defined Fact tables (metrics, foreign keys, event records)",
                "Defined Dimension tables (context, attributes, entities)",
                "Explained Star Schema (denormalized dimensions, simpler queries)",
                "Explained Snowflake Schema (normalized dimensions, more joins)"
            ]
        },
        {
            "id": "da_8",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Pandas & Data Manipulation",
            "question": "In Python Pandas, what is the difference between `merge`, `join`, and `concat`? How does `groupby` with `agg` work?",
            "reference_answer": "`pd.merge` is the most flexible SQL-like join function, matching on specified column keys (`on`, `left_on`, `right_on`). `df.join` joins DataFrames based on their indexes. `pd.concat` binds DataFrames vertically (stacking rows) or horizontally (aligning columns) along an axis. `groupby()` splits data into groups based on keys, applies an aggregation function (like `agg({'sales': ['sum', 'mean'], 'id': 'count'})`), and combines the results into a summarized DataFrame.",
            "checklist": [
                "pd.merge performs SQL-like joins on column keys",
                "df.join performs index-based joining",
                "pd.concat stacks/concatenates along an axis (0 or 1)",
                "groupby with agg splits, applies multiple aggregations, and combines"
            ]
        },
        {
            "id": "da_9",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Outlier Detection",
            "question": "What statistical techniques do you use to detect outliers in numerical data? When is an outlier genuine versus an error?",
            "reference_answer": "Techniques: 1) IQR Method (Interquartile Range): data points beyond `Q1 - 1.5*IQR` or `Q3 + 1.5*IQR` are flagged as outliers (robust against non-normal distributions); 2) Z-score: data points with `|z| > 3` in normally distributed data; 3) Isolation Forests or DBSCAN for multi-dimensional data. Genuine outliers reflect authentic extreme real-world events (e.g. Black Friday sales spike, high-net-worth customer); errors arise from sensor glitches, data entry typos, or failed conversions.",
            "checklist": [
                "Explained IQR rule (1.5 * IQR beyond quartiles)",
                "Explained Z-score method (|Z| > 3 for normal distributions)",
                "Differentiated genuine business anomalies from data entry/pipeline errors",
                "Advised against automatic deletion without domain investigation"
            ]
        },
        {
            "id": "da_10",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Business Metrics & KPIs",
            "question": "How do Customer Acquisition Cost (CAC), Lifetime Value (LTV), and Churn Rate relate to each other in evaluating a business's health?",
            "reference_answer": "CAC is total sales and marketing spend divided by new customers acquired. LTV is the gross profit generated by a customer over their entire relationship (roughly `Average Revenue Per User * Gross Margin / Churn Rate`). Churn rate directly determines the customer lifespan: higher churn shrinks LTV. A healthy business requires an LTV:CAC ratio of at least 3:1 with a CAC payback period under 12 months. If LTV:CAC < 1, the business is losing money on every customer acquired.",
            "checklist": [
                "Defined CAC and LTV formulas",
                "Explained Churn Rate as the denominator limiting customer lifetime",
                "Targeted healthy LTV:CAC benchmark (~3:1)",
                "Discussed CAC payback period"
            ]
        },
        {
            "id": "da_11",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "Correlation vs Causation",
            "question": "Explain 'Correlation does not imply causation' with an example. What methods establish true causal relationships?",
            "reference_answer": "Correlation measures how two variables move together, but cannot prove one causes the other. For example, ice cream sales and drowning rates both spike in summer; eating ice cream doesn't cause drowning—a confounding variable (hot weather) causes both. To establish true causality, perform Randomized Controlled Trials (A/B testing) to isolate variables, or use quasi-experimental econometric methods like Difference-in-Differences, Instrumental Variables, or Propensity Score Matching.",
            "checklist": [
                "Defined correlation and gave a clear confounding variable example",
                "Explained Randomized Controlled Trials (A/B tests) as gold standard",
                "Mentioned quasi-experimental methods (Difference-in-Differences, Propensity Matching)",
                "Addressed business risks of treating correlation as causation"
            ]
        },
        {
            "id": "da_12",
            "role": "Data Analyst",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "ETL vs ELT",
            "question": "What is the architectural difference between ETL and ELT? Why has modern cloud data warehousing shifted towards ELT?",
            "reference_answer": "ETL (Extract, Transform, Load) transforms data in an intermediate compute engine before loading clean data into a target warehouse. ELT (Extract, Load, Transform) loads raw data directly into the warehouse/data lake first, transforming it inside the warehouse using SQL (tools like dbt). Cloud data warehouses (Snowflake, BigQuery) offer virtually unlimited, cheap compute and storage, making it faster and more flexible to store raw data and re-run transformations on demand without re-extracting.",
            "checklist": [
                "ETL: Transform occurs before loading into warehouse",
                "ELT: Raw data loaded first, transformed inside warehouse",
                "Attributed shift to scalable cloud warehouse compute (BigQuery, Snowflake)",
                "Highlighted preservation of raw untransformed data for future auditing/re-modeling"
            ]
        }
    ],

    # ---------------------------------------------------------
    # DEVOPS ENGINEER
    # ---------------------------------------------------------
    "DevOps Engineer": [
        {
            "id": "do_1",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "CI/CD Pipeline Design",
            "question": "Describe the stages of a comprehensive Continuous Integration and Continuous Deployment (CI/CD) pipeline for a microservices application.",
            "reference_answer": "1) Source: Developer pushes commit to Git. 2) Lint & Static Analysis: SonarQube, security SAST scanning, dependency vulnerability checks. 3) Build: Compile code and build container images. 4) Test: Run unit tests, integration tests, contract tests. 5) Container Registry: Tag and push Docker image to secure registry. 6) Deploy to Staging: Automated GitOps rollout (ArgoCD) to staging cluster. 7) End-to-End & Smoke Tests: Validate environment. 8) Production Release: Canary or Blue/Green deployment with automatic metric rollback triggers.",
            "checklist": [
                "Static analysis, linting, security scanning",
                "Automated build and multi-layer automated tests",
                "Container registry image tagging and vulnerability scanning",
                "Staging validation and progressive production rollout (Canary/Blue-Green)"
            ]
        },
        {
            "id": "do_2",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Docker & Containerization",
            "question": "Explain Docker container layers, layer caching, and how you optimize a Dockerfile to minimize image size and build times.",
            "reference_answer": "Docker images consist of read-only layers generated by instructions (`FROM`, `RUN`, `COPY`). Docker caches layers: if a layer and its predecessors haven't changed, Docker reuses the cached layer. To optimize: 1) Order instructions from least frequently changed to most frequently changed (e.g., `COPY package.json` and install dependencies before `COPY .`); 2) Use minimal base images (Alpine or Distroless); 3) Combine `RUN` commands (`apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*`) to reduce layer count and clean cache artifacts in the same layer; 4) Use `.dockerignore`.",
            "checklist": [
                "Explained read-only layer structure and caching mechanism",
                "Advised ordering commands from least to most frequently modified",
                "Recommended slim base images (Alpine/Distroless)",
                "Combined RUN commands and cleaned package manager caches"
            ]
        },
        {
            "id": "do_3",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Kubernetes Core Architecture",
            "question": "Explain the role of Kubernetes Control Plane components: API Server, etcd, Controller Manager, and Kube-Scheduler.",
            "reference_answer": "kube-apiserver: The central REST gateway and control entry point that validates and configures data for pods, services, and replication controllers. etcd: Consistent, highly available distributed key-value store holding the complete cluster state. kube-scheduler: Monitors newly created pods with no assigned nodes and assigns them to optimal nodes based on resource constraints, taints/tolerations, and affinity. kube-controller-manager: Runs core control loops (Node Controller, ReplicaSet Controller, Deployment Controller) regulating cluster state toward desired state.",
            "checklist": [
                "kube-apiserver as the primary REST interface and cluster coordinator",
                "etcd as the persistent distributed state store",
                "kube-scheduler assigning pods to nodes based on constraints",
                "kube-controller-manager running continuous desired-state reconciliation loops"
            ]
        },
        {
            "id": "do_4",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Zero-Downtime Deployment Strategies",
            "question": "Compare Rolling Updates, Blue/Green Deployments, and Canary Releases. What are the advantages and drawbacks of each?",
            "reference_answer": "Rolling Update: Gradually replaces old pods with new pods one by one. Low resource overhead, but temporarily runs mixed versions concurrently. Blue/Green: Spins up an identical full environment (Green) running the new version alongside the current environment (Blue); shifts router traffic instantly once Green passes health checks. Instant rollback, but requires double the infrastructure resources. Canary: Routes a small percentage (e.g. 5%) of live traffic to the new version, monitors error rates and latency, and incrementally scales up. Safest real-world validation, but requires advanced traffic routing (service mesh/ingress).",
            "checklist": [
                "Rolling update: gradual pod replacement, mixed version window",
                "Blue/Green: dual environments, instant traffic switch and rollback, 2x cost",
                "Canary: percentage-based traffic routing, monitoring telemetry before full rollout",
                "Compared risk profiles and infrastructure cost"
            ]
        },
        {
            "id": "do_5",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Infrastructure as Code (IaC)",
            "question": "Why is Infrastructure as Code (e.g., Terraform) preferred over manual cloud console provisioning? What is Terraform State drift?",
            "reference_answer": "IaC provides reproducible, version-controlled, auditable infrastructure. It eliminates manual configuration errors and enables automated CI/CD environment spin-up and teardown. Terraform maintains a state file (`terraform.tfstate`) mapping real-world cloud resources to configuration code. State drift occurs when someone modifies resources manually outside Terraform (in the AWS/Azure web console) or external automation changes resources. `terraform plan` detects drift by refreshing current real-world state and comparing it against the desired configuration.",
            "checklist": [
                "Benefits: Version control, repeatability, audit trail, automated provisioning",
                "Defined Terraform state file purpose",
                "Explained state drift (manual out-of-band changes)",
                "Explained drift detection using terraform plan / refresh"
            ]
        },
        {
            "id": "do_6",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Kubernetes Networking & Ingress",
            "question": "What is the difference between ClusterIP, NodePort, LoadBalancer, and Ingress in Kubernetes?",
            "reference_answer": "ClusterIP: Default service type; exposes the service on an internal IP reachable only from within the cluster. NodePort: Exposes the service on a static high-range port (30000-32767) on each node's IP, reachable externally. LoadBalancer: Automatically provisions a cloud provider's external load balancer (e.g. AWS NLB) pointing to the NodePort. Ingress: An application-layer (L7) router and reverse proxy that manages HTTP/HTTPS routing, SSL termination, and host/path-based routing to multiple ClusterIP services behind a single external IP.",
            "checklist": [
                "ClusterIP is internal-only to the cluster",
                "NodePort opens a port on every physical worker node",
                "LoadBalancer provisions a dedicated cloud load balancer",
                "Ingress provides L7 routing, SSL termination, and multi-service routing under one IP"
            ]
        },
        {
            "id": "do_7",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Observability & Monitoring",
            "question": "Explain the three pillars of observability: Metrics, Logs, and Traces. How do Prometheus and Grafana fit into this architecture?",
            "reference_answer": "Metrics are numeric aggregates sampled over time (CPU utilization, request count, error rate), ideal for alerts and dashboards. Logs are timestamped event records containing discrete context about specific occurrences (stack traces, audit events). Traces track the end-to-end journey of a request through distributed microservices, identifying latency bottlenecks. Prometheus collects and stores time-series metrics via pull-based scraping and supports PromQL alerts. Grafana visualizes metrics, logs (Loki), and traces (Tempo) on unified operational dashboards.",
            "checklist": [
                "Defined Metrics (numeric time-series aggregates)",
                "Defined Logs (discrete contextual timestamped events)",
                "Defined Traces (request flow through distributed microservices)",
                "Prometheus scrapes and stores metrics; Grafana visualizes all three"
            ]
        },
        {
            "id": "do_8",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Linux Performance & Troubleshooting",
            "question": "A production Linux server reports a high CPU Load Average, but CPU utilization is only 15%. What causes this, and what commands would you run to diagnose it?",
            "reference_answer": "Linux Load Average measures the average number of processes in a RUNNABLE state (using/waiting for CPU) PLUS processes in an UNINTERRUPTIBLE SLEEP state (Task state 'D'), which are usually blocked waiting on disk I/O or network file systems. When CPU utilization is low but load is high, processes are stuck waiting on I/O. Diagnostic steps: 1) Run `top` or `htop` to check `%wa` (I/O wait percentage) and process states (`D` state); 2) Run `vmstat 1` to inspect blocked processes (`b` column); 3) Run `iostat -xz 1` to identify overloaded storage disks with high `%util`; 4) Run `dmesg` to check for hardware or disk controller errors.",
            "checklist": [
                "Explained Load Average includes uninterruptible sleep (D state / I/O wait)",
                "Identified high I/O wait as the root cause rather than CPU compute",
                "Mentioned diagnostic tools: top/htop (%wa, D state)",
                "Mentioned disk inspection tools: vmstat, iostat, dmesg"
            ]
        },
        {
            "id": "do_9",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "GitOps & Version Control",
            "question": "What is GitOps (e.g., using ArgoCD or Flux)? How does it improve security and change management compared to pushing from CI pipelines?",
            "reference_answer": "GitOps uses a Git repository as the single source of truth for declared infrastructure and application state. An in-cluster pull-agent (ArgoCD) continuously reconciles cluster state with the Git repo. Security advantage: CI runners do NOT need cluster admin credentials or open inbound firewall ports (eliminating a prime attack vector if CI is breached). Change management advantage: Every infrastructure change is a versioned Git commit with PR reviews, approval gates, and instant `git revert` rollbacks.",
            "checklist": [
                "Git as the single source of truth for desired cluster state",
                "Pull-based in-cluster agent (ArgoCD) vs push-based CI",
                "Security benefit: CI does not hold production cluster credentials",
                "Change management: PR approvals, audit history, and easy git revert rollbacks"
            ]
        },
        {
            "id": "do_10",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Advanced",
            "topic": "Secrets Management",
            "question": "Why shouldn't secrets (API keys, DB credentials) be stored in Git repositories or plain environment variables? How do HashiCorp Vault or Kubernetes External Secrets solve this?",
            "reference_answer": "Committing secrets to Git leaves an unerasable trail in version history accessible to anyone with repo access, risking leakage. Hardcoding in environment variables exposes them in crash dumps, container inspections (`docker inspect`), and child processes. HashiCorp Vault or Kubernetes External Secrets Operator store secrets in encrypted vaults with strict RBAC, audit logging, automatic rotation, and dynamic credential generation (generating temporary 1-hour DB users on demand), injecting secrets into pods as in-memory files at runtime.",
            "checklist": [
                "Addressed dangers of Git history commits and plain env vars",
                "Vault provides encryption at rest, access control, and audit logs",
                "Highlighted dynamic credentials and automated secret rotation",
                "Mentioned in-memory injection via External Secrets Operator"
            ]
        },
        {
            "id": "do_11",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Beginner",
            "topic": "Networking Basics",
            "question": "Explain the difference between TCP and UDP. Give an example of a DevOps service or protocol that uses each.",
            "reference_answer": "TCP is a connection-oriented protocol that provides reliable, ordered, error-checked delivery of byte streams via a three-way handshake (SYN, SYN-ACK, ACK) and retransmissions. Examples: SSH, HTTP/HTTPS, Git, and database connections. UDP is connectionless and lightweight, transmitting datagrams with minimal overhead and no ordering or retransmission guarantees. Examples: DNS queries, Syslog UDP transport, and metrics collection with StatsD.",
            "checklist": [
                "TCP: Connection-oriented, reliable, ordered, handshake",
                "UDP: Connectionless, fast, no retransmission/ordering overhead",
                "TCP examples: SSH, HTTP, DB connections",
                "UDP examples: DNS, StatsD, Syslog"
            ]
        },
        {
            "id": "do_12",
            "role": "DevOps Engineer",
            "type": "Technical",
            "difficulty": "Intermediate",
            "topic": "Site Reliability & SLAs",
            "question": "What is the difference between SLA, SLO, and SLI in Site Reliability Engineering (SRE)? What is an Error Budget?",
            "reference_answer": "SLI (Service Level Indicator) is a quantifiable metric of service performance (e.g. 99.8% of requests succeed in <200ms). SLO (Service Level Objective) is the internal target agreed upon by engineering (e.g. 99.9% availability over 30 days). SLA (Service Level Agreement) is the legally binding external agreement with customers with financial penalties for breach. An Error Budget is `1 - SLO` (e.g., 0.1% downtime); it balances innovation speed against reliability—when budget is depleted, new feature deployments freeze until reliability recovers.",
            "checklist": [
                "SLI: Measurable metric of performance",
                "SLO: Internal target set by engineering",
                "SLA: External contractual commitment with consequences",
                "Error Budget: (1 - SLO), governing release velocity vs stability"
            ]
        }
    ],

    # ---------------------------------------------------------
    # HR & BEHAVIORAL
    # ---------------------------------------------------------
    "HR": [
        {
            "id": "hr_1",
            "role": "HR",
            "type": "HR",
            "difficulty": "Beginner",
            "topic": "Self-Introduction",
            "question": "Tell me about yourself, your educational background, and why you are interested in this specific role.",
            "reference_answer": "Use the Present-Past-Future framework: 1) Present: Current degree/focus, key skills, and what you build today. 2) Past: Significant projects, internships, or academic milestones that sparked your passion. 3) Future: Why this specific role and team aligns with your career goals, and what tangible value you will bring immediately.",
            "checklist": [
                "Used a structured narrative (Present, Past, Future)",
                "Highlighted practical projects and core technical competencies",
                "Connected background directly to the target role",
                "Conveyed enthusiasm and readiness to contribute"
            ]
        },
        {
            "id": "hr_2",
            "role": "HR",
            "type": "HR",
            "difficulty": "Intermediate",
            "topic": "Conflict Resolution (STAR)",
            "question": "Describe a time when you had a disagreement with a team member or project partner on a technical decision. How did you handle it?",
            "reference_answer": "Structure using STAR (Situation, Task, Action, Result). Focus on objective criteria: listening to the partner's rationale, focusing on project requirements and benchmarks rather than personal opinions, proposing a quick prototype or data-driven comparison, and maintaining a respectful, collaborative relationship that delivered a successful outcome.",
            "checklist": [
                "Followed STAR method clearly",
                "Focused on objective criteria/data rather than emotional arguments",
                "Demonstrated active listening and willingness to compromise",
                "Shared a positive, productive project outcome"
            ]
        },
        {
            "id": "hr_3",
            "role": "HR",
            "type": "HR",
            "difficulty": "Intermediate",
            "topic": "Handling Failure",
            "question": "Tell me about a time a project didn't go as planned or you made a significant mistake. What did you learn?",
            "reference_answer": "Pick a genuine professional or academic mistake where you took ownership. Explain: 1) What went wrong; 2) Immediate mitigation steps taken; 3) Root cause analysis; 4) Systemic prevention measures established (e.g. automated tests, checklists, peer reviews) to ensure the mistake could never repeat.",
            "checklist": [
                "Took direct personal ownership without deflecting blame to others",
                "Described immediate containment actions",
                "Articulated lessons learned",
                "Explained preventive changes implemented for future projects"
            ]
        },
        {
            "id": "hr_4",
            "role": "HR",
            "type": "HR",
            "difficulty": "Beginner",
            "topic": "Strengths & Weaknesses",
            "question": "What do you consider your greatest technical strength, and what is an area you are actively working to improve?",
            "reference_answer": "For strength: highlight a technical capability backed by a real project example (e.g. system design, rapid prototyping, debugging). For weakness: choose a genuine, non-fatal professional area (e.g. public speaking, over-engineering early solutions, unfamiliarity with a specific cloud tool), and emphasize the proactive steps you are currently taking (courses, practice, mentorship) to improve it.",
            "checklist": [
                "Provided a concrete, evidenced strength",
                "Chose an honest, improvable weakness (avoided cliches like 'I'm a perfectionist')",
                "Demonstrated active self-improvement efforts (courses, daily practice)",
                "Showed self-awareness and growth mindset"
            ]
        },
        {
            "id": "hr_5",
            "role": "HR",
            "type": "HR",
            "difficulty": "Intermediate",
            "topic": "Working Under Pressure & Deadlines",
            "question": "How do you prioritize your work when faced with multiple competing deadlines and tight schedules?",
            "reference_answer": "Explain a clear prioritization framework (e.g., Eisenhower Matrix or MoSCoW method: Must have, Should have, Could have). Detail how you communicate early with stakeholders to manage expectations, break large tasks into smaller daily milestones, eliminate low-impact distractions, and maintain code quality even when working under time constraints.",
            "checklist": [
                "Referenced a prioritization framework (e.g. MoSCoW, Impact vs Effort)",
                "Emphasized proactive communication with managers/team",
                "Discussed breaking complex workloads into manageable milestones",
                "Maintained focus on quality and avoiding burnout"
            ]
        },
        {
            "id": "hr_6",
            "role": "HR",
            "type": "HR",
            "difficulty": "Beginner",
            "topic": "Career Goals",
            "question": "Where do you see yourself in 3 to 5 years, and how does this entry-level/placement role help you get there?",
            "reference_answer": "Express realistic ambition focused on skill mastery and value delivery: First 1-2 years: mastering the tech stack, becoming a dependable, autonomous team contributor. Years 3-5: taking ownership of architecture decisions, mentoring junior developers, and contributing to high-impact product features. Align this progression with opportunities available in the company.",
            "checklist": [
                "Grounded near-term goals in mastering fundamentals and reliable delivery",
                "Articulated longer-term growth (leadership, architecture, mentoring)",
                "Aligned aspirations with the company's trajectory",
                "Demonstrated commitment to continuous learning"
            ]
        },
        {
            "id": "hr_7",
            "role": "HR",
            "type": "HR",
            "difficulty": "Intermediate",
            "topic": "Adaptability & Learning New Tech",
            "question": "Technology evolves rapidly. Give an example of how you picked up a new programming language, framework, or tool from scratch under a deadline.",
            "reference_answer": "Describe your learning methodology: 1) Reading official documentation and core concepts rather than passive video watching; 2) Building a small proof-of-concept prototype; 3) Understanding idiomatic best practices; 4) Integrating it successfully into the project. Provide a concrete example and timeline.",
            "checklist": [
                "Described a structured self-directed learning approach",
                "Emphasized hands-on prototyping and official documentation",
                "Highlighted speed of acquisition and practical application",
                "Shared a successful completed deliverable"
            ]
        },
        {
            "id": "hr_8",
            "role": "HR",
            "type": "HR",
            "difficulty": "Intermediate",
            "topic": "Cross-Functional Collaboration",
            "question": "How do you communicate complex technical concepts or trade-offs to non-technical stakeholders (e.g., product managers, designers, or marketing teams)?",
            "reference_answer": "Focus on business impact, analogies, and user experience rather than jargon. Explain trade-offs in terms of time-to-market, cost, and risk. Use visual diagrams or wireframes to align understanding. Confirm alignment by asking clarifying questions and ensuring everyone shares the same definition of success.",
            "checklist": [
                "Avoided unnecessary technical jargon",
                "Framed decisions around business metrics and user impact",
                "Used visual aids, analogies, or prototypes",
                "Verified shared understanding proactively"
            ]
        },
        {
            "id": "hr_9",
            "role": "HR",
            "type": "HR",
            "difficulty": "Beginner",
            "topic": "Company & Role Motivation",
            "question": "Why do you want to join our organization rather than our competitors?",
            "reference_answer": "Demonstrate that you have researched the company: mention specific products, engineering culture, open-source contributions, or mission. Connect how your values and career ambitions align with their challenges, and explain what unique perspective or energy you bring.",
            "checklist": [
                "Referenced specific company achievements, products, or culture",
                "Differentiated from generic competitors",
                "Connected personal values with the company mission",
                "Demonstrated genuine enthusiasm"
            ]
        },
        {
            "id": "hr_10",
            "role": "HR",
            "type": "HR",
            "difficulty": "Intermediate",
            "topic": "Leadership & Initiative",
            "question": "Tell me about a time you showed initiative or leadership without holding an official leadership title.",
            "reference_answer": "Use STAR format: Describe identifying an overlooked problem (e.g. lack of documentation, repetitive manual testing, a broken build pipeline, or team onboarding friction). Explain how you volunteered to fix it, rallied peers around the solution, documented the workflow, and delivered measurable improvements in team productivity.",
            "checklist": [
                "Proactively identified an unassigned problem or process bottleneck",
                "Took independent initiative without waiting for orders",
                "Collaborated with and influenced teammates positively",
                "Delivered measurable productivity or quality improvement"
            ]
        },
        {
            "id": "hr_11",
            "role": "HR",
            "type": "HR",
            "difficulty": "Beginner",
            "topic": "Feedback & Criticism",
            "question": "How do you handle critical feedback or a harsh code review from a senior developer or lead?",
            "reference_answer": "Separate personal ego from code quality. View code reviews as free mentorship opportunities. Thank the reviewer for their time, seek clarification on feedback that isn't clear, ask about the underlying principles or performance implications, implement the recommended changes, and incorporate the learnings into your standard checklist.",
            "checklist": [
                "Demonstrated low ego and high coachability",
                "Viewed feedback as an opportunity for skill growth",
                "Described seeking clarification objectively without defensiveness",
                "Incorporated feedback into ongoing personal development"
            ]
        },
        {
            "id": "hr_12",
            "role": "HR",
            "type": "HR",
            "difficulty": "Advanced",
            "topic": "Ethical Dilemmas & Integrity",
            "question": "What would you do if your manager asked you to cut corners on security, test coverage, or data privacy to meet an aggressive release deadline?",
            "reference_answer": "Acknowledge the business urgency, but calmly explain the risks and long-term costs of technical debt, data breaches, or compliance violations. Propose a collaborative middle ground: cut non-essential features (scope reduction) rather than security/privacy controls, or document the explicit risk and schedule immediate remediation in the very next sprint.",
            "checklist": [
                "Held firm on critical ethics, security, and user privacy",
                "Articulated business consequences of shortcuts professionally",
                "Offered constructive alternatives (scope reduction rather than quality reduction)",
                "Showed integrity and loyalty to long-term organization health"
            ]
        },
        {
            "id": "hr_13",
            "role": "HR",
            "type": "HR",
            "difficulty": "Beginner",
            "topic": "Teamwork & Inclusion",
            "question": "What does a good team environment look like to you, and how do you contribute to an inclusive culture?",
            "reference_answer": "A great team fosters psychological safety where everyone feels comfortable asking questions, proposing ideas, and admitting mistakes without fear of ridicule. I contribute by actively listening to quieter teammates, offering constructive recognition for others' work, sharing credit, and maintaining approachable, positive communication.",
            "checklist": [
                "Emphasized psychological safety and open communication",
                "Highlighted inclusive practices (encouraging quieter voices)",
                "Mentioned shared credit and peer recognition",
                "Valued diverse perspectives in problem-solving"
            ]
        },
        {
            "id": "hr_14",
            "role": "HR",
            "type": "HR",
            "difficulty": "Intermediate",
            "topic": "Problem-Solving Mindset",
            "question": "When debugging a mysterious or intermittent bug that you cannot easily reproduce, what is your systematic troubleshooting process?",
            "reference_answer": "1) Gather data: check application logs, metrics, user environment details. 2) Formulate hypotheses: isolate variables by creating a minimal reproducible test case. 3) Binary search / git bisect: find the exact commit or boundary where the behavior changes. 4) Validate fixes: write a regression test that fails before the fix and passes after. 5) Document the root cause for the team.",
            "checklist": [
                "Systematic, hypothesis-driven debugging rather than random guesswork",
                "Examined logs, metrics, and environment discrepancies",
                "Created minimal reproducible scenario or used git bisect",
                "Wrote automated regression tests to prevent recurrence"
            ]
        },
        {
            "id": "hr_15",
            "role": "HR",
            "type": "HR",
            "difficulty": "Beginner",
            "topic": "Closing Questions for Interviewer",
            "question": "Do you have any questions for us regarding the team, technology, or company culture?",
            "reference_answer": "Always prepare insightful questions: 1) 'What does success look like in the first 90 days for someone joining this role?' 2) 'How does the engineering team handle technical debt and continuous learning?' 3) 'What has been the most exciting engineering challenge the team tackled recently?'",
            "checklist": [
                "Asked thoughtful, role-specific questions",
                "Inquired about success metrics (e.g. 90-day expectations)",
                "Inquired about engineering culture or team challenges",
                "Showed genuine interest in the company's future"
            ]
        }
    ]
}

def get_questions_for_session(role: str, interview_type: str, difficulty: str, count: int) -> List[Dict[str, Any]]:
    """
    Selects balanced questions without repetition.
    Matches role and difficulty, with graceful fallback.
    """
    selected_pool = []
    
    if interview_type == "HR":
        selected_pool = list(QUESTION_BANK.get("HR", []))
    else:
        role_questions = QUESTION_BANK.get(role, [])
        if not role_questions:
            # Fallback to general tech
            role_questions = QUESTION_BANK.get("Full Stack Developer", [])
        
        # Sort/filter by difficulty preference if possible
        diff_matched = [q for q in role_questions if q.get("difficulty") == difficulty]
        others = [q for q in role_questions if q.get("difficulty") != difficulty]
        
        selected_pool = diff_matched + others

    # Return up to `count` items, without duplicates
    result = selected_pool[:min(count, len(selected_pool))]
    return result
