import type { Metadata } from "next";
import GameBoardClient from "@/components/GameBoardClient";

export const metadata: Metadata = {
  title: "เล่นเกม — แฟ้มคดีลอสโซรานเจลิส",
};

export default function PlayPage() {
  return <GameBoardClient />;
}
