"use client";

import { animate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  CalendarDays,
  CircleAlert,
  Flame,
  GitCommitHorizontal,
  GitPullRequest,
  Star,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import type { GithubLanguageStat, GithubStatsData } from "@/lib/github-stats";

type GithubStatsProps = {
  readonly language: string;
  readonly stats: GithubStatsData;
};

type Metric = {
  labelDe: string;
  labelEn: string;
  icon: ReactNode;
  value: (stats: GithubStatsData) => number;
};

const metrics: Metric[] = [
  {
    labelDe: "Gesammelte Sterne",
    labelEn: "Total Stars Earned",
    icon: <Star className="h-4 w-4" />,
    value: (stats) => stats.stars,
  },
  {
    labelDe: "Commits (letztes Jahr)",
    labelEn: "Total Commits (last year)",
    icon: <GitCommitHorizontal className="h-4 w-4" />,
    value: (stats) => stats.commits,
  },
  {
    labelDe: "Pull Requests",
    labelEn: "Total PRs",
    icon: <GitPullRequest className="h-4 w-4" />,
    value: (stats) => stats.pullRequests,
  },
  {
    labelDe: "Issues",
    labelEn: "Total Issues",
    icon: <CircleAlert className="h-4 w-4" />,
    value: (stats) => stats.issues,
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const metricVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.08, duration: 0.35, ease: "easeOut" },
  }),
};

const numberFormatter = new Intl.NumberFormat("de-DE");

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)) - 1,
    units.length - 1
  );
  const value = bytes / 1024 ** (unitIndex + 1);

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getLanguageDetails(item: GithubLanguageStat) {
  return item.bytes ? formatBytes(item.bytes) : null;
}

function AnimatedNumber({ value }: { readonly value: number }) {
  const count = useMotionValue(0);
  const formattedValue = numberFormatter.format(value);
  const formattedCount = useTransform(count, (current) =>
    numberFormatter.format(Math.round(current))
  );
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      count.set(value);
      return;
    }

    const controls = animate(count, value, {
      duration: 1.2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, reducedMotion, value]);

  return (
    <motion.span
      className="inline-block whitespace-nowrap tabular-nums"
      style={{ minWidth: `${formattedValue.length}ch` }}
    >
      {formattedCount}
    </motion.span>
  );
}

function AnimatedRing({
  value,
  color = "#06b6d4",
  gapAtTop = false,
}: {
  readonly value: number;
  readonly color?: string;
  readonly gapAtTop?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const arcPath = "M 48 10.05 A 31 31 0 1 1 32 10.05";

  return (
    <svg
      className={`h-24 w-24 ${gapAtTop ? "" : "-rotate-90"}`}
      viewBox="0 0 80 80"
    >
      <title>{`${value}% score`}</title>
      {gapAtTop ? (
        <>
          <path
            d={arcPath}
            fill="none"
            pathLength="100"
            stroke="currentColor"
            strokeWidth="7"
            className="text-slate-200 dark:text-slate-800"
          />
          <motion.path
            d={arcPath}
            fill="none"
            initial={reducedMotion ? { pathLength: value } : { pathLength: 0 }}
            pathLength="100"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="7"
            animate={{ pathLength: value }}
            transition={{ duration: 1.25, ease: "easeOut" }}
          />
        </>
      ) : (
        <>
          <circle
            cx="40"
            cy="40"
            fill="none"
            pathLength="100"
            r="31"
            stroke="currentColor"
            strokeWidth="7"
            className="text-slate-200 dark:text-slate-800"
          />
          <motion.circle
            cx="40"
            cy="40"
            fill="none"
            initial={reducedMotion ? { pathLength: value } : { pathLength: 0 }}
            pathLength="100"
            r="31"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="7"
            animate={{ pathLength: value }}
            transition={{ duration: 1.25, ease: "easeOut" }}
          />
        </>
      )}
    </svg>
  );
}

function buildContributionWeeks(
  days: GithubStatsData["contributionDays"],
  locale: string
) {
  if (days.length === 0) return [];

  const contributionsByDate = new Map(
    days.map((day) => [day.date, day.count])
  );
  const lastDate = new Date(`${days[days.length - 1].date}T00:00:00.000Z`);
  const firstDate = new Date(lastDate);
  firstDate.setUTCDate(firstDate.getUTCDate() - 364);
  firstDate.setUTCDate(firstDate.getUTCDate() - firstDate.getUTCDay());

  const weeks: Array<{
    month: string;
    cells: Array<{ date: string; count: number | null }>;
  }> = [];
  const cursor = new Date(firstDate);

  while (cursor <= lastDate) {
    const cells = Array.from({ length: 7 }, () => {
      const date = cursor.toISOString().slice(0, 10);
      const count = cursor <= lastDate ? contributionsByDate.get(date) ?? 0 : null;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      return { date, count };
    });
    const firstCellDate = new Date(`${cells[0].date}T00:00:00.000Z`);
    const month = firstCellDate.getUTCDate() <= 7
      ? new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(firstCellDate)
      : "";
    weeks.push({ cells, month });
  }

  return weeks;
}

function contributionLevel(count: number | null) {
  if (count === null) return "bg-transparent";
  if (count === 0) return "bg-slate-200/90 dark:bg-slate-800";
  if (count <= 2) return "bg-cyan-200/90 dark:bg-cyan-950";
  if (count <= 5) return "bg-cyan-300 dark:bg-cyan-800";
  if (count <= 9) return "bg-cyan-500 dark:bg-cyan-500";
  return "bg-violet-500 dark:bg-violet-400";
}

function ContributionCalendar({ language, stats }: GithubStatsProps) {
  const reducedMotion = useReducedMotion();
  const isGerman = language === "de";
  const weeks = buildContributionWeeks(stats.contributionDays ?? [], isGerman ? "de-DE" : "en-US");
  const weekdayLabels = isGerman ? ["", "Mo", "", "Mi", "", "Fr", ""] : ["", "Mon", "", "Wed", "", "Fri", ""];
  const monthFormatter = new Intl.DateTimeFormat(isGerman ? "de-DE" : "en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const dateFormatter = new Intl.DateTimeFormat(isGerman ? "de-DE" : "en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  });

  return (
    <section className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/50 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
              {isGerman ? "Beitragsaktivität" : "Contribution activity"}
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {isGerman ? "Deine letzten 365 Tage auf GitHub" : "Your last 365 days on GitHub"}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 px-2.5 py-1 text-[0.68rem] font-medium text-slate-500 dark:border-slate-700/80 dark:text-slate-400">
          <span>{isGerman ? "Weniger" : "Less"}</span>
          <span aria-hidden="true" className="inline-flex gap-0.5">
            {[0, 2, 5, 9, 10].map((count) => (
              <span
                className={`h-2 w-2 rounded-[0.15rem] ${contributionLevel(count)}`}
                key={count}
              />
            ))}
          </span>
          <span>{isGerman ? "Mehr" : "More"}</span>
        </span>
      </div>

      {weeks.length > 0 ? (
        <div className="mt-5 overflow-x-auto pb-8" data-testid="github-contribution-calendar">
          <div className="grid min-w-[43rem] grid-cols-[2rem_1fr] gap-x-2">
            <div className="grid h-[6.35rem] grid-rows-7 text-[0.62rem] leading-3 text-slate-500 dark:text-slate-400">
              {weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
            </div>
            <div className="min-w-0">
              <div className="grid grid-flow-col auto-cols-[0.72rem] gap-1 text-[0.62rem] text-slate-500 dark:text-slate-400">
                {weeks.map((week, index) => (
                  <span key={`${week.cells[0].date}-month`} className="whitespace-nowrap">
                    {week.month || (index === 0 ? monthFormatter.format(new Date(`${week.cells[0].date}T00:00:00.000Z`)) : "")}
                  </span>
                ))}
              </div>
              <div className="mt-1 grid grid-flow-col grid-rows-7 auto-cols-[0.72rem] gap-1">
                {weeks.flatMap((week) => week.cells).map((cell, index) => (
                  <motion.span
                    aria-label={cell.count === null
                      ? `${cell.date}: ${isGerman ? "keine Daten" : "no data"}`
                      : `${cell.date}: ${cell.count} ${isGerman ? "Beiträge" : "contributions"}`}
                    className={`group/contribution relative h-3 w-3 rounded-[0.2rem] transition-[filter] duration-200 hover:z-20 hover:brightness-125 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${contributionLevel(cell.count)}`}
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                    key={cell.date}
                    role="img"
                    tabIndex={0}
                    title={cell.count === null ? undefined : `${cell.date}: ${cell.count}`}
                    animate={{ opacity: cell.count === null ? 0 : 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: reducedMotion ? 0 : Math.min(index * 0.006, 0.8) }}
                  >
                    {cell.count !== null ? (
                      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.55rem)] z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-[0.68rem] font-semibold text-slate-700 shadow-xl group-hover/contribution:block group-focus-visible/contribution:block dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                        {cell.count} {isGerman ? "Beiträge" : "contributions"} · {dateFormatter.format(new Date(`${cell.date}T00:00:00.000Z`))}
                      </span>
                    ) : null}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-dashed border-slate-300/80 px-4 py-5 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {isGerman ? "Beitragsdaten werden beim nächsten GitHub-Update geladen." : "Contribution data will appear after the next GitHub update."}
        </p>
      )}
    </section>
  );
}

function GithubOverviewCard({ language, stats }: GithubStatsProps) {
  const reducedMotion = useReducedMotion();
  const isGerman = language === "de";

  return (
    <motion.article
      className="group rounded-2xl border border-slate-300/80 bg-white/75 p-5 text-left shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/70 dark:shadow-black/20 sm:p-6"
      data-testid="github-stats-card"
      initial={reducedMotion ? false : "hidden"}
      variants={cardVariants}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={reducedMotion ? undefined : { y: -6, scale: 1.01 }}
      whileInView="visible"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(14rem,0.75fr)]">
        <section className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/50 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-600/80 dark:text-cyan-300/80">
                {isGerman ? "Entwicklungsprofil" : "Developer profile"}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                {isGerman ? "GitHub-Aktivität" : "GitHub Activity"}
              </h3>
            </div>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[0.68rem] font-medium text-cyan-700 dark:text-cyan-300">
              {isGerman ? "Letzte 365 Tage" : "Last 365 days"}
            </span>
          </div>

          <motion.ul
            className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4"
            initial="hidden"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            viewport={{ once: true }}
            whileInView="visible"
          >
            {metrics.map((metric, index) => (
              <motion.li
                className="group relative min-w-0 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-slate-700 shadow-sm transition-colors duration-300 hover:border-cyan-400/70 hover:bg-cyan-50/70 dark:border-slate-700/80 dark:bg-slate-950/35 dark:text-slate-200 dark:hover:border-cyan-400/50 dark:hover:bg-slate-900/70"
                custom={index}
                key={metric.labelEn}
                variants={metricVariants}
                whileHover={reducedMotion ? undefined : { y: -5, rotate: -1.5, scale: 1.03 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              >
                <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-cyan-400/0 blur-md transition-colors duration-300 group-hover:bg-cyan-400/20 dark:group-hover:bg-cyan-400/15" />
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  {metric.icon}
                </span>
                <strong className="mt-3 block text-2xl text-slate-950 dark:text-white">
                  <AnimatedNumber value={metric.value(stats)} />
                </strong>
                <span className="mt-1 block text-[0.68rem] font-semibold leading-tight sm:text-xs">
                  {isGerman ? metric.labelDe : metric.labelEn}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        <section
          className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-white/60 to-indigo-500/10 p-4 dark:from-cyan-500/10 dark:via-slate-950/60 dark:to-indigo-500/10 sm:p-5"
          title={isGerman ? "GitHub-Bewertung" : "GitHub grade"}
        >
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="relative flex h-full items-center gap-4 sm:gap-5 lg:flex-col lg:items-start lg:justify-between">
            <div className="relative shrink-0 text-center">
              <AnimatedRing value={stats.gradeScore} />
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900 dark:text-white">
                {stats.grade}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-700/80 dark:text-cyan-300/80">
                {isGerman ? "GitHub-Bewertung" : "GitHub grade"}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {isGerman ? "Aktivitätsprofil" : "Activity profile"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                {isGerman
                  ? "Gewichtet nach Commits, Pull Requests, Issues und Sternen."
                  : "Weighted by commits, pull requests, issues, and stars."}
              </p>
            </div>
            <span className="hidden rounded-full border border-slate-300/80 bg-white/60 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-600 dark:border-slate-700/80 dark:bg-slate-950/50 dark:text-slate-300 lg:inline-flex">
              {stats.gradeScore}%
            </span>
          </div>
        </section>
      </div>

      <section
        className="mt-4 grid grid-cols-3 items-center divide-x divide-slate-300/80 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-center dark:divide-slate-700/80 dark:border-slate-800/80 dark:bg-slate-900/50 sm:p-4"
        data-testid="github-streak-card"
      >
          <div className="min-w-0 px-2 sm:px-4">
            <strong className="block text-2xl font-bold text-cyan-500 sm:text-3xl">
              <AnimatedNumber value={stats.totalContributions} />
            </strong>
            <span className="mt-1 block text-[0.68rem] font-medium text-cyan-600 dark:text-cyan-300 sm:text-sm">
              {isGerman ? "Gesamtbeiträge" : "Total Contributions"}
            </span>
            <span className="mt-3 block text-[0.62rem] text-slate-600 dark:text-slate-300 sm:text-xs">
              {stats.contributionStart}
            </span>
          </div>

          <div className="relative min-w-0 px-1 sm:px-4">
            <div
              className="relative mx-auto h-24 w-24"
              data-testid="github-current-streak-ring"
            >
              <AnimatedRing value={100} color="#22d3ee" gapAtTop />
              <motion.div
                className="absolute -top-1 inset-x-0 flex justify-center text-cyan-500"
                data-testid="github-current-streak-icon"
                animate={
                  reducedMotion
                    ? undefined
                    : { y: [0, -3, 0], scale: [1, 1.08, 1] }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame
                  aria-hidden="true"
                  className="h-6 w-6 fill-cyan-400/20 stroke-[2.5]"
                />
              </motion.div>
              <strong
                className="absolute inset-0 flex items-center justify-center pt-1 text-2xl text-emerald-500"
                data-testid="github-current-streak-value"
              >
                <AnimatedNumber value={stats.currentStreak} />
              </strong>
            </div>
            <span className="mt-1 block text-[0.68rem] font-semibold text-emerald-500 sm:text-sm">
              {isGerman ? "Aktueller Streak" : "Current Streak"}
            </span>
            <span className="mt-2 block text-[0.62rem] text-slate-600 dark:text-slate-300 sm:text-xs">
              {stats.currentStreakDates}
            </span>
          </div>

          <div className="min-w-0 px-2 sm:px-4">
            <strong className="block text-2xl font-bold text-cyan-500 sm:text-3xl">
              <AnimatedNumber value={stats.longestStreak} />
            </strong>
            <span className="mt-1 block text-[0.68rem] font-medium text-cyan-600 dark:text-cyan-300 sm:text-sm">
              {isGerman ? "Längster Streak" : "Longest Streak"}
            </span>
            <span className="mt-3 block text-[0.62rem] text-slate-600 dark:text-slate-300 sm:text-xs">
              {stats.longestStreakDates}
            </span>
          </div>
      </section>
      <ContributionCalendar language={language} stats={stats} />
    </motion.article>
  );
}

function LanguageRow({
  index,
  isGerman,
  item,
  reducedMotion,
}: {
  readonly index: number;
  readonly isGerman: boolean;
  readonly item: GithubLanguageStat;
  readonly reducedMotion: boolean | null;
}) {
  const languageDetails = getLanguageDetails(item);

  return (
    <li
      className="border-t border-slate-200/80 py-2.5 first:border-t-0 dark:border-slate-800/80 sm:first:border-t"
      key={item.name}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <span className="w-5 shrink-0 text-[0.65rem] text-slate-400">
          #{index + 1}
        </span>
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="min-w-0 flex-1 truncate">{item.name}</span>
        <span className="shrink-0 tabular-nums">
          {item.percentage.toFixed(2)}%
        </span>
      </div>
      <motion.div
        className="ml-7 mt-1.5 origin-left"
        initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.65, delay: 0.04 * index }}
      >
        <progress
          aria-label={`${item.name} ${item.percentage}%`}
          className="block h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          max={100}
          style={{ accentColor: item.color }}
          value={item.percentage}
        />
      </motion.div>
      {languageDetails || item.repositoryCount ? (
        <div className="ml-7 mt-1 flex justify-between gap-2 text-[0.62rem] text-slate-500 dark:text-slate-400">
          {languageDetails ? <span>{languageDetails}</span> : <span />}
          {item.repositoryCount ? (
            <span>
              {item.repositoryCount} {isGerman ? "Repos" : "repos"}
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function LanguagesCard({ language, stats }: GithubStatsProps) {
  const reducedMotion = useReducedMotion();
  const isGerman = language === "de";
  const totalBytes = stats.languages.reduce(
    (total, item) => total + (item.bytes ?? 0),
    0
  );
  const topLanguage = stats.languages[0];
  const visibleLanguages = stats.languages.slice(0, 8);
  const additionalLanguages = stats.languages.slice(8);

  return (
    <motion.article
      className="group rounded-2xl border border-slate-300/80 bg-white/75 p-5 text-left shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/70 dark:shadow-black/20 sm:p-7"
      data-testid="github-languages-card"
      initial={reducedMotion ? false : "hidden"}
      variants={cardVariants}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={reducedMotion ? undefined : { y: -6, scale: 1.01 }}
      whileInView="visible"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-600/80 dark:text-cyan-300/80">
            {isGerman ? "Code-Bibliothek" : "Code library"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
          {isGerman ? "Meistgenutzte Sprachen" : "My Most Used Languages"}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[0.68rem] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
          <span className="rounded-full border border-slate-200/80 px-2.5 py-1 dark:border-slate-700/80">
            {stats.languages.length} {isGerman ? "Sprachen" : "languages"}
          </span>
          {totalBytes > 0 && (
            <span className="rounded-full border border-slate-200/80 px-2.5 py-1 dark:border-slate-700/80">
              {formatBytes(totalBytes)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
        {stats.languages.map((item: GithubLanguageStat, index: number) => (
          <motion.span
            aria-hidden="true"
            className="h-full origin-left first:rounded-l-full last:rounded-r-full"
            initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
            key={item.name}
            style={{ backgroundColor: item.color, width: `${item.percentage}%` }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.03 * index }}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[0.68rem] text-slate-500 dark:text-slate-400 sm:text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-cyan-700 dark:text-cyan-300">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: topLanguage?.color }}
          />
          {topLanguage
            ? `Top: ${topLanguage.name} ${topLanguage.percentage.toFixed(2)}%`
            : "Top: -"}
        </span>
        <span>
          {isGerman ? "Anteil am gesamten Code" : "Share of total code"}
        </span>
      </div>

      <ul className="mt-4 grid gap-x-6 sm:grid-cols-2" data-testid="github-top-languages">
        {visibleLanguages.map((item, index) => (
          <LanguageRow
            index={index}
            isGerman={isGerman}
            item={item}
            key={item.name}
            reducedMotion={reducedMotion}
          />
        ))}
      </ul>

      {additionalLanguages.length > 0 && (
        <details
          className="mt-3 border-t border-slate-200/80 pt-3 dark:border-slate-800/80"
          data-testid="github-more-languages"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-xs font-semibold text-cyan-700 outline-none transition-colors hover:text-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400 dark:text-cyan-300 dark:hover:text-cyan-200 [&::-webkit-details-marker]:hidden">
            <span>
              {isGerman ? "Mehr anzeigen" : "Show more"}
            </span>
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
          </summary>
          <ul className="mt-1 grid gap-x-6 sm:grid-cols-2">
            {additionalLanguages.map((item, index) => (
              <LanguageRow
                index={index + 8}
                isGerman={isGerman}
                item={item}
                key={item.name}
                reducedMotion={reducedMotion}
              />
            ))}
          </ul>
        </details>
      )}
    </motion.article>
  );
}

export default function GithubStats({ language, stats }: GithubStatsProps) {
  return (
    <motion.div
      className="mx-auto mt-8 grid w-full max-w-5xl gap-5 px-1 pb-8 text-left"
      data-testid="github-stats"
      initial="hidden"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      viewport={{ once: true, amount: 0.15 }}
      whileInView="visible"
    >
      <GithubOverviewCard language={language} stats={stats} />
    </motion.div>
  );
}
