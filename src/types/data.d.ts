type AbouteMe = {
  id: string;
  text: string | null;
  visible: boolean;
  series: number;
};

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  tags: string;
  visible: boolean;
  series: number;
};

type Skill = {
  id: string;
  name: string;
  image: string | null;
  type: string | null;
  visible: boolean;
  series: number;
};

type Experience = {
  id: string;
  title: string;
  location: string;
  description: string;
  icon: string;
  date: string;
  visible: boolean;
  series: number;
};

type ExperienceReduced = {
  id?: string;
  date: string;
  title: string;
  location: string;
  description: string;
  icon: string;
};

type ContactEmail = {
  id: string;
  email: string;
};

type Session = {
  user: {
    id: string,
    role: string,
    provider: string,
  } & DefaultSession
}