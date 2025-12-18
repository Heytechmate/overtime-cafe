import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

export function useFacilityStatus(docId: string) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listens to the 'facilities' collection in real-time
    const unsub = onSnapshot(doc(db, "facilities", docId), (doc) => {
      if (doc.exists()) {
        setStatus(doc.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [docId]);

  return { status, loading };
}