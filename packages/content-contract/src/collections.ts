import type {
  CollectionSlug,
  ContentStatus,
  Lang,
  KnowledgeArea,
  KnowledgeLevel,
  ResourceType,
  TimelineKind,
} from './enums';
import type { Block } from './blocks';

export interface CommonFields {
  title: string;
  description: string;
  lang: Lang;
  translationKey: string;
  slug: string;
  tags: string[];
  status: ContentStatus;
  featured: boolean;
  date?: string;
  updated?: string;
}

export interface PostFields extends CommonFields {
  category: string;
  series?: string;
  contentBlocks?: Block[];
}

export interface PodcastFields extends CommonFields {
  episode: number;
  season: number;
  audio: string;
  duration?: string;
  cover?: string;
  transcript: boolean;
  hosts: string[];
  guests: string[];
  timeline: { time: string; label: string }[];
  resources: { label: string; url: string; note?: string }[];
}

export interface KnowledgeFields extends CommonFields {
  area: KnowledgeArea;
  level: KnowledgeLevel;
  order?: number;
  contentBlocks?: Block[];
}

export interface TopicFields extends CommonFields {
  items: string[];
  hero?: string;
}

export interface ProjectFields extends CommonFields {
  role?: string;
  stack: string[];
  links: { label: string; url: string }[];
}

export interface ResourceFields extends CommonFields {
  type: ResourceType;
  url?: string;
}

export interface GlossaryFields extends CommonFields {
  aliases: string[];
}

export interface TimelineFields extends CommonFields {
  kind: TimelineKind;
}

export type CollectionFields = {
  posts: PostFields;
  podcast: PodcastFields;
  knowledge: KnowledgeFields;
  topics: TopicFields;
  projects: ProjectFields;
  resources: ResourceFields;
  glossary: GlossaryFields;
  timeline: TimelineFields;
};

export type FieldsFor<C extends CollectionSlug> = CollectionFields[C];
