// app/messages/page.tsx
import { Suspense } from "react";
import MessagesContent from "./MessagesContent";

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}