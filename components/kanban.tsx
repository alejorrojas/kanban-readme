"use client";

import { useRef, useState, type ReactNode } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  <a className="text-primary underline-offset-2 hover:underline" href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

const OPEN_SOURCE = [
  {
    repo: "simpleble/simpleble",
    prs: [
      { title: "the new docs site", url: "https://github.com/simpleble/simpleble/pull/439" },
      { title: "MCP server + Agent Skills", url: "https://github.com/simpleble/simpleble/pull/443" },
      { title: "step-by-step getting started guide", url: "https://github.com/simpleble/simpleble/pull/456" },
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
  "superposition: one neuron, many unrelated concepts",
  "faithfulness: do explanations reflect what the model actually computes?",
  "scaling feature discovery to frontier-size models",
  "evaluating explanations without a human in the loop",
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
  aws: {
    title: "Take an AWS certification exam",
    date: "Sep 25",
    body: (
      <p>
        Although I have experience working with AWS, I would love to complete a tough certification like the AWS
        Solutions Architect Associate.
      </p>
    ),
  },
  interpretability: {
    title: "Interpretability research",
    date: "Oct 26",
    body: (
      <>
        <p>Trying to understand what happens inside LLMs. Problems I care about:</p>
        <ul className="list-disc space-y-1 pl-4">
          {INTERPRETABILITY_PROBLEMS.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
        <p>
          Projects: <ExternalLink href="https://nlasmith.com/paper">NLASmith</ExternalLink>, a framework for
          experimenting with Natural Language Autoencoders. More to come.
        </p>
      </>
    ),
  },
  degree: {
    title: "Systems Engineering Degree",
    date: "Dec 26",
    body: <p>Final stretch at UTN, keep pushing!</p>,
  },
  yc: {
    title: "Work at a YC company",
    date: "Jul 25",
    body: (
      <p>
        Shipped at <ExternalLink href="https://www.rebill.com">Rebill (YC W22)</ExternalLink>: led the SDK behind
        1-click checkouts and built PCI-compliant infra.
      </p>
    ),
  },
  "open-source": {
    title: "Contribute to open source",
    date: "Oct 26",
    body: (
      <div className="space-y-2.5">
        {OPEN_SOURCE.map(({ repo, prs }) => (
          <div key={repo}>
            <ExternalLink href={`https://github.com/${repo}`}>
              <span className="font-medium text-foreground">{repo}</span>
            </ExternalLink>
            <ul className="list-disc pl-4">
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
  todo: ["agents-ui", "aws"],
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
    <Card
      ref={ref}
      className={cn("cursor-grab touch-none select-none active:cursor-grabbing", isDragging && "opacity-60 shadow-lg")}
    >
      <CardContent>
        <h3 className="text-base font-semibold">{task.title}</h3>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">{task.body}</div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 border">
            <AvatarImage src="/placeholder-user.jpg" alt="Alejo Rojas" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">Alejo Rojas</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{task.date}</span>
        </div>
      </CardFooter>
    </Card>
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
      className={cn("bg-card rounded-lg shadow-md transition-colors", isDropTarget && "bg-muted")}
    >
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="p-4 space-y-4 min-h-24">{children}</div>
    </section>
  );
};

export const Kanban = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const snapshot = useRef(board);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 border-b">
        <h1 className="text-xl md:text-2xl font-semibold">My readme Kanban</h1>
        <span className="mt-2 md:mt-0 text-sm text-muted-foreground">drag the cards between columns</span>
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
        <main className="flex-1 grid grid-cols-1 md:grid-cols-3 items-start gap-4 md:gap-6 p-4 md:p-6">
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

function CalendarDaysIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}
