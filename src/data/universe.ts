/**
 * ETERNUM — Universe Content Model
 * ================================
 * The ENTIRE site is generated from this file. You can edit it by hand, OR use
 * the Admin Command Center (visit /admin) which writes overrides to
 * localStorage that are applied on load (see applyOverrides() at the bottom).
 */

export type Vec3 = [number, number, number]

export type EntityKind =
  | 'project'
  | 'skill'
  | 'milestone'
  | 'chapter'
  | 'experiment'
  | 'future'

export interface Entity {
  id: string
  name: string
  kind: EntityKind
  tagline: string
  body: string
  year?: string
  status?: string
  tech?: string[]
  metrics?: { label: string; value: string }[]
  links?: { label: string; url: string }[]
  weight?: number
}

export interface GalaxyNode {
  id: string
  name: string
  essence: string
  lore: string
  color: string
  orbitRadius: number
  orbitSpeed: number
  orbitPhase: number
  inclination: number
  scale: number
  starCount: number
  connections: string[]
  tags: string[]
  entities: Entity[]
}

export interface Identity {
  name: string
  handle: string
  role: string
  tagline: string
  location: string
  available: boolean
  email: string
  resumeUrl?: string
  creed: string
  color: string
  socials: { label: string; url: string }[]
  bio: string
}

export interface UniverseConfig {
  identity: Identity
  galaxies: GalaxyNode[]
}

export interface MemoryItem {
  id: string
  title: string
  caption: string
  year?: string
  color: string
  image?: string
}

/* ───────────────────────────── IDENTITY ───────────────────────────── */

export const IDENTITY: Identity = {
  name: 'J. Don Gabriel',
  handle: 'don-gabriel',
  role: 'Full-Stack Developer · CSE Undergrad · Builder',
  tagline: 'I build systems that feel impossible.',
  location: 'Kanyakumari, Tamil Nadu, India · open to remote',
  available: true,
  email: 'dongabriel.jrks@gmail.com',
  resumeUrl: '/resume.pdf',
  creed: 'Discipline becomes consistency. Consistency becomes creation.',
  color: '#ffe4a8',
  socials: [
    { label: 'GitHub', url: 'https://github.com/Don-Gabriel' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/j-don-gabriel-a91765293' },
    { label: 'LeetCode', url: 'https://leetcode.com/' },
    { label: 'Email', url: 'mailto:dongabriel.jrks@gmail.com' },
  ],
  bio: 'Computer Science engineering undergrad and full-stack builder from Kanyakumari. I ship across the whole stack — web, mobile (Flutter), machine learning and IoT. First place at the 3LC Data-Centric AI Hackathon (0.96790), 88+ problems on LeetCode, and a habit of taking ideas from blank file to running system. This universe is the map of how I got here, and where I am going.',
}

/* ───────────────────────────── GALAXIES ───────────────────────────── */

export const UNIVERSE: UniverseConfig = {
  identity: IDENTITY,
  galaxies: [
    {
      id: 'projects',
      name: 'Projects',
      essence: 'The Constellations',
      lore: 'Each project lit its own star system — its own physics and purpose. Networking, mobile, machine learning, embedded systems. Nothing here was theoretical; each one was built to actually run.',
      color: '#ffb45e',
      orbitRadius: 11,
      orbitSpeed: -0.05,
      orbitPhase: 1.7,
      inclination: -0.16,
      scale: 1.45,
      starCount: 2400,
      connections: ['knowledge', 'achievements', 'experience'],
      tags: ['Full-stack', 'Mobile', 'ML', 'IoT'],
      entities: [
        {
          id: 'lanshare',
          name: 'LanShare',
          kind: 'project',
          tagline: 'Cross-platform file sharing over the local network.',
          body: 'A cross-platform file-sharing app — Android-to-Android, PC-to-PC and cross-device — over local networks. Reliable peer-to-peer transfer via TCP sockets, SHA-256 verification for integrity, and automated device discovery, transfer monitoring and connection management.',
          status: 'Shipped',
          weight: 1,
          tech: ['Flutter', 'Dart', 'TCP Sockets', 'SHA-256'],
          metrics: [
            { label: 'Transfer', value: 'P2P over LAN' },
            { label: 'Integrity', value: 'SHA-256 verified' },
            { label: 'Targets', value: 'Android · PC · cross' },
          ],
          links: [{ label: 'GitHub', url: 'https://github.com/Don-Gabriel' }],
        },
        {
          id: 'bond',
          name: 'Bond',
          kind: 'project',
          tagline: 'Real-time messaging, built on Firebase.',
          body: 'A real-time communication platform with user authentication and instant messaging. Firebase powers data sync and the backend; reusable UI components keep the experience consistent and responsive across screens.',
          status: 'Shipped',
          weight: 0.85,
          tech: ['Flutter', 'Firebase', 'Auth', 'Realtime'],
          metrics: [
            { label: 'Sync', value: 'Realtime (Firebase)' },
            { label: 'Auth', value: 'User accounts' },
          ],
          links: [{ label: 'GitHub', url: 'https://github.com/Don-Gabriel' }],
        },
        {
          id: 'voting',
          name: 'College Voting',
          kind: 'project',
          tagline: 'A digital election platform for campus.',
          body: 'A web voting platform to streamline campus elections. Authentication and vote-validation keep elections honest; a MySQL-backed admin system manages candidates and records, with dedicated interfaces for both administrators and voters.',
          status: 'Shipped',
          weight: 0.8,
          tech: ['PHP', 'MySQL', 'JavaScript'],
          metrics: [
            { label: 'Roles', value: 'Admin + Voter' },
            { label: 'Integrity', value: 'Vote validation' },
          ],
          links: [{ label: 'GitHub', url: 'https://github.com/Don-Gabriel' }],
        },
        {
          id: 'soundml',
          name: 'Sound Recognition ML',
          kind: 'project',
          tagline: 'Teaching machines to recognise sound.',
          body: 'Machine-learning models for audio classification and sound recognition. Dataset preparation, model evaluation and performance analysis, trained and deployed via Edge Impulse — an exploration of embedded AI for real-time audio.',
          status: 'Built',
          weight: 0.8,
          tech: ['Python', 'Edge Impulse', 'ML', 'Kaggle'],
          metrics: [{ label: 'Domain', value: 'Embedded audio AI' }],
        },
        {
          id: 'gesturecar',
          name: 'Gesture-Controlled Car',
          kind: 'project',
          tagline: 'Drive with your hand, wirelessly.',
          body: 'A gesture-driven robotic vehicle. Sensor-based input translates hand movements into navigation commands through embedded control logic, with wireless communication for remote operation.',
          status: 'Built',
          weight: 0.7,
          tech: ['IoT', 'Embedded', 'Sensors', 'Wireless'],
        },
        {
          id: 'wheelchair',
          name: 'Voice & Joystick Wheelchair',
          kind: 'project',
          tagline: 'Assistive mobility, two ways to drive.',
          body: 'An assistive-mobility prototype supporting both voice and joystick control. Combining multiple input methods improves accessibility and usability, with efficient command processing for movement and navigation.',
          status: 'Built',
          weight: 0.75,
          tech: ['IoT', 'Embedded', 'Accessibility', 'Voice'],
        },
      ],
    },
    {
      id: 'memory',
      name: 'Memory',
      essence: 'The Realms',
      lore: 'Memories are not records here — they are places you can step inside. Add your own; they become real.',
      color: '#c9a0ff',
      orbitRadius: 13.5,
      orbitSpeed: 0.045,
      orbitPhase: 5.0,
      inclination: 0.28,
      scale: 1.15,
      starCount: 1600,
      connections: ['achievements', 'legacy'],
      tags: ['Moments', 'Places', 'Time'],
      entities: [],
    },
    {
      id: 'knowledge',
      name: 'Knowledge',
      essence: 'The Ocean',
      lore: 'Fields became oceans; concepts became currents. Languages, frameworks, databases and the fundamentals underneath them — each a tide that still moves the others.',
      color: '#5ec8ff',
      orbitRadius: 16,
      orbitSpeed: 0.04,
      orbitPhase: 0,
      inclination: 0.14,
      scale: 1.25,
      starCount: 2000,
      connections: ['projects', 'research'],
      tags: ['Languages', 'Mobile', 'Web', 'Data'],
      entities: [
        {
          id: 'languages',
          name: 'Languages',
          kind: 'skill',
          tagline: 'The grammar of machines.',
          body: 'C, Java, Python, JavaScript and PHP — fluent enough to pick the right one for the problem and make the language disappear.',
          weight: 1,
          tech: ['C', 'Java', 'Python', 'JavaScript', 'PHP'],
        },
        {
          id: 'mobile',
          name: 'Mobile',
          kind: 'skill',
          tagline: 'One codebase, every pocket.',
          body: 'Cross-platform mobile development with Flutter and React Native, shipped and tested with Expo Go.',
          weight: 0.85,
          tech: ['Flutter', 'React Native', 'Expo Go', 'Dart'],
        },
        {
          id: 'web',
          name: 'Web',
          kind: 'skill',
          tagline: 'The interface to everything.',
          body: 'Frontend with HTML, CSS and React — plus the full-stack glue that connects it to real backends.',
          weight: 0.9,
          tech: ['HTML', 'CSS', 'React', 'Full-Stack'],
        },
        {
          id: 'data',
          name: 'Databases',
          kind: 'skill',
          tagline: 'Where state lives.',
          body: 'Relational and realtime: MySQL, Oracle, Firebase and Supabase — schema design through to live sync.',
          weight: 0.85,
          tech: ['MySQL', 'Oracle', 'Firebase', 'Supabase'],
        },
        {
          id: 'core',
          name: 'Fundamentals',
          kind: 'skill',
          tagline: 'The bedrock under the buzzwords.',
          body: 'Data structures & algorithms, OOP, DBMS, computer networks, plus machine learning and IoT — the foundations everything is built on.',
          weight: 0.95,
          tech: ['DSA', 'OOP', 'DBMS', 'Networks', 'ML', 'IoT'],
        },
      ],
    },
    {
      id: 'achievements',
      name: 'Achievements',
      essence: 'The Ascension',
      lore: 'Scale proportional to impact. The rarest become stars. Each is a fossil of a moment the work was seen.',
      color: '#ffd95e',
      orbitRadius: 21,
      orbitSpeed: 0.032,
      orbitPhase: 3.2,
      inclination: 0.22,
      scale: 1.2,
      starCount: 1700,
      connections: ['projects', 'education'],
      tags: ['Recognition', 'Impact'],
      entities: [
        {
          id: '3lc',
          name: '3LC Hackathon — 1st Place',
          kind: 'milestone',
          tagline: 'Data-Centric AI, model score 0.96790.',
          body: 'Secured First Place in the 3LC Data-Centric AI Hackathon with a model score of 0.96790 — a win earned on the quality of the data and the model, head-to-head against the field.',
          status: 'Won',
          weight: 1,
          metrics: [
            { label: 'Result', value: '1st place' },
            { label: 'Score', value: '0.96790' },
          ],
        },
        {
          id: 'leetcode',
          name: '88+ on LeetCode',
          kind: 'milestone',
          tagline: 'Algorithms, practised relentlessly.',
          body: 'Solved 88+ problems across Arrays, Strings, Binary Search, Dynamic Programming, Trees, Hash Tables and Backtracking — sharpening the problem-solving that every project rests on.',
          weight: 0.8,
          metrics: [{ label: 'Solved', value: '88+' }],
          links: [{ label: 'LeetCode', url: 'https://leetcode.com/' }],
        },
        {
          id: 'hackathons',
          name: 'Hackathon Veteran',
          kind: 'milestone',
          tagline: '24-hour sprints, repeatedly.',
          body: 'Participated in multiple 24-hour hackathons centred on AI and software development — and shipped working things under the clock.',
          weight: 0.7,
        },
        {
          id: 'multidomain',
          name: 'Multi-Domain Builder',
          kind: 'milestone',
          tagline: 'Networking, mobile, ML, embedded.',
          body: 'Independently delivered projects across networking, mobile development, machine learning and embedded systems — rare range for an undergrad.',
          weight: 0.75,
        },
      ],
    },
    {
      id: 'education',
      name: 'Education',
      essence: 'The Empire',
      lore: 'Civilization evolution: formal foundations expanding through relentless self-study into a technological civilization.',
      color: '#9d7bff',
      orbitRadius: 25,
      orbitSpeed: -0.028,
      orbitPhase: 4.9,
      inclination: -0.1,
      scale: 1.1,
      starCount: 1400,
      connections: ['knowledge', 'achievements'],
      tags: ['B.E. CSE', 'CGPA 8.4'],
      entities: [
        {
          id: 'be',
          name: 'B.E. Computer Science',
          kind: 'chapter',
          tagline: 'Government College of Engineering, Tirunelveli.',
          body: 'Bachelor of Engineering in Computer Science & Engineering at Government College of Engineering, Tirunelveli, Tamil Nadu. CGPA 8.4 / 10.0.',
          year: '2024 – 2028',
          weight: 1,
          metrics: [
            { label: 'CGPA', value: '8.4 / 10' },
            { label: 'Years', value: '2024 – 2028' },
          ],
        },
        {
          id: 'coursework',
          name: 'Coursework',
          kind: 'chapter',
          tagline: 'The formal scaffolding.',
          body: 'Data Structures & Algorithms, DBMS, Object-Oriented Programming, Operating Systems, Computer Networks, Artificial Intelligence, Software Engineering and Web Development.',
          weight: 0.8,
          tech: ['DSA', 'DBMS', 'OS', 'AI', 'Software Eng'],
        },
        {
          id: 'certs',
          name: 'Certifications',
          kind: 'chapter',
          tagline: 'Sharpening the edge.',
          body: 'Full Stack Development Course, React Development Training, and Frontend Web Development Fundamentals.',
          weight: 0.6,
        },
      ],
    },
    {
      id: 'experience',
      name: 'Experience',
      essence: 'The Metropolis',
      lore: 'Roles became infrastructure; responsibilities became transport carrying weight across the city.',
      color: '#5effc4',
      orbitRadius: 29,
      orbitSpeed: 0.024,
      orbitPhase: 0.8,
      inclination: 0.15,
      scale: 1.05,
      starCount: 1300,
      connections: ['projects', 'legacy'],
      tags: ['Internship', 'Full-Stack'],
      entities: [
        {
          id: 'novitech',
          name: 'Novitech — Full Stack Intern',
          kind: 'chapter',
          tagline: 'Training into shipping.',
          body: 'Full Stack Development Intern at Novitech. Intensive training in modern web development and software-engineering practices; frontend with React, JavaScript, HTML and CSS; exposure to backend integration, database operations and deployment workflows.',
          year: '11/2025 – Present',
          status: 'Online',
          weight: 1,
          tech: ['React', 'JavaScript', 'HTML', 'CSS'],
        },
      ],
    },
    {
      id: 'research',
      name: 'Research',
      essence: 'The Observatory',
      lore: 'Ideas orbit physically. Each question becomes a celestial body; each experiment a new star.',
      color: '#ff6ec8',
      orbitRadius: 33,
      orbitSpeed: -0.02,
      orbitPhase: 2.4,
      inclination: -0.24,
      scale: 1.0,
      starCount: 1200,
      connections: ['knowledge', 'future'],
      tags: ['AI', 'Embedded', 'IoT'],
      entities: [
        {
          id: 'audioai',
          name: 'Embedded Audio AI',
          kind: 'experiment',
          tagline: 'Sound recognition at the edge.',
          body: 'Training and deploying audio-classification models with Edge Impulse — exploring how machine learning runs on constrained, embedded hardware in real time.',
          weight: 1,
          tech: ['ML', 'Edge Impulse', 'Audio'],
        },
        {
          id: 'assistive',
          name: 'Assistive IoT',
          kind: 'experiment',
          tagline: 'Technology that gives people movement.',
          body: 'Sensor- and voice-driven control systems — the gesture car and the voice/joystick wheelchair — researching how embedded systems can restore autonomy and accessibility.',
          weight: 0.85,
          tech: ['IoT', 'Embedded', 'Accessibility'],
        },
      ],
    },
    {
      id: 'legacy',
      name: 'Legacy',
      essence: 'The Ripple',
      lore: 'Impact propagation made visible: project → users → communities → future influence. What you build keeps moving after you leave the room.',
      color: '#ff8f5e',
      orbitRadius: 37,
      orbitSpeed: 0.017,
      orbitPhase: 5.5,
      inclination: 0.2,
      scale: 1.0,
      starCount: 1100,
      connections: ['experience', 'future'],
      tags: ['Accessibility', 'Open Source'],
      entities: [
        {
          id: 'accessibility',
          name: 'Mobility for Others',
          kind: 'chapter',
          tagline: 'The wheelchair that listens.',
          body: 'The assistive-mobility work is the clearest ripple: tools that hand independence back to the people who use them. That is the kind of impact worth chasing.',
          weight: 1,
        },
        {
          id: 'opensource',
          name: 'In the Open',
          kind: 'chapter',
          tagline: 'Code others can learn from.',
          body: 'Projects shared on GitHub so the next builder has a head start — small contributions to a much larger commons.',
          weight: 0.75,
          links: [{ label: 'GitHub', url: 'https://github.com/Don-Gabriel' }],
        },
      ],
    },
    {
      id: 'future',
      name: 'Future',
      essence: 'The Frontier',
      lore: 'The possibility dimension. Projects not yet built, roles not yet held — luminous, but dim until made real.',
      color: '#7d8bff',
      orbitRadius: 41,
      orbitSpeed: -0.013,
      orbitPhase: 1.1,
      inclination: -0.22,
      scale: 1.3,
      starCount: 1800,
      connections: ['research', 'legacy'],
      tags: ['Ambition', 'Unwritten'],
      entities: [
        {
          id: 'worldengine',
          name: 'The World Engine',
          kind: 'future',
          tagline: 'ETERNUM, fully realized.',
          body: 'The full vision of this very universe: procedural worlds, memory realms you can walk into, a living multiverse. The frontier this whole site points toward.',
          status: 'Unbuilt — luminous',
          weight: 1,
        },
        {
          id: 'next',
          name: 'What comes next',
          kind: 'future',
          tagline: 'The best work is unwritten.',
          body: 'Open to the internships, teams and problems that do not exist yet — somewhere to apply full-stack, ML and a builder’s instinct at real scale.',
          status: 'Open to opportunities',
          weight: 0.85,
        },
      ],
    },
  ],
}

export const MEMORIES: MemoryItem[] = [
  {
    id: 'first-build',
    title: 'The First Build',
    caption: 'The night the first program actually ran. Nothing was the same after.',
    year: 'origin',
    color: '#5ec8ff',
  },
  {
    id: 'hackathon-win',
    title: 'First Place',
    caption: 'The 3LC hackathon result on screen — 0.96790, and our name at the top.',
    year: '2025',
    color: '#ffd95e',
  },
  {
    id: 'shipped',
    title: 'It Works',
    caption: 'The first time a stranger used something I made. Quiet, enormous.',
    year: 'milestone',
    color: '#5effc4',
  },
]

/* ───────────────────────────── helpers ───────────────────────────── */

export const galaxyById = (id: string | null): GalaxyNode | undefined =>
  id ? UNIVERSE.galaxies.find((g) => g.id === id) : undefined

export const entityById = (
  galaxyId: string | null,
  entityId: string | null,
): Entity | undefined => {
  const g = galaxyById(galaxyId)
  return g && entityId ? g.entities.find((e) => e.id === entityId) : undefined
}

/* ──────────────────── Admin overrides (localStorage) ──────────────────── */

export const OVERRIDE_KEY = 'eternum:universe'

export interface UniverseSnapshot {
  identity: Identity
  galaxies: GalaxyNode[]
  memories: MemoryItem[]
}

/** The current full state, for the admin to read/export. */
export const snapshot = (): UniverseSnapshot => ({
  identity: IDENTITY,
  galaxies: UNIVERSE.galaxies,
  memories: MEMORIES,
})

/** Persist + apply a snapshot from the admin. */
export function saveSnapshot(s: UniverseSnapshot) {
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(s))
  } catch {
    /* ignore quota / privacy errors */
  }
  applySnapshot(s)
}

export function clearOverrides() {
  try {
    localStorage.removeItem(OVERRIDE_KEY)
  } catch {
    /* ignore */
  }
}

function applySnapshot(s: UniverseSnapshot) {
  if (s.identity) Object.assign(IDENTITY, s.identity)
  if (Array.isArray(s.galaxies))
    UNIVERSE.galaxies.splice(0, UNIVERSE.galaxies.length, ...s.galaxies)
  if (Array.isArray(s.memories))
    MEMORIES.splice(0, MEMORIES.length, ...s.memories)
}

/** Applied once at module load so every importer sees the edited universe. */
function applyOverrides() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY)
    if (!raw) return
    applySnapshot(JSON.parse(raw) as UniverseSnapshot)
  } catch {
    /* corrupt override — ignore and use defaults */
  }
}

applyOverrides()
