import { Space, Prompt, User } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Builder',
  email: 'alex@promptos.ai',
  avatar: 'https://picsum.photos/200',
};

export const INITIAL_SPACES: Space[] = [
  {
    id: 's1',
    name: 'Personal Brain',
    type: 'PRIVATE',
    description: 'My private collection of thoughts and drafts.',
    memberCount: 1,
    promptCount: 12,
    role: 'OWNER',
    icon: 'Brain',
    color: 'text-neon-blue'
  },
  {
    id: 's2',
    name: 'Marketing Team',
    type: 'TEAM',
    description: 'Campaign copy, social posts, and email flows.',
    joinCode: 'MKT2024',
    memberCount: 8,
    promptCount: 45,
    role: 'ADMIN',
    icon: 'Briefcase',
    color: 'text-neon-purple'
  },
  {
    id: 's3',
    name: 'Dev Utilities',
    type: 'PUBLIC',
    description: 'Code generation, refactoring, and documentation helpers.',
    memberCount: 1240,
    promptCount: 89,
    role: 'MEMBER',
    icon: 'Code',
    color: 'text-neon-green'
  }
];

export const INITIAL_PROMPTS: Prompt[] = [
  {
    id: 'p1',
    title: 'React Component Generator',
    content: 'Act as a senior React engineer. Create a functional component using TypeScript and Tailwind CSS for a [COMPONENT_NAME]. Ensure accessibility compliance and clean code.',
    description: 'Generates clean, production-ready React components.',
    tags: ['coding', 'react', 'frontend'],
    spaceId: 's3',
    authorId: 'u1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isFavorite: true,
    version: 1,
    variables: ['COMPONENT_NAME']
  },
  {
    id: 'p2',
    title: 'Cold Email Outreach',
    content: 'Write a cold email to a potential client offering SEO services. Keep it under 150 words, focus on pain points, and include a clear CTA.',
    description: 'High conversion cold email template.',
    tags: ['marketing', 'email', 'sales'],
    spaceId: 's2',
    authorId: 'u2',
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now(),
    isFavorite: false,
    version: 2
  },
    {
    id: 'p3',
    title: 'Midjourney Photorealistic',
    content: 'Cinematic shot of [SUBJECT], 8k resolution, photorealistic, depth of field, volumetric lighting, shot on Sony A7R IV --ar 16:9 --v 6.0',
    description: 'Base template for realistic AI photography.',
    tags: ['art', 'image-gen', 'midjourney'],
    spaceId: 's1',
    authorId: 'u1',
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now(),
    isFavorite: true,
    version: 1,
    variables: ['SUBJECT']
  }
];
