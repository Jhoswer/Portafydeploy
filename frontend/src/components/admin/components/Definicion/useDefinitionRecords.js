import { useEffect, useState } from "react";
import { getDefinitionRecords } from "../../../../services/definitionService";

export default function useDefinitionRecords(catalog) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecords() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getDefinitionRecords(catalog);
        if (isMounted) setRecords(data);
      } catch (requestError) {
        if (isMounted) setError(requestError.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecords();

    return () => {
      isMounted = false;
    };
  }, [catalog]);

  return { records, isLoading, error };
}
