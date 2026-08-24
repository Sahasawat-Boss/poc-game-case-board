"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildCases } from "@/data/cases";
import { pickSessionPlaces } from "@/data/places";
import { buildSeedSql, pickSessionNames } from "@/data/seed";
import { useDatabase } from "@/hooks/useDatabase";
import { useDistinct } from "@/hooks/useDistinct";
import { useGame } from "@/hooks/useGame";
import { buildSql, emptyQuery } from "@/lib/query";
import { cardFromRow } from "@/lib/rows";
import CasePanel from "@/components/CasePanel";
import EvidenceBoard from "@/components/EvidenceBoard";
import QueryPanel from "@/components/QueryPanel";
import ResultTable from "@/components/ResultTable";
import type { BoardState, QueryResult, QueryState } from "@/types";

const EMPTY_BOARD: BoardState = { cards: [], links: [] };

export default function GameBoard() {
  // สุ่มชื่อคน/ชื่อสถานที่ครั้งเดียวต่อรอบเล่น — ผู้เล่นจะจำคำตอบจากรอบก่อนไม่ได้
  const [names] = useState(pickSessionNames);
  const [places] = useState(pickSessionPlaces);

  const seedSql = useMemo(() => buildSeedSql(names, places), [names, places]);
  const { db, loading, error: dbError } = useDatabase(seedSql);
  const cases = useMemo(() => buildCases(names, places), [names, places]);
  const game = useGame(cases);
  const distinct = useDistinct(db);

  const [query, setQuery] = useState<QueryState>(() =>
    emptyQuery(cases[0]?.tables[0] ?? "people"),
  );
  const [view, setView] = useState<"files" | "board">("files");
  const [boards, setBoards] = useState<Record<number, BoardState>>({});

  const caseN = game.current?.n ?? 1;
  const board = boards[caseN] ?? EMPTY_BOARD;
  const setBoard = (next: BoardState) => setBoards((prev) => ({ ...prev, [caseN]: next }));

  // เปลี่ยนสำนวนแล้วเปิดแฟ้มแรกที่คดีนั้นบอกใบ้ให้เลย จะได้ไม่ต้องหาเองทุกครั้ง
  const firstTable = game.current?.tables[0] ?? "people";
  useEffect(() => {
    setQuery(emptyQuery(firstTable));
    setView("files");
  }, [caseN, firstTable]);

  const sql = useMemo(() => buildSql(query), [query]);

  const { result, error } = useMemo(() => {
    if (!db) return { result: null, error: null };
    try {
      const res = db.exec(sql);
      const last = res.length ? res[res.length - 1] : null;
      return {
        result: last
          ? ({ columns: last.columns, values: last.values } as QueryResult)
          : ({ columns: [], values: [] } as QueryResult),
        error: null,
      };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [db, sql]);

  // ปุ่มปักหมุดจำว่าแถวไหนปักไปแล้ว แต่พอคิวรีเปลี่ยน ลำดับแถวก็เปลี่ยน ต้องล้างความจำ
  const [pinnedRows, setPinnedRows] = useState<Set<number>>(new Set());
  useEffect(() => setPinnedRows(new Set()), [sql, caseN]);

  const pin = (rowIndex: number) => {
    if (!result) return;
    const card = cardFromRow(query, result, rowIndex, board.cards.length);
    setBoard({ ...board, cards: [...board.cards, card] });
    setPinnedRows((prev) => new Set(prev).add(rowIndex));
  };

  if (dbError) {
    return (
      <main className="mx-auto max-w-[900px] px-4 py-16">
        <p className="msg msg-error">เปิดฐานข้อมูลไม่สำเร็จ: {dbError}</p>
      </main>
    );
  }

  if (loading || !game.current) {
    return (
      <main className="mx-auto max-w-[1180px] px-4 pt-20 text-center">
        <p className="font-mono text-[12px] uppercase tracking-[3px] text-brass/80">
          กำลังเปิดห้องแฟ้ม…
        </p>
      </main>
    );
  }

  const done = game.solved.length;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow m-0">แฟ้มคดีลอสโซรานเจลิส</p>
          <h1 className="m-0 font-[var(--font-display)] text-[22px] text-manila">
            กองสืบสวน แผนกคดีจิ๊บจ๊อย
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-brass">
            ปิดคดีแล้ว {done}/{cases.length}
          </span>
          <Link className="btn btn-ghost" href="/">
            ← หน้าแรก
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(340px,420px)_1fr]">
        <CasePanel
          cases={cases}
          current={game.current}
          caseIndex={game.caseIndex}
          setCaseIndex={game.setCaseIndex}
          isSolved={game.isSolved}
          submit={game.submit}
          board={board}
          names={names}
          onSolved={() => setView("files")}
        />

        <section className="space-y-3">
          <div className="flex gap-1.5">
            <button
              className="view-tab"
              data-active={view === "files"}
              onClick={() => setView("files")}
            >
              🗄️ ห้องแฟ้ม
            </button>
            <button
              className="view-tab"
              data-active={view === "board"}
              onClick={() => setView("board")}
            >
              📌 กระดานผังคดี
              {board.cards.length > 0 && <span className="badge">{board.cards.length}</span>}
            </button>
          </div>

          {view === "files" ? (
            <>
              <QueryPanel
                query={query}
                setQuery={setQuery}
                tools={game.tools}
                justUnlocked={game.justUnlocked}
                hinted={game.current.tables}
                distinct={distinct}
              />
              <ResultTable
                query={query}
                setQuery={setQuery}
                result={result}
                error={error}
                tools={game.tools}
                sql={sql}
                onPin={pin}
                pinnedRows={pinnedRows}
              />
            </>
          ) : (
            <EvidenceBoard board={board} setBoard={setBoard} />
          )}
        </section>
      </div>
    </main>
  );
}
