import type { ArtworkKind } from '../components/projects/artwork/types'

/**
 * Every project shown in "Selected work" and its case-study view.
 *
 * - Order here is the order on the page; layouts cycle wide → large → tall → split.
 * - To use real screenshots, add `cover` (replaces the illustration everywhere)
 *   and `gallery` images. Put files in `public/projects/` and reference them as
 *   `/projects/name.jpg`.
 */

export interface ProjectImage {
  src: string
  alt: string
  caption?: string
}

export interface ProjectNote {
  title: string
  body: string
}

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  /** Used in the URL: `#work/<slug>`. */
  slug: string
  name: string
  category: string
  summary: string
  stack: string[]
  links: {
    /** Source repository. Leave undefined for private or client work. */
    github?: string
    /** Live demo, store listing or marketplace page. */
    live?: string
    /** Extra links shown on the case-study page. */
    related?: ProjectLink[]
  }
  /** Illustrated cover, used until `cover` is set. */
  artwork: ArtworkKind
  cover?: ProjectImage
  gallery: ProjectImage[]
  detail: {
    overview: string
    problem: string
    solution: string
    features: string[]
    implementation: ProjectNote[]
    challenges: ProjectNote[]
  }
}

export const PROJECTS_SECTION = {
  label: 'Selected work',
  title: "Things I've Built.",
  intro:
    'A collection of applications, experiments, and products developed through engineering and creativity.',
}

export const PROJECTS: Project[] = [
  {
    slug: 'car-racing-game',
    name: 'Car Racing Game',
    category: 'Game Development / Mobile',
    summary:
      'A 3D arcade racing game built with React Native and Expo, featuring customizable supercars, multiple tracks, time trials, and local multiplayer over Wi-Fi.',
    stack: ['React Native', 'Expo', 'TypeScript', 'React Three Fiber', 'Matter.js'],
    links: {
      github: 'https://github.com/Animeshmitra08/AonCarRacing',
    },
    artwork: 'racing',
    gallery: [],
    detail: {
      overview:
        'An arcade racing game for mobile that brings a fully 3D racing experience to React Native. Players pick and customize a supercar, choose a track, and race against the clock or against friends on the same Wi-Fi network.',
      problem:
        'Fast, good-looking 3D games are usually built with dedicated game engines. The goal was to see how far a React Native and Expo stack could go: responsive 3D racing, game physics and local multiplayer, all from a single TypeScript codebase.',
      solution:
        'The game renders its 3D world with React Three Fiber inside an Expo app, uses Matter.js for movement and collisions, and connects nearby devices over the local network for head-to-head races. Cars, tracks and game modes are composed from reusable pieces, so new content can be added without reworking the core loop.',
      features: [
        'Customizable supercars',
        'Multiple race tracks',
        'Time-trial mode',
        'Local multiplayer over Wi-Fi',
        'Arcade-style 3D driving',
        'One codebase with React Native and Expo',
      ],
      implementation: [
        {
          title: '3D rendering',
          body: 'Scenes, cars and tracks are declared as React Three Fiber components, keeping the 3D world in the same React model as the rest of the app.',
        },
        {
          title: 'Physics',
          body: 'Matter.js drives vehicle movement and collision detection, and its results are mirrored onto the 3D models every frame.',
        },
        {
          title: 'Local multiplayer',
          body: 'Devices on the same Wi-Fi network exchange race state so players can compete against each other in real time.',
        },
        {
          title: 'Typed game logic',
          body: 'TypeScript models for cars, tracks and race state keep the game logic predictable as features grow.',
        },
      ],
      challenges: [
        {
          title: 'Performance on mobile hardware',
          body: 'Balancing visual detail against a steady frame rate across a wide range of phones.',
        },
        {
          title: 'Keeping races in sync',
          body: 'Making sure every player sees consistent car positions and results despite network latency.',
        },
        {
          title: 'Tuning the handling',
          body: 'Finding arcade handling that feels fast and forgiving with touch controls, rather than strictly realistic.',
        },
      ],
    },
  },
  {
    slug: 'questclash',
    name: 'QuestClash: Puzzle Adventure',
    category: 'Game Development / Interactive Experience',
    summary:
      'A multiplayer puzzle-adventure experience featuring interactive environments, challenging puzzles, hidden clues, traps, and cooperative gameplay.',
    stack: ['React Native', 'Expo', 'TypeScript', 'React Three Fiber'],
    links: {
      github: 'https://github.com/Animeshmitra08/QuestClash',
      related: [
        { label: 'Server repository', href: 'https://github.com/Animeshmitra08/QuestClashServer' },
      ],
    },
    artwork: 'quest',
    gallery: [],
    detail: {
      overview:
        'QuestClash is a multiplayer puzzle-adventure where players explore interactive environments together, uncover hidden clues, avoid traps and cooperate to solve challenging puzzles.',
      problem:
        'Most mobile puzzle games are single-player and screen-based. QuestClash set out to create a shared, explorable 3D space where solving a puzzle depends on players communicating and working together.',
      solution:
        'Environments are built as interactive 3D scenes with React Three Fiber. Puzzle elements, clues and traps react to player actions, and shared game state keeps every player’s view of the world consistent during cooperative play.',
      features: [
        'Multiplayer, cooperative gameplay',
        'Interactive 3D environments',
        'Challenging puzzles',
        'Hidden clues to discover',
        'Traps and hazards',
        'Atmospheric, cinematic visuals',
      ],
      implementation: [
        {
          title: 'Interactive scenes',
          body: 'Levels are composed from reusable React Three Fiber components (structures, puzzle pieces, triggers and traps), so new areas can be assembled from existing parts.',
        },
        {
          title: 'Shared game state',
          body: 'Puzzle progress, discovered clues and trap states are shared between players so the world stays consistent for the whole team.',
        },
        {
          title: 'Typed game logic',
          body: 'TypeScript describes puzzles, clues and player actions, making complex interactions easier to reason about and extend.',
        },
      ],
      challenges: [
        {
          title: 'Consistent puzzle state',
          body: 'Keeping puzzles, clues and traps in the same state for every player during cooperative play.',
        },
        {
          title: 'Hidden, but discoverable',
          body: 'Designing clues that reward exploration without leaving players stuck.',
        },
        {
          title: 'Atmosphere on mobile',
          body: 'Creating moody, cinematic environments that still run smoothly on mobile devices.',
        },
      ],
    },
  },
  {
    slug: 'rn-developer-toolkit',
    name: 'RN Developer Toolkit',
    category: 'Developer Tools / Open Source',
    summary:
      'A Visual Studio Code extension designed to improve React Native development workflows through project analysis, Expo commands, and automated component and screen generation.',
    stack: ['TypeScript', 'VS Code API', 'Node.js', 'npm'],
    links: {
      github: 'https://github.com/Animeshmitra08/RNDeveloperToolkit',
    },
    artwork: 'toolkit',
    gallery: [],
    detail: {
      overview:
        'A Visual Studio Code extension for React Native developers. It analyses the current project, runs common Expo commands from inside the editor, and generates components and screens, so routine work stays in one place.',
      problem:
        'React Native development involves a lot of repetitive work: switching to the terminal for Expo commands, writing the same component and screen boilerplate, and keeping track of how a project is structured.',
      solution:
        'The extension brings these tasks into VS Code. It inspects the project to understand its setup, exposes Expo commands through the editor, and scaffolds new components and screens that follow the project’s structure.',
      features: [
        'Project analysis',
        'Expo commands from the editor',
        'Automated component generation',
        'Automated screen generation',
        'Runs from the VS Code command palette',
        'Open source',
      ],
      implementation: [
        {
          title: 'VS Code API',
          body: 'Commands, prompts and notifications are built on the VS Code extension API, so the toolkit feels native to the editor.',
        },
        {
          title: 'Project analysis',
          body: 'Node.js tooling reads the workspace to understand the project setup before running commands or generating files.',
        },
        {
          title: 'Code generation',
          body: 'Templates produce consistent, typed components and screens, placed where the project expects them.',
        },
        {
          title: 'Packaging',
          body: 'Built and versioned with the npm toolchain, like any other TypeScript package.',
        },
      ],
      challenges: [
        {
          title: 'Many project shapes',
          body: 'React Native projects vary widely, from Expo to bare workflows and different folder conventions, and the toolkit has to handle them gracefully.',
        },
        {
          title: 'Generated code that fits in',
          body: 'Scaffolding needs to match how a project is already written, not impose a new structure.',
        },
        {
          title: 'Staying out of the way',
          body: 'Tools inside the editor should speed developers up without adding noise or extra steps.',
        },
      ],
    },
  },
  {
    slug: 'enterprise-mobile-applications',
    name: 'Enterprise Mobile Applications',
    category: 'Enterprise Software / Mobile Development',
    summary:
      'Business-focused mobile applications with dynamic workflows, REST API integrations, real-time vehicle tracking, and configurable enterprise processes.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Axios', 'Firebase', 'REST APIs'],
    // Client work: no public repository.
    links: {},
    artwork: 'enterprise',
    gallery: [],
    detail: {
      overview:
        'Business-focused mobile applications for operational teams, combining dynamic workflows, REST API integrations, real-time vehicle tracking and configurable enterprise processes.',
      problem:
        'Operational processes change often and differ between teams. Hard-coding each workflow into a mobile app makes every change slow and expensive to ship.',
      solution:
        'The apps render workflows dynamically from configuration managed on the web, integrate with existing back-end systems through REST APIs, and add real-time vehicle tracking for field operations.',
      features: [
        'Dynamic, configurable workflows',
        'REST API integrations',
        'Real-time vehicle tracking',
        'Location-based functionality',
        'Firebase integration',
        'Android and iOS releases',
      ],
      implementation: [
        {
          title: 'Configuration-driven UI',
          body: 'Screens and steps are generated from workflow definitions configured on the web, so processes can change without rebuilding the app.',
        },
        {
          title: 'API layer',
          body: 'A typed Axios client handles communication with REST services across the application.',
        },
        {
          title: 'Tracking',
          body: 'Location services provide real-time vehicle positions for tracking and location-based features.',
        },
        {
          title: 'Delivery',
          body: 'Builds and releases are managed for both Android and iOS.',
        },
      ],
      challenges: [
        {
          title: 'Flexibility versus reliability',
          body: 'Supporting configurable processes while keeping every workflow predictable.',
        },
        {
          title: 'Real-time location',
          body: 'Balancing tracking update frequency with battery life and data usage.',
        },
        {
          title: 'Integrating existing systems',
          body: 'Working with established enterprise APIs and data formats.',
        },
      ],
    },
  },
]
