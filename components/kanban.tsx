"use client";

import { useRef, useState, type ReactNode } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@/lib/utils";

type ColumnId = "todo" | "doing" | "done";

type Task = {
  title: string;
  date: string;
  body: ReactNode;
};

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "doing", title: "In Progress" },
  { id: "done", title: "Done" },
];

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className="underline decoration-[#1a1a1a]/40 underline-offset-[3px] hover:decoration-[#1a1a1a]" href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

const OPEN_SOURCE = [
  {
    repo: "simpleble/simpleble",
    prs: [
      { title: "the new docs site", url: "https://github.com/simpleble/simpleble/pull/439" },
      { title: "MCP server + Agent Skills", url: "https://github.com/simpleble/simpleble/pull/443" },
      { title: "step by step getting started guide", url: "https://github.com/simpleble/simpleble/pull/456" },
      { title: "fix scan stop on Windows", url: "https://github.com/simpleble/simpleble/pull/449" },
      { title: "+ 13 more", url: "https://github.com/simpleble/simpleble/pulls?q=is%3Apr+author%3Aalejorrojas" },
    ],
  },
  {
    repo: "basementstudio/xmcp",
    prs: [{ title: "dynamic port allocation for HTTP transport", url: "https://github.com/basementstudio/xmcp/pull/97" }],
  },
  {
    repo: "reactjs/react.dev",
    prs: [{ title: "fix Server Components link text", url: "https://github.com/reactjs/react.dev/pull/8026" }],
  },
  {
    repo: "microsoft/react-native-macos",
    prs: [{ title: "fix Metro bundler startup docs", url: "https://github.com/microsoft/react-native-macos/pull/2795" }],
  },
];

const INTERPRETABILITY_PROBLEMS = [
  "faithfulness: do explanations reflect what the model actually computes?",
  "scaling feature discovery to frontier size models",
  "evaluating explanations without a human in the loop",
  "interpretability as a tool for alignment",
];

const TASKS: Record<string, Task> = {
  "agents-ui": {
    title: "Research Agent UIs",
    date: "2027",
    body: (
      <p>
        Explore how agent interfaces can streamline the development process: better ways to steer, review and ship
        with AI agents.
      </p>
    ),
  },
  "taste-labs": {
    title: "Measure and convey taste",
    date: "2026",
    body: (
      <p>
        Explore how to measure taste and how to communicate it to an agent. This is hard even for humans. How do we
        know a painting is good? How do we express what we feel when we see one? Conveying that is already hard
        between people. How do we get an agent to understand it? Like{" "}
        <ExternalLink href="https://tastelabs.com/">Taste Labs</ExternalLink>: make taste measurable, starting with
        design.
      </p>
    ),
  },
  andon: {
    title: "Can agents run a business",
    date: "2026",
    body: (
      <p>
        Explore whether models that perform extremely well on small tasks can run a business. That takes long running
        work, coordination, and a memory of what already happened. As{" "}
        <ExternalLink href="https://andonlabs.com/">Andon Labs</ExternalLink> describes it: study AI in the real world,
        an AI run store, a café and a radio, so it stays safe.
      </p>
    ),
  },
  interpretability: {
    title: "Interpretability research",
    date: "Oct 26",
    body: (
      <>
        <p>Trying to understand what happens inside LLMs. Problems I care about:</p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          {INTERPRETABILITY_PROBLEMS.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
        <p className="mt-2">
          Projects: <ExternalLink href="https://nlasmith.com/paper">NLASmith</ExternalLink>, a framework for
          experimenting with Natural Language Autoencoders. More to come.
        </p>
      </>
    ),
  },
  degree: {
    title: "Systems Engineering Degree",
    date: "Dec 26",
    body: <p>Finishing my Systems Engineering degree at UTN.</p>,
  },
  yc: {
    title: "Work at a YC company",
    date: "Jul 25",
    body: (
      <p>
        Shipped at <ExternalLink href="https://www.rebill.com">Rebill (YC W22)</ExternalLink>: led the SDK behind one
        click checkouts and built PCI compliant infra.
      </p>
    ),
  },
  "open-source": {
    title: "Contribute to open source",
    date: "Oct 26",
    body: (
      <div className="space-y-3">
        {OPEN_SOURCE.map(({ repo, prs }) => (
          <div key={repo}>
            <ExternalLink href={`https://github.com/${repo}`}>
              <span className="font-medium">{repo}</span>
            </ExternalLink>
            <ul className="mt-0.5">
              {prs.map((pr) => (
                <li key={pr.url}>
                  <ExternalLink href={pr.url}>{pr.title}</ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  readme: {
    title: "New readme view",
    date: "Oct 26",
    body: <p>Implement an original and hilarious readme view. Now the cards actually move between columns.</p>,
  },
};

const INITIAL_BOARD: Record<ColumnId, string[]> = {
  todo: ["agents-ui", "taste-labs", "andon"],
  doing: ["interpretability", "degree"],
  done: ["yc", "open-source", "readme"],
};

const SENSORS = [
  PointerSensor.configure({
    activationConstraints: [new PointerActivationConstraints.Distance({ value: 6 })],
  }),
];

const TaskCard = ({ id, index, column }: { id: string; index: number; column: ColumnId }) => {
  const task = TASKS[id];
  const { ref, isDragging } = useSortable({ id, index, group: column, type: "item", accept: "item" });

  return (
    <article
      ref={ref}
      className={cn(
        "cursor-grab touch-none select-none border border-[#1a1a1a] bg-[#fbfbf8] px-3.5 py-3 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[18px] font-medium leading-snug">{task.title}</h3>
        <time className="shrink-0 text-[13px] tracking-wide text-[#6b6b6b]">{task.date}</time>
      </div>
      <div className="mt-1.5 text-[16px] leading-relaxed text-[#242424]">{task.body}</div>
    </article>
  );
};

const Column = ({ id, title, children }: { id: ColumnId; title: string; children: ReactNode }) => {
  const { ref, isDropTarget } = useDroppable({
    id,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <section
      ref={ref}
      className={cn("flex h-[1280px] flex-col border border-[#1a1a1a] bg-white", isDropTarget && "bg-[#f3efe6]")}
    >
      <h2 className="border-b border-[#1a1a1a] px-4 py-3 text-[14px] font-medium uppercase tracking-[0.16em]">
        {title}
      </h2>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">{children}</div>
    </section>
  );
};

export const Kanban = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const snapshot = useRef(board);

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1a1a1a]">
      <header className="px-6 py-5">
        <h1 className="text-[34px] font-medium tracking-tight">My readme Kanban</h1>
      </header>
      <DragDropProvider
        sensors={SENSORS}
        onDragStart={() => {
          snapshot.current = board;
        }}
        onDragOver={(event) => {
          setBoard((current) => move(current, event));
        }}
        onDragEnd={(event) => {
          if (event.canceled) setBoard(snapshot.current);
        }}
      >
        <main className="grid grid-cols-1 items-start gap-5 px-6 pb-8 md:grid-cols-3">
          {COLUMNS.map((column) => (
            <Column key={column.id} id={column.id} title={column.title}>
              {board[column.id].map((taskId, index) => (
                <TaskCard key={taskId} id={taskId} index={index} column={column.id} />
              ))}
            </Column>
          ))}
        </main>
      </DragDropProvider>
    </div>
  );
};
