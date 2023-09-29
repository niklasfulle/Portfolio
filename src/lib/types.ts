import { DefaultSession } from "next-auth";
import { links } from "./data";

export type SectionName = (typeof links)[number]["name"];

export type AbouteMeType = {
  id: string;
  text: string | null;
  visible: boolean;
  series: number;
};

export type ProjectType = {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  tags: string;
  visible: boolean;
  series: number;
};

export type SkillType = {
  id: string;
  name: string;
  image: string | null;
  type: string | null;
  visible: boolean;
  series: number;
};

export type ExperienceType = {
  id: string;
  title: string;
  location: string;
  description: string;
  icon: string;
  date: string;
  visible: boolean;
  series: number;
};

export type ExperienceReducedType = {
  id?: string;
  date: string;
  title: string;
  location: string;
  description: string;
  icon: string;
};

export type ContactEmailType = {
  id: string;
  email: string;
};

export type SessionType = {
  user: {
    id: string,
    role: string,
    provider: string,
    image: string,
  } & DefaultSession
}