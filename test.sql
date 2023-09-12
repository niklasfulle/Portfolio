--
-- PostgreSQL database dump
--

-- Dumped from database version 13.5
-- Dumped by pg_dump version 13.5

-- Started on 2023-09-13 01:20:53

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
-- TOC entry 201 (class 1259 OID 52197)
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
-- TOC entry 207 (class 1259 OID 52750)
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
-- TOC entry 204 (class 1259 OID 52221)
-- Name: Projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Projects" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    url text NOT NULL,
    visible boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Projects" OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 52205)
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    "userRole" text
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 52231)
-- Name: Skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Skills" (
    id text NOT NULL,
    name text NOT NULL,
    image text,
    visible boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Skills" OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 52213)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    "emailVerified" boolean,
    password text,
    image text,
    role text DEFAULT 'user'::text NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 52239)
-- Name: _ProjectsToSkills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_ProjectsToSkills" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ProjectsToSkills" OWNER TO postgres;

--
-- TOC entry 200 (class 1259 OID 52185)
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
-- TOC entry 3049 (class 0 OID 52197)
-- Dependencies: 201
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
clmfhok8l0002nj9ksr80id5p	clmfhok8i0000nj9kuh8akjp8	oauth	credentials	clmfhok8i0000nj9kuh8akjp8	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 3055 (class 0 OID 52750)
-- Dependencies: 207
-- Data for Name: Experience; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Experience" (id, title, location, description, icon, date, visible) FROM stdin;
1	Graduated bootcamp	Miami, FL	I graduated after 6 months of studying. I immediately found a job as a front-end developer.	LuGraduationCap	2019	t
2	Front-End Developer	Orlando, FL	I worked as a front-end developer for 2 years in 1 job and 1 year in another job. I also upskilled to the full stack.	CgWorkAlt	2019 - 2021	t
3	Full-Stack Developer	Houston, TX	I'm now a full-stack developer working as a freelancer. My stack includes React, Next.js, TypeScript, Tailwind, Prisma and MongoDB. I'm open to full-time opportunities.	FaReact	2021 - present	t
\.


--
-- TOC entry 3052 (class 0 OID 52221)
-- Dependencies: 204
-- Data for Name: Projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Projects" (id, title, description, image, url, visible, "order") FROM stdin;
\.


--
-- TOC entry 3050 (class 0 OID 52205)
-- Dependencies: 202
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires, "userRole") FROM stdin;
clmfir4120001njn0n9d56bkf	374fdcce-e6b3-46ef-a804-8d4d9e61f4e4	clmfhok8i0000nj9kuh8akjp8	2023-10-11 23:32:28.069	admin
clmgqx0kf0001njn8hjzs5xqn	295a3562-87da-43e9-aa9e-abf0e4c899d1	clmfhok8i0000nj9kuh8akjp8	2023-10-12 20:08:46.62	admin
clmgsgfcq0001njp8a99kwn07	618c8d58-0eea-4ff3-adbf-2704f4624eb5	clmfhok8i0000nj9kuh8akjp8	2023-10-12 20:51:51.865	admin
clmgt8q3n0001njcwdmrx0uuo	7b957590-cf4e-458e-8098-7e8f9a05767e	clmfhok8i0000nj9kuh8akjp8	2023-10-12 21:13:52.161	admin
\.


--
-- TOC entry 3053 (class 0 OID 52231)
-- Dependencies: 205
-- Data for Name: Skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Skills" (id, name, image, visible) FROM stdin;
1	HTML	\N	t
2	CSS	\N	t
3	JavaScript	\N	t
4	TypeScript	\N	t
5	Node.js	\N	t
6	Npm	\N	t
7	Yarn	\N	t
8	Express.js	\N	t
9	Tailwind	\N	t
10	Three.js	\N	t
11	React	\N	t
12	Next.js	\N	t
13	Java	\N	t
14	MongoDB	\N	t
15	Postgresql	\N	t
16	MySQL	\N	t
17	Redis	\N	t
18	Prisma	\N	t
19	Git	\N	t
20	GitHub	\N	t
21	GitLab	\N	t
22	Framer	\N	f
23	MUI	\N	f
24	Redux	\N	f
25	Docker	\N	t
26	AI	\N	f
27	MUI X	\N	f
28	Next-Auth	\N	f
\.


--
-- TOC entry 3051 (class 0 OID 52213)
-- Dependencies: 203
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", password, image, role) FROM stdin;
clmfhok8i0000nj9kuh8akjp8	Niklas Fulle	fulle.niklas@web.de	t	$2b$10$MEVYyiVClND6PWoptw6QT.g4juPzp1ucxKRt2IyAzl8QUIQy9E2SW	https://avatars.githubusercontent.com/u/36989748?v=4	admin
\.


--
-- TOC entry 3054 (class 0 OID 52239)
-- Dependencies: 206
-- Data for Name: _ProjectsToSkills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_ProjectsToSkills" ("A", "B") FROM stdin;
\.


--
-- TOC entry 3048 (class 0 OID 52185)
-- Dependencies: 200
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ac5bff96-ef15-44bc-ac68-bcaef8cdc0b4	38524f962f415155c5715ab0a7a364b2b736ec3118eef0c986c9870734ff244e	2023-09-11 22:53:02.515315+02	20230911205302_	\N	\N	2023-09-11 22:53:02.462474+02	1
e29078af-cbd7-4bbd-82fb-afae572f9082	81be722c81a52bf683442658eb23550177def1906f3506b3e990d65867c394e5	2023-09-12 00:53:29.077497+02	20230911225329_	\N	\N	2023-09-12 00:53:29.075324+02	1
40510210-a1ca-423f-b754-2025af18f38e	a5247c68a90345e3ba49098cb4f40f3ca85944e8974d1c5149e8a7e7b58d0906	2023-09-12 23:42:01.508223+02	20230912214201_	\N	\N	2023-09-12 23:42:01.491557+02	1
e6f45a3e-50dc-4327-a109-af37b0e65de2	b0586f87facd23732af80c250b801214b0877e3cbfbe64bc128d91251c7a5581	2023-09-13 00:10:16.90172+02	20230912221016_	\N	\N	2023-09-13 00:10:16.899398+02	1
\.


--
-- TOC entry 2895 (class 2606 OID 52204)
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- TOC entry 2917 (class 2606 OID 52758)
-- Name: Experience Experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Experience"
    ADD CONSTRAINT "Experience_pkey" PRIMARY KEY (id);


--
-- TOC entry 2909 (class 2606 OID 52230)
-- Name: Projects Projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_pkey" PRIMARY KEY (id);


--
-- TOC entry 2900 (class 2606 OID 52212)
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- TOC entry 2912 (class 2606 OID 52238)
-- Name: Skills Skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Skills"
    ADD CONSTRAINT "Skills_pkey" PRIMARY KEY (id);


--
-- TOC entry 2906 (class 2606 OID 52220)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 2892 (class 2606 OID 52194)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 2893 (class 1259 OID 52245)
-- Name: Account_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_id_key" ON public."Account" USING btree (id);


--
-- TOC entry 2896 (class 1259 OID 52247)
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- TOC entry 2897 (class 1259 OID 52246)
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");


--
-- TOC entry 2915 (class 1259 OID 52759)
-- Name: Experience_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Experience_id_key" ON public."Experience" USING btree (id);


--
-- TOC entry 2907 (class 1259 OID 52253)
-- Name: Projects_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Projects_id_key" ON public."Projects" USING btree (id);


--
-- TOC entry 2898 (class 1259 OID 52248)
-- Name: Session_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_id_key" ON public."Session" USING btree (id);


--
-- TOC entry 2901 (class 1259 OID 52249)
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- TOC entry 2902 (class 1259 OID 52250)
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- TOC entry 2910 (class 1259 OID 52254)
-- Name: Skills_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Skills_id_key" ON public."Skills" USING btree (id);


--
-- TOC entry 2903 (class 1259 OID 52252)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 2904 (class 1259 OID 52251)
-- Name: User_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_id_key" ON public."User" USING btree (id);


--
-- TOC entry 2913 (class 1259 OID 52255)
-- Name: _ProjectsToSkills_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_ProjectsToSkills_AB_unique" ON public."_ProjectsToSkills" USING btree ("A", "B");


--
-- TOC entry 2914 (class 1259 OID 52256)
-- Name: _ProjectsToSkills_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_ProjectsToSkills_B_index" ON public."_ProjectsToSkills" USING btree ("B");


-- Completed on 2023-09-13 01:20:53

--
-- PostgreSQL database dump complete
--

