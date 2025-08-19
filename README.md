This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
graph TD
    %% Frontend UI Layer
    subgraph "Frontend UI"
        direction TB
        Browser["Browser"]:::frontend
        HomePage["Home Page\n(src/app/page.tsx)"]:::frontend
        EtabsPage["Établissements Page\n(src/app/etablissements/page.tsx)"]:::frontend
        SeedButton["Seed Button Component\n(src/app/etablissements/seed-button.tsx)"]:::frontend
    end

    %% Backend / Next.js Server
    subgraph "Next.js Server — App Router"
        direction TB
        RoutesDir["Routes Directory\n(src/app/)"]:::api
        APISeed["Seed API Route\n(src/app/api/dev/seed/route.ts)"]:::api
        PrismaClient["Prisma Client\n(src/lib/prisma.ts)"]:::api
    end

    %% Data Layer
    subgraph "Database Layer"
        direction TB
        DBSchema["DB Schema Definition\n(prisma/schema.prisma)"]:::database
        Migrations["Migrations Folder\n(prisma/migrations/)"]:::database
        DatabaseDB["Database"]:::database
    end

    %% Configuration Files
    subgraph "Configuration"
        direction TB
        nextConfig["next.config.ts"]:::config
        tsConfig["tsconfig.json"]:::config
        globalsCSS["Global Stylesheet\n(src/app/globals.css)"]:::config
        Layout["Root Layout\n(src/app/layout.tsx)"]:::config
    end

    %% Connections
    Browser --> HomePage
    HomePage --> Browser
    Browser --> EtabsPage
    EtabsPage --> SeedButton
    SeedButton -->|"calls"| APISeed
    APISeed --> PrismaClient
    PrismaClient --> DatabaseDB
    DatabaseDB -->|responses| APISeed

    %% Prisma to DB Schema & Migrations
    PrismaClient --> DBSchema
    PrismaClient --> Migrations

    %% Routes Directory usage
    RoutesDir --> HomePage
    RoutesDir --> EtabsPage
    RoutesDir --> APISeed

    %% Config dependencies
    nextConfig -.-> RoutesDir
    tsConfig -.-> RoutesDir
    globalsCSS -.-> HomePage
    globalsCSS -.-> EtabsPage
    Layout -.-> HomePage
    Layout -.-> EtabsPage

    %% Click Events
    click HomePage "https://github.com/voicedhealer/envie2sortir/blob/main/src/app/page.tsx"
    click EtabsPage "https://github.com/voicedhealer/envie2sortir/blob/main/src/app/etablissements/page.tsx"
    click SeedButton "https://github.com/voicedhealer/envie2sortir/blob/main/src/app/etablissements/seed-button.tsx"
    click RoutesDir "https://github.com/voicedhealer/envie2sortir/tree/main/src/app/"
    click APISeed "https://github.com/voicedhealer/envie2sortir/blob/main/src/app/api/dev/seed/route.ts"
    click PrismaClient "https://github.com/voicedhealer/envie2sortir/blob/main/src/lib/prisma.ts"
    click DBSchema "https://github.com/voicedhealer/envie2sortir/blob/main/prisma/schema.prisma"
    click Migrations "https://github.com/voicedhealer/envie2sortir/tree/main/prisma/migrations/"
    click nextConfig "https://github.com/voicedhealer/envie2sortir/blob/main/next.config.ts"
    click tsConfig "https://github.com/voicedhealer/envie2sortir/blob/main/tsconfig.json"
    click globalsCSS "https://github.com/voicedhealer/envie2sortir/blob/main/src/app/globals.css"
    click Layout "https://github.com/voicedhealer/envie2sortir/blob/main/src/app/layout.tsx"

    %% Styles
    classDef frontend fill:#E8F1FF,stroke:#0366d6,color:#0366d6
    classDef api fill:#FFEFD8,stroke:#D97706,color:#D97706
    classDef database fill:#E6FFFA,stroke:#059669,color:#059669
    classDef config fill:#F3F4F6,stroke:#4B5563,color:#374151
