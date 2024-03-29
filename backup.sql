--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

-- Started on 2023-09-17 20:04:11 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 21385)
-- Name: AboutMe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AboutMe" (
    id text NOT NULL,
    text text,
    "order" integer DEFAULT 0 NOT NULL,
    visible boolean DEFAULT false NOT NULL
);


ALTER TABLE public."AboutMe" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 21363)
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 21409)
-- Name: Experience; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Experience" (
    id text NOT NULL,
    title text NOT NULL,
    location text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    date text NOT NULL,
    visible boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Experience" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 21392)
-- Name: Projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Projects" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    url text NOT NULL,
    visible boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    tags text NOT NULL
);


ALTER TABLE public."Projects" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 21370)
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    "userRole" text,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 21401)
-- Name: Skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Skills" (
    id text NOT NULL,
    name text NOT NULL,
    image text,
    visible boolean DEFAULT false NOT NULL,
    type text
);


ALTER TABLE public."Skills" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 21377)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    "emailVerified" boolean,
    password text,
    role text DEFAULT 'user'::text NOT NULL,
    image text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 21352)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 3649 (class 0 OID 21385)
-- Dependencies: 218
-- Data for Name: AboutMe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AboutMe" (id, text, "order", visible) FROM stdin;
1	After graduating with a degree in <b>Accounting</b>, I decided to pursue my passion for programming. I enrolled in a coding bootcamp and learned <b>full-stack web development</b>.  <I>My favorite part of programming</I> is the problem-solving aspect. I love the feeling of finally figuring out a solution to a problem. My core stack is <b> React, Next.js, Node.js, and MongoDB </b> . I am also familiar with TypeScript and Prisma. I am always looking to learn new technologies. I am currently looking for a  <strong>full-time position</strong> as a software developer.	1	t
2	<I>When I&apos;m not coding</I>, I enjoy playing video games, watching movies, and playing with my dog. I also enjoy <b>learning new things</b>. I am currently learning about <b>history and philosophy</b>. I&apos;m also learning how to play the guitar.	2	t
3		3	t
4		4	t
\.


--
-- TOC entry 3646 (class 0 OID 21363)
-- Dependencies: 215
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
clmfhok8l0002nj9ksr80id5p	clmfhok8i0000nj9kuh8akjp8	oauth	credentials	clmfhok8i0000nj9kuh8akjp8	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 3652 (class 0 OID 21409)
-- Dependencies: 221
-- Data for Name: Experience; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Experience" (id, title, location, description, icon, date, visible) FROM stdin;
1	Graduated bootcamp	Miami, FL	I graduated after 6 months of studying. I immediately found a job as a front-end developer.	LuGraduationCap	2019	t
2	Front-End Developer	Orlando, FL	I worked as a front-end developer for 2 years in 1 job and 1 year in another job. I also upskilled to the full stack.	CgWorkAlt	2019 - 2021	t
3	Full-Stack Developer	Houston, TX	I'm now a full-stack developer working as a freelancer. My stack includes React, Next.js, TypeScript, Tailwind, Prisma and MongoDB. I'm open to full-time opportunities.	FaReact	2021 - present	t
\.


--
-- TOC entry 3650 (class 0 OID 21392)
-- Dependencies: 219
-- Data for Name: Projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Projects" (id, title, description, image, url, visible, "order", tags) FROM stdin;
1	CorpComment	I worked as a full-stack developer on this startup project for 2 years. Users can give public feedback to companies.	/corpcomment.png	/	t	1	React,Next.js,MongoDB,Tailwind,Prisma
2	rmtDev	Job board for remote developer jobs. I was the front-end developer. It has features like filtering, sorting and pagination.	/rmtdev.png	/	t	2	React,TypeScript,Next.js,Tailwind,Redux
3	Word Analytics	A public web app for quick analytics on text. It shows word count, character count and social media post limits.	/wordanalytics.png	/	t	3	React,Next.js,SQL,Tailwind,Framer
\.


--
-- TOC entry 3647 (class 0 OID 21370)
-- Dependencies: 216
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", "userRole", expires) FROM stdin;
clmj41r73000325n6pvk8bswt	09e88c33-0c59-47a8-8f56-6708de09e783	clmfhok8i0000nj9kuh8akjp8	admin	2023-10-15 11:52:00.385
\.


--
-- TOC entry 3651 (class 0 OID 21401)
-- Dependencies: 220
-- Data for Name: Skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Skills" (id, name, image, visible, type) FROM stdin;
1	HTML	\N	t	skill
2	CSS	\N	t	skill
3	JavaScript	\N	t	skill
4	TypeScript	\N	t	skill
5	Node.js	\N	t	skill
6	Npm	\N	t	skill
7	Yarn	\N	t	skill
8	Express.js	\N	t	skill
9	Tailwind	\N	t	skill
10	Three.js	\N	t	skill
11	React	\N	t	skill
12	Next.js	\N	t	skill
13	Java	\N	t	skill
14	MongoDB	\N	t	skill
15	Postgresql	\N	t	skill
16	MySQL	\N	t	skill
17	Redis	\N	t	skill
18	Prisma	\N	t	skill
19	Git	\N	t	skill
20	GitHub	\N	t	skill
21	GitLab	\N	t	skill
22	Framer	\N	f	skill
23	MUI	\N	f	skill
24	Redux	\N	f	skill
25	Docker	\N	t	skill
26	AI	\N	f	skill
27	MUI X	\N	f	skill
28	Next-Auth	\N	f	skill
29	C	\N	t	learn
30	C++	\N	t	learn
\.


--
-- TOC entry 3648 (class 0 OID 21377)
-- Dependencies: 217
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", password, role, image) FROM stdin;
clmfhok8i0000nj9kuh8akjp8	Niklas Fulle	fulle.niklas@web.de	t	$2b$10$MEVYyiVClND6PWoptw6QT.g4juPzp1ucxKRt2IyAzl8QUIQy9E2SW	admin	https://avatars.githubusercontent.com/u/36989748?v=4
\.


--
-- TOC entry 3645 (class 0 OID 21352)
-- Dependencies: 214
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
48953379-acbd-481f-bf60-f82d34b0d6b8	56680d76fd7e84c3c7d529e989771754f5f52c410122c44b4fb457672f12d4f2	2023-09-14 13:20:38.225433+02	20230914112038_	\N	\N	2023-09-14 13:20:38.204377+02	1
abcfbe32-8b82-4693-b2b1-9b19c3146f85	962f71e24a9a267f3c8cfad7a4c36fd27b972efcb69412a8d50f04c19afce530	2023-09-14 13:26:31.164105+02	20230914112631_	\N	\N	2023-09-14 13:26:31.161645+02	1
bee93adb-188c-41e0-b326-4d5d4b95ebd8	5c7343aa58438aeb0d72463e2bbb0c8f0e1c9d5c5400e2f4e60c034a8e7ade4b	2023-09-14 14:56:03.161724+02	20230914125603_	\N	\N	2023-09-14 14:56:03.15817+02	1
662ce297-46e4-4e49-89bd-6fbb8e7d4075	962f71e24a9a267f3c8cfad7a4c36fd27b972efcb69412a8d50f04c19afce530	2023-09-14 14:57:09.870788+02	20230914125709_	\N	\N	2023-09-14 14:57:09.868456+02	1
f1ed31b2-7fbd-443d-91b6-faedf8177ac1	9eaa8e0eb657eb20c70af5cafaca7209bd28712a99d0fbf29e80033e00a786eb	2023-09-14 17:17:42.167084+02	20230914151742_	\N	\N	2023-09-14 17:17:42.164267+02	1
562ee8c9-8312-427b-a55d-779259c5eec3	0bb2cf1115b22da653ed9e67698d11e5b97acd61b319ea52af55b790e96847c6	2023-09-15 13:38:35.187913+02	20230915113835_	\N	\N	2023-09-15 13:38:35.185543+02	1
\.


--
-- TOC entry 3493 (class 2606 OID 21391)
-- Name: AboutMe AboutMe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AboutMe"
    ADD CONSTRAINT "AboutMe_pkey" PRIMARY KEY (id);


--
-- TOC entry 3479 (class 2606 OID 21369)
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- TOC entry 3502 (class 2606 OID 21416)
-- Name: Experience Experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Experience"
    ADD CONSTRAINT "Experience_pkey" PRIMARY KEY (id);


--
-- TOC entry 3496 (class 2606 OID 21400)
-- Name: Projects Projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_pkey" PRIMARY KEY (id);


--
-- TOC entry 3484 (class 2606 OID 21376)
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- TOC entry 3499 (class 2606 OID 21408)
-- Name: Skills Skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Skills"
    ADD CONSTRAINT "Skills_pkey" PRIMARY KEY (id);


--
-- TOC entry 3490 (class 2606 OID 21384)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3476 (class 2606 OID 21360)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3491 (class 1259 OID 21430)
-- Name: AboutMe_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AboutMe_id_key" ON public."AboutMe" USING btree (id);


--
-- TOC entry 3477 (class 1259 OID 21422)
-- Name: Account_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_id_key" ON public."Account" USING btree (id);


--
-- TOC entry 3480 (class 1259 OID 21424)
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- TOC entry 3481 (class 1259 OID 21423)
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");


--
-- TOC entry 3500 (class 1259 OID 21433)
-- Name: Experience_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Experience_id_key" ON public."Experience" USING btree (id);


--
-- TOC entry 3494 (class 1259 OID 21431)
-- Name: Projects_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Projects_id_key" ON public."Projects" USING btree (id);


--
-- TOC entry 3482 (class 1259 OID 21425)
-- Name: Session_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_id_key" ON public."Session" USING btree (id);


--
-- TOC entry 3485 (class 1259 OID 21426)
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- TOC entry 3486 (class 1259 OID 21427)
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- TOC entry 3497 (class 1259 OID 21432)
-- Name: Skills_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Skills_id_key" ON public."Skills" USING btree (id);


--
-- TOC entry 3487 (class 1259 OID 21429)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3488 (class 1259 OID 21428)
-- Name: User_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_id_key" ON public."User" USING btree (id);


-- Completed on 2023-09-17 20:04:11 CEST

--
-- PostgreSQL database dump complete
--

